import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  EmailLoginDto,
  LoginResponseDto,
  SendVerificationCodeDto,
  SendVerificationCodeResponseDto,
} from './dto/auto.dto';

import { ResponseDto } from '@/common/dto/response.dto';
import { LoginException } from '@/core/exceptions/login.exception';
import { ApiResponseWithDto } from '@/core/decorate/api-response.decorator';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送邮箱验证码' })
  @ApiResponseWithDto(SendVerificationCodeResponseDto, '发送验证码成功', HttpStatus.OK)
  async sendVerificationCode(
    @Body() sendVerificationCodeDto: SendVerificationCodeDto,
  ): Promise<ResponseDto<SendVerificationCodeResponseDto>> {
    try {
      return await this.authService.sendVerificationCode(sendVerificationCodeDto);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.BAD_REQUEST, message: error.message, data: null },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '邮箱验证码登录' })
  @ApiResponseWithDto(LoginResponseDto, '登录成功', HttpStatus.OK)
  async emailLogin(@Body() loginDto: EmailLoginDto): Promise<ResponseDto<LoginResponseDto>> {
    try {
      return await this.authService.emailLogin(loginDto);
    } catch (error) {
      console.log(error);

      if (error instanceof LoginException) {
        throw new HttpException(
          { statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: null },
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal Server Error',
          data: null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
