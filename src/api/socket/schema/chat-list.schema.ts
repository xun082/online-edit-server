import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatList {
  @Prop({ type: String, enum: ['single', 'group'], required: true })
  chatType: string; // 聊天类型，单聊或群聊

  @Prop({ type: Types.ObjectId, required: true })
  chatId: Types.ObjectId; // 单聊为对方用户ID，群聊为群ID

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId; // 当前用户ID

  @Prop({ type: String, default: '' })
  lastMessage: string; // 最后一条消息内容

  @Prop({ type: Date, default: Date.now })
  lastMessageTime: Date; // 最后一条消息的时间

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, required: true },
        unreadCount: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  unreadCounts: { userId: Types.ObjectId; unreadCount: number }[]; // 不同用户的未读消息数

  @Prop({ type: Boolean, default: false })
  isPinned: boolean; // 是否置顶

  @Prop({ type: Boolean, default: false })
  isMuted: boolean; // 是否静音

  @Prop({ type: [Types.ObjectId], default: [] })
  participants: Types.ObjectId[]; // 参与者ID列表

  @Prop({ type: String, default: '' })
  groupName: string; // 群聊名称（单聊为空）

  @Prop({ type: String, default: '' })
  groupAvatar: string; // 群聊头像（单聊为空）

  @Prop({ type: Types.ObjectId })
  lastSenderId: Types.ObjectId; // 最后一条消息的发送者ID

  @Prop({ type: String, default: '' })
  draft: string; // 未发送的草稿消息

  @Prop({ type: Boolean, default: false })
  isArchived: boolean; // 是否存档
}

export const ChatListSchema = SchemaFactory.createForClass(ChatList);
export type ChatListDocument = HydratedDocument<ChatList>;
