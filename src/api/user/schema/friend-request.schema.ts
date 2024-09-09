import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';
import { FriendRequestStatus } from '@/common/types';

@Schema()
export class FriendRequest {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId; // 发起请求的用户ID

  @Prop({ type: Types.ObjectId, required: true })
  receiverId: Types.ObjectId; // 接收请求的用户ID

  @Prop({
    type: String,
    required: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [500, 'Description must be at most 500 characters long'],
  })
  description: string;

  @Prop({ type: Number, default: getCurrentTimestamp })
  createdAt: number;

  @Prop({ type: String, enum: FriendRequestStatus, default: FriendRequestStatus.PENDING })
  status: FriendRequestStatus;

  @Prop({ type: String, default: '' })
  remark?: string;
}

export type FriendRequestDocument = FriendRequest & Document;
export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
