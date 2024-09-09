import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
}

@Schema()
export class ChatHistory {
  @Prop({ required: true })
  content: string; // 消息内容

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; // 发送者的用户ID

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  receiverId?: Types.ObjectId | null; // 单聊接收者的用户ID，群聊时为null

  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', default: null })
  chatroomId?: Types.ObjectId | null; // 群聊ID，单聊时为null

  @Prop({ default: getCurrentTimestamp })
  sendTime: number; // 发送时间

  @Prop({ default: getCurrentTimestamp })
  updateTime: number; // 更新时间

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy: Types.ObjectId[]; // 已读用户列表

  @Prop({ required: true, enum: MessageType })
  type: MessageType; // 消息类型
}

export const ChatHistorySchema = SchemaFactory.createForClass(ChatHistory);
export type ChatHistoryDocument = HydratedDocument<ChatHistory>;
