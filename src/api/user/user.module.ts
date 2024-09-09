import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schema/user.schema';
import { FriendRequest, FriendRequestSchema } from './schema/friend-request.schema';
import { Friends, FriendsSchema } from './schema/friends.schema';

import { RedisModule } from '@/common/redis/redis.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema, collection: 'user' },
      { name: FriendRequest.name, schema: FriendRequestSchema, collection: 'friend_request' },
      { name: Friends.name, schema: FriendsSchema, collection: 'friends' },
    ]),

    RedisModule,
  ],
  exports: [UserService],
})
export class UserModule {}
