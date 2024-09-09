import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema()
export class MessageReadStatus {
  @Prop({ type: Types.ObjectId, ref: 'ChatHistory', required: true })
  messageId: Types.ObjectId; // 消息ID

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // 用户ID

  @Prop({ default: false })
  isRead: boolean; // 是否已读
}

export const MessageReadStatusSchema = SchemaFactory.createForClass(MessageReadStatus);
export type MessageReadStatusDocument = HydratedDocument<MessageReadStatus>;
