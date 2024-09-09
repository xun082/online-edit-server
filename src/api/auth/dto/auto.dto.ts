import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendVerificationCodeDto {
  @ApiProperty({
    example: '2042204285@qq.com',
    description: 'The account to send verification code to',
  })
  @IsNotEmpty({ message: '邮箱地址不能为空' })
  @IsString({ message: '事件必须是字符串' })
  account: string;
}

export class VerificationResponseDto {
  @ApiProperty({ example: 'some-uuid', description: 'The verification ID' })
  verificationId: string;
}

export class SendVerificationCodeResponseDto {
  @ApiProperty({ description: '发送状态', example: 'success' })
  status: string;

  @ApiProperty({ description: '验证码有效期（秒）', example: 300 })
  expiresIn: number;
}

export class EmailLoginDto {
  @ApiProperty({ description: 'email账号', example: '2042204285@qq.com' })
  @IsNotEmpty({ message: 'email 不能为空' })
  @IsString({ message: 'email 必须为字符串' })
  @IsEmail({}, { message: 'email 必须是有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString({ message: '验证码必须为字符串' })
  captcha: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌', example: 'your_access_token' })
  @IsNotEmpty({ message: '访问令牌不能为空' })
  @IsString({ message: '访问令牌必须为字符串' })
  access_token: string;

  @ApiProperty({ description: '刷新令牌', example: 'your_refresh_token' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  @IsString({ message: '刷新令牌必须为字符串' })
  refresh_token: string;

  @ApiProperty({ description: '令牌过期时间（秒）', example: 604800 })
  @IsNotEmpty({ message: '令牌过期时间不能为空' })
  @IsNumber({}, { message: '令牌过期时间必须为数字' })
  expiresIn: number;
}
