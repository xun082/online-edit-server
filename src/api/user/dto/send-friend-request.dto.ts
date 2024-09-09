import {
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Types } from 'mongoose';

import { FriendRequestStatus } from '@/common/types';

export class CreateFriendRequestDto {
  @IsMongoId({ message: 'Invalid receiver ID' })
  receiverId: string;

  @IsString()
  @Length(10, 500, { message: 'Description must be between 10 and 500 characters' })
  description: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'Remark must be less than 100 characters' })
  remark?: string; // 可选字段：备注信息
}

export class UpdateFriendRequestStatusDto {
  @IsNotEmpty({ message: 'Status is required and cannot be empty' })
  @IsIn([FriendRequestStatus.ACCEPTED, FriendRequestStatus.REJECTED], {
    message: `Status must be one of the following: ${FriendRequestStatus.ACCEPTED}, ${FriendRequestStatus.REJECTED}`,
  })
  status: FriendRequestStatus;

  @IsOptional()
  @IsString({ message: 'Remark must be a string' })
  @MaxLength(500, { message: 'Remark must be at most 500 characters long' })
  remark?: string; // 可选的备注字段
}

export class FriendRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'MongoDB 的 _id 是必填字段' })
  _id: string;

  @IsMongoId()
  @IsNotEmpty({ message: '发起请求的用户ID不能为空' })
  senderId: Types.ObjectId; // 发起请求的用户ID，表示发送好友请求的用户

  @IsMongoId()
  @IsNotEmpty({ message: '接收请求的用户ID不能为空' })
  receiverId: Types.ObjectId; // 接收请求的用户ID，表示接收好友请求的用户

  @IsString()
  @IsNotEmpty({ message: '描述不能为空' })
  @MinLength(10, { message: '描述的长度必须至少为10个字符' })
  @MaxLength(500, { message: '描述的长度不能超过500个字符' })
  description: string; // 请求描述，描述该好友请求的目的或信息，长度必须在10到500个字符之间

  @IsNumber()
  @IsNotEmpty({ message: '创建时间不能为空' })
  createdAt: number; // 创建时间，记录该好友请求的创建时间戳

  @IsEnum(FriendRequestStatus, { message: '状态必须是有效的好友请求状态' })
  @IsNotEmpty({ message: '状态不能为空' })
  status: FriendRequestStatus; // 请求状态，表示好友请求当前的处理状态（例如：PENDING、ACCEPTED、REJECTED）

  @IsString()
  @IsOptional()
  remark?: string; // 备注信息，可选字段，用于记录请求的附加信息或备注，可为空
}
