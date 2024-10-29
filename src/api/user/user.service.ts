import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';

import { User, UserDocument } from './schema/user.schema';
import {
  FindUserByEmailDto,
  UpdateUserDto,
  UserDto,
  UserWithFriendStatusDto,
  createUserDto,
} from './dto/user.dto';
import {
  CreateFriendRequestDto,
  FriendRequestDto,
  UpdateFriendRequestStatusDto,
} from './dto/send-friend-request.dto';
import { FriendRequest, FriendRequestDocument } from './schema/friend-request.schema';
import { Friends, FriendsDocument } from './schema/friends.schema';
import { FriendDetailsDto } from './dto/friend';

import { FriendRequestEvent } from '@/core/events/friend-request.events';
import { RedisService } from '@/common/redis/redis.service';
import { ValidationException } from '@/core/exceptions/validation.exception';
import { ResponseDto } from '@/common/dto/response.dto';
import { SocketKeys } from '@/common/enum/socket';
import { getCurrentTimestamp } from '@/utils';
import { FriendRequestStatus } from '@/common/types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequestDocument>,
    @InjectModel(Friends.name) private friendModel: Model<FriendsDocument>,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getUserInfo(currentUserId: string, userId?: string): Promise<UserWithFriendStatusDto> {
    const targetUserId = userId || currentUserId;

    const user = await this.userModel
      .findOne({ _id: targetUserId })
      .select('-password')
      .lean()
      .exec();

    const isFriend =
      targetUserId === currentUserId
        ? true
        : await this.areUsersFriends(currentUserId, targetUserId);

    return {
      ...user,
      isFriend,
    };
  }

  async areUsersFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await this.friendModel
      .findOne({
        $or: [
          { user_id: userId1, friend_id: userId2 },
          { user_id: userId2, friend_id: userId1 },
        ],
      })
      .exec();

    return !!friendship;
  }

  async findUserByEmail({ email }: FindUserByEmailDto): Promise<ResponseDto<UserDto | null>> {
    const data = (await this.userModel
      .findOne({ email })
      .select('-password')
      .lean()
      .exec()) as ResponseDto<UserDto>;

    if (data) {
      return data;
    }

    return null;
  }

  async createUserByEmail(data: createUserDto, isLoginType?: boolean) {
    const { email, code, password, confirm_password } = data;

    if (password !== confirm_password) {
      throw new ValidationException('Passwords do not match');
    }

    // 使用 bcrypt 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    if (isLoginType) {
      return await this.createAndSaveUser(email, passwordHash, 'moment');
    }

    const uniqueId = await this.redisService.get(email);

    if (uniqueId !== code) {
      throw new ValidationException('Verification code is incorrect');
    }

    const existingUser = await this.userModel.findOne({ email }).lean().exec();

    if (!existingUser) {
      return await this.createAndSaveUser(email, passwordHash, 'moment');
    }
  }

  private async createAndSaveUser(email: string, password: string, username: string) {
    const user = new this.userModel({
      email,
      password,
      username,
    });

    await user.save();

    user._id = new ObjectId(user._id);

    return {
      _id: new ObjectId(user._id),
      username: user.username,
      email: user.email,
    };
  }

  // 发送好友申请
  async sendFriendRequest(
    senderId: string,
    createFriendRequestDto: CreateFriendRequestDto,
  ): Promise<ResponseDto<void>> {
    const { receiverId } = createFriendRequestDto;

    const senderExists = await this.userModel.exists({ _id: receiverId });

    if (!senderExists) {
      throw new ValidationException('申请的用户不存在');
    }

    const existingFriendship = await this.friendModel
      .findOne({ user_id: senderId, friend_id: receiverId })
      .exec();

    if (existingFriendship) {
      throw new ValidationException('You are already friends with this user');
    }

    const existingRequest = await this.friendRequestModel
      .findOne({
        senderId,
        receiverId,
      })
      .exec();

    if (existingRequest) {
      existingRequest.description = createFriendRequestDto.description;
      existingRequest.createdAt = getCurrentTimestamp();
      await existingRequest.save();

      this.eventEmitter.emit(
        SocketKeys.FRIEND_REQUEST_UPDATED,
        new FriendRequestEvent({
          senderId: new Types.ObjectId(senderId),
          receiverId: new Types.ObjectId(receiverId),
          description: '请求添加好友',
        }),
      );
    } else {
      const friendRequest = new this.friendRequestModel({
        senderId: senderId,
        ...createFriendRequestDto,
      });
      await friendRequest.save();

      this.eventEmitter.emit(
        SocketKeys.FRIEND_REQUEST_CREATED,
        new FriendRequestEvent({
          senderId: new Types.ObjectId(senderId),
          receiverId: new Types.ObjectId(receiverId),
          description: '请求添加好友',
        }),
      );
    }

    return;
  }

  async getFriendRequests(userId: string): Promise<ResponseDto<FriendRequestDto[]>> {
    const data = await this.friendRequestModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .select('-__v')
      .lean()
      .exec();

    const result = plainToInstance(FriendRequestDto, data, {
      enableImplicitConversion: true,
    });

    return { data: result };
  }

  async getFriendsList(userId: string): Promise<FriendDetailsDto[]> {
    const friends = await this.friendModel
      .find({
        $or: [{ user_id: userId }, { friend_id: userId }],
      })
      .select('user_id friend_id createdAt userRemark friendRemark')
      .lean()
      .exec();

    const friendIds = friends.map((friend) =>
      friend.user_id.toString() === userId ? friend.friend_id : friend.user_id,
    );

    const users = await this.userModel
      .find({ _id: { $in: friendIds } })
      .select('email username avatar')
      .lean()
      .exec();

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    const result = friends
      .map((friend) => {
        const friendId = friend.user_id.toString() === userId ? friend.friend_id : friend.user_id;
        const remark =
          friend.user_id.toString() === userId ? friend.friendRemark : friend.userRemark;

        const user = userMap.get(friendId.toString());

        if (user) {
          return {
            id: friend._id.toString(),
            friendId: friendId.toString(),
            friendEmail: user.email,
            friendUsername: user.username,
            friendRemark: remark,
            createdAt: friend.createdAt,
            avatar: user.avatar,
          };
        }

        return null;
      })
      .filter((friend) => friend !== null);

    return result as FriendDetailsDto[];
  }

  async updateFriendRequestStatus(
    requestId: string,
    updateFriendRequestDto: UpdateFriendRequestStatusDto,
  ): Promise<ResponseDto<void>> {
    const friendRequest = await this.friendRequestModel.findOne({ senderId: requestId }).exec();

    if (!friendRequest) {
      throw new ValidationException('Friend request not found');
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new ValidationException('Friend request is not pending');
    }

    this.eventEmitter.emit(
      SocketKeys.FRIEND_REQUEST_UPDATED,
      new FriendRequestEvent({
        senderId: new Types.ObjectId(requestId),
        receiverId: friendRequest.id,
        description: '我已经通过好友了，我们可以开始交流了',
      }),
    );

    return;
  }

  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: updateUserDto }, { new: true, runValidators: true })
      .exec();

    if (!updatedUser) {
      throw new ValidationException('User not found');
    }

    return;
  }
}
