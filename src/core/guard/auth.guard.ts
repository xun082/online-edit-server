// src/auth/guards/custom-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

import { UserService } from '@/api/user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private usersService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { user?: { sub: string; email: string } }>();
    const headers = request.headers;

    // 获取Authorization头信息
    const authHeader = headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      // 验证JWT令牌并解析用户信息
      const decoded = this.jwtService.verify(token);
      request.user = decoded; // 将用户信息附加到请求对象

      // 检查数据库中是否存在该用户
      const user = await this.usersService.findUserByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return true; // 如果验证通过，返回true
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
