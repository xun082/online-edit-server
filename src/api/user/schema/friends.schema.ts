import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

@Schema()
export class Friends {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  user_id: Types.ObjectId; // 当前用户的ID

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  friend_id: Types.ObjectId; // 好友的用户ID

  @Prop({ default: getCurrentTimestamp })
  createdAt: number;

  @Prop({ default: '' })
  userRemark: string; // userId 对 friendId 的备注名

  @Prop({ default: '' })
  friendRemark: string; // friendId 对 userId 的备注名
}

export const FriendsSchema = SchemaFactory.createForClass(Friends);
export type FriendsDocument = HydratedDocument<Friends>;

// 添加唯一性索引，确保同一对用户只能有一条好友关系
FriendsSchema.index({ userId: 1, friendId: 1 }, { unique: true });
