import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { getCurrentTimestamp } from '@/utils';

@Schema()
export class OfflineNotification {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  notification: string;

  @Prop({ default: getCurrentTimestamp })
  createdAt: number;
}

export const OfflineNotificationSchema = SchemaFactory.createForClass(OfflineNotification);
export type OfflineNotificationDocument = HydratedDocument<OfflineNotification>;
