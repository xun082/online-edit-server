import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

@Schema()
export class User {
  @Prop()
  email: string;

  @Prop()
  username: string;

  @Prop({ default: '123456789' })
  password: string;

  @Prop({ default: 'https://cdn.pixabay.com/photo/2024/07/17/10/25/ocean-8901157_960_720.jpg' })
  avatar: string;

  @Prop({ default: getCurrentTimestamp })
  createdAt: number;

  @Prop({ default: '未知地区' })
  region: string;

  @Prop({ default: '暂无签名' })
  signature: string;

  @Prop({ default: 'https://cdn.pixabay.com/photo/2024/07/17/10/25/ocean-8901157_960_720.jpg' })
  backgroundImage: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;
