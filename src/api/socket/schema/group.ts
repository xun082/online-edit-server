import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

@Schema()
export class ChatGroup {
  @Prop({ type: String, required: true })
  name: string; // 群聊名称

  @Prop({ type: Types.ObjectId, required: true })
  ownerId: Types.ObjectId; // 群主的用户ID

  @Prop({ type: [Types.ObjectId], default: [] })
  admins: Types.ObjectId[]; // 群管理员列表

  @Prop({ type: [Types.ObjectId], default: [] })
  members: Types.ObjectId[]; // 群成员列表

  @Prop({ type: String, default: '' })
  description: string; // 群聊描述

  @Prop({ type: String, default: '' })
  announcement: string; // 群公告

  @Prop({ type: Number, default: getCurrentTimestamp })
  createdAt: number; // 创建时间

  @Prop({ type: Number, default: getCurrentTimestamp })
  updatedAt: number; // 最后更新时间
}

export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup);
export type ChatGroupDocument = HydratedDocument<ChatGroup>;
