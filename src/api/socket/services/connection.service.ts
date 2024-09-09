import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

import { ChatService } from './chat.service';
import { OfflineNotificationService } from './offline-notification.service';

import { AuthService } from '@/api/auth/auth.service';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly authService: AuthService,
    private readonly chatService: ChatService,

    private readonly offlineNotificationService: OfflineNotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    if (token) {
      const user = this.authService.jwtVerify(token.split(' ')[1]);

      if (!user) {
        client.disconnect(true);

        return;
      }

      client.data.user = user;

      // 发送离线消息并删除
      const offlineMessages = await this.offlineNotificationService.getOfflineNotifications(
        user.email,
      );

      for (const message of offlineMessages) {
        if (message.type === 'friendRequest') {
          client.emit('notification', message);
        } else {
          client.emit('privateMessage', {
            from: message.from,
            message: message.message,
            type: message.type,
          });
        }
      }

      // 发送未读的即时消息
      const unreadMessages = await this.chatService.findUnreadMessagesForUser(user.id);
      unreadMessages.forEach((message) => {
        client.emit('privateMessage', {
          from: message.senderId,
          message: message.content,
          type: message.type, // 包含消息类型
        });
      });

      await this.chatService.markMessagesAsReadForUser(user.id);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {}

  private disconnect(socket: Socket, error: HttpException) {
    socket.emit('error', error);
    socket.disconnect();
    socket.rooms.clear();
  }
}
