import { IsString, IsNotEmpty, IsEmail, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FriendDetailsDto {
  @ApiProperty({ description: '好友关系的ID', type: String })
  @IsNotEmpty()
  @IsMongoId()
  id: string; // 好友关系的ID

  @ApiProperty({ description: '好友的用户ID', type: String })
  @IsNotEmpty()
  @IsMongoId()
  friendId: string; // 好友的用户ID

  @ApiProperty({ description: '好友的电子邮件地址', type: String })
  @IsNotEmpty()
  @IsEmail()
  friendEmail: string; // 好友的电子邮件地址

  @ApiProperty({ description: '好友的用户名', type: String })
  @IsNotEmpty()
  @IsString()
  friendUsername: string; // 好友的用户名

  @ApiProperty({ description: '好友备注，可选字段', required: false, type: String })
  @IsOptional()
  @IsString()
  friendRemark?: string; // 好友备注，可选字段

  @ApiProperty({ description: '好友关系创建时间戳', type: Number })
  @IsNotEmpty()
  @IsString()
  createdAt: number; // 好友关系创建时间戳

  @ApiProperty({ description: '好友的头像URL，可选字段', required: false, type: String })
  @IsOptional()
  @IsString()
  avatar?: string; // 好友的头像URL，可选字段
}
