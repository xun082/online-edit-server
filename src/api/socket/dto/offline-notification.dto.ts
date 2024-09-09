import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsISO8601,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

import { NotificationType } from '@/common/enum/notification-type.enum';

class MessageDto {
  @IsMongoId()
  @IsNotEmpty({ message: 'SenderId is required and must be a valid MongoDB ObjectId' })
  senderId: Types.ObjectId; // 修改为 ObjectId 类型

  @IsString()
  @IsNotEmpty({ message: 'Content is required and cannot be empty' })
  content: string;

  @IsEnum(NotificationType, {
    message: `Type must be one of the following: ${Object.values(NotificationType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Type is required and cannot be empty' })
  type: NotificationType;

  @IsISO8601({}, { message: 'CreatedAt must be a valid ISO 8601 date string' })
  @IsNotEmpty({ message: 'CreatedAt is required and cannot be empty' })
  createdAt: string;
}

export class CreateOfflineNotificationDto {
  @IsMongoId()
  @IsNotEmpty({ message: 'ReceiverId is required and must be a valid MongoDB ObjectId' })
  receiverId: Types.ObjectId; // 修改为 ObjectId 类型

  @ValidateNested({ message: 'Message is required and must be a valid object' })
  @Type(() => MessageDto)
  message: MessageDto;
}
