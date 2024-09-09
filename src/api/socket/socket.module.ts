import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatService } from './services/chat.service';
import { SocketGateway } from './socket.gateway';
import { ConnectionService } from './services/connection.service';
import { AuthModule } from '../auth/auth.module';
import { ChatHistory, ChatHistorySchema } from './schema/chat-history.schema';
import {
  OfflineNotification,
  OfflineNotificationSchema,
} from './schema/offline-notification.schema';
import { OfflineNotificationService } from './services/offline-notification.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ChatHistory.name, schema: ChatHistorySchema, collection: 'chat_history' },
      {
        name: OfflineNotification.name,
        schema: OfflineNotificationSchema,
        collection: 'offline-notification',
      },
    ]),
  ],
  providers: [SocketGateway, ChatService, ConnectionService, OfflineNotificationService],
})
export class SocketModule {}
