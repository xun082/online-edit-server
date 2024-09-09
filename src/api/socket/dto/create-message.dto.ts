import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { MessageType } from '../schema/chat-history.schema';

export class CreateChatHistoryDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  chatroomId?: string;

  @IsOptional()
  @IsString()
  sendTime?: string;

  @IsOptional()
  @IsString()
  updateTime?: string;

  @IsOptional()
  isRead?: boolean;

  @IsNotEmpty()
  @IsEnum(MessageType)
  type: MessageType;
}
