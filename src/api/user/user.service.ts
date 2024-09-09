import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
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
    // 如果 userId 是 undefined，则使用 currentUserId
    const targetUserId = userId || currentUserId;

    // 获取用户信息
    const user = await this.userModel
      .findOne({ _id: targetUserId })
      .select('-password')
      .lean()
      .exec();

    // 检查是否为好友
    const isFriend =
      targetUserId === currentUserId
        ? true // 如果查询的是自己的信息，直接设置为 true
        : await this.areUsersFriends(currentUserId, targetUserId);

    // 返回组合后的数据
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

    console.log(friendship);

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

    // 检查密码和确认密码是否匹配
    if (password !== confirm_password) {
      throw new ValidationException('Passwords do not match');
    }

    // 加密密码
    const passwordEncryption = await argon2.hash(password);

    // 如果是登录类型，直接创建新用户
    if (isLoginType) {
      return await this.createAndSaveUser(email, passwordEncryption, 'moment');
    }

    // 检查验证码是否匹配
    const uniqueId = await this.redisService.get(email);

    if (uniqueId !== code) {
      throw new ValidationException('Verification code is incorrect');
    }

    // 查找是否已有用户
    const existingUser = await this.userModel.findOne({ email }).lean().exec();

    // 如果没有找到用户，创建新用户
    if (!existingUser) {
      return await this.createAndSaveUser(email, passwordEncryption, 'moment');
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
    console.log(senderId);

    const { receiverId } = createFriendRequestDto;

    // 检查要申请的用户是否存在
    const senderExists = await this.userModel.exists({ _id: receiverId });

    if (!senderExists) {
      throw new ValidationException('申请的用户不存在');
    }

    // 检查发送者和接收者是否已经是好友
    const existingFriendship = await this.friendModel
      .findOne({ user_id: senderId, friend_id: receiverId })
      .exec();

    if (existingFriendship) {
      throw new ValidationException('You are already friends with this user');
    }

    // 检查是否已经存在未处理的好友请求
    const existingRequest = await this.friendRequestModel
      .findOne({
        senderId,
        receiverId,
      })
      .exec();

    if (existingRequest) {
      // 更新现有的好友请求
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
      // 创建新的好友请求
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
    // Step 1: 获取好友关系数据，包括 user_id 或 friend_id 为当前用户的关系
    const friends = await this.friendModel
      .find({
        $or: [{ user_id: userId }, { friend_id: userId }],
      })
      .select('user_id friend_id createdAt userRemark friendRemark')
      .lean()
      .exec();

    // Step 2: 提取所有与当前用户相关的用户ID
    const friendIds = friends.map((friend) =>
      friend.user_id.toString() === userId ? friend.friend_id : friend.user_id,
    );

    // Step 3: 查找 friend_id 对应的用户详细信息
    const users = await this.userModel
      .find({ _id: { $in: friendIds } })
      .select('email username avatar')
      .lean()
      .exec();

    // Step 4: 创建一个用户信息映射表
    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    // Step 5: 组合好友记录和用户详细信息
    const result = friends
      .map((friend) => {
        const friendId = friend.user_id.toString() === userId ? friend.friend_id : friend.user_id;
        const remark =
          friend.user_id.toString() === userId ? friend.friendRemark : friend.userRemark;

        const user = userMap.get(friendId.toString());

        if (user) {
          return {
            id: friend._id.toString(), // 将 ObjectId 转换为字符串
            friendId: friendId.toString(), // 将 ObjectId 转换为字符串
            friendEmail: user.email,
            friendUsername: user.username,
            friendRemark: remark,
            createdAt: friend.createdAt,
            avatar: user.avatar,
          };
        }

        return null;
      })
      .filter((friend) => friend !== null); // 过滤掉 null 项

    return result as FriendDetailsDto[];
  }

  // 通过好友验证
  async updateFriendRequestStatus(
    requestId: string,
    updateFriendRequestDto: UpdateFriendRequestStatusDto,
  ): Promise<ResponseDto<void>> {
    const friendRequest = await this.friendRequestModel.findOne({ senderId: requestId }).exec();

    console.log(friendRequest);

    if (!friendRequest) {
      throw new ValidationException('Friend request not found');
    }

    // 检查状态是否合理
    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new ValidationException('Friend request is not pending');
    }

    // await friend.save();

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

  // 修改用户信息
  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto): Promise<void> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateUserDto }, // 使用 $set 只更新传递的字段
        { new: true, runValidators: true }, // new: true 返回更新后的文档，runValidators: true 运行更新的验证器
      )
      .exec();

    if (!updatedUser) {
      throw new ValidationException('User not found');
    }

    return;
  }
}
