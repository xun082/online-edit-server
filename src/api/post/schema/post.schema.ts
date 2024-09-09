import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

@Schema()
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [String] })
  images: string[];

  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @Prop({ type: String })
  location: string;

  @Prop({ default: getCurrentTimestamp })
  createdAt: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<Post>;
