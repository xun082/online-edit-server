import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

import { User, UserSchema } from '../user/schema/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './auth.strategy';
import { UserModule } from '../user/user.module';

import { jwtConstants } from '@/utils';
import { RedisModule } from '@/common/redis/redis.module';
import { EmailModule } from '@/common/email/email.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'user' }]),
    JwtModule.registerAsync({
      useFactory: async () => ({
        global: true,
        secret: jwtConstants.secret,
        signOptions: {
          expiresIn: '77d',
        },
      }),
    }),
    RedisModule,
    EmailModule,
    HttpModule,
    UserModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
