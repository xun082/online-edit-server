import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../user/schema/user.schema';

import { jwtConstants } from '@/utils';
import { JwtPayload } from '@/common/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<JwtPayload> {
    const user = await this.userModel.findOne({ _id: payload.sub }).lean().exec();

    if (!user) {
      throw new HttpException('未登录或该用户不存在！请前往登录/注册~', HttpStatus.UNAUTHORIZED);
    }

    return {
      _id: new Types.ObjectId(user._id).toHexString(),
      username: user.username,
      email: user.email,
    };
  }
}
