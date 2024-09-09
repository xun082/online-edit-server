import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseFilters } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ChatService } from './services/chat.service';
import { ConnectionService } from './services/connection.service';
import { MessageType } from './schema/chat-history.schema';
import { OfflineNotificationService } from './services/offline-notification.service';
import { CreateOfflineNotificationDto } from './dto/offline-notification.dto';

import { NotificationType } from '@/common/enum/notification-type.enum';
import { FriendRequestEvent } from '@/core/events/friend-request.events';
import { WebsocketExceptionsFilter } from '@/core/filter/WebsocketExceptions.filter';
import { SocketKeys } from '@/common/enum/socket';

@WebSocketGateway(81, {
  namespace: 'event',
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Authorization'],
  },
  transports: ['websocket'],
})
@UseFilters(WebsocketExceptionsFilter)
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();

  // 心跳检测配置
  private readonly HEARTBEAT_INTERVAL = 30000; // 心跳间隔时间（毫秒）
  private readonly HEARTBEAT_TIMEOUT = 60000; // 心跳超时时间（毫秒）
  private heartbeatIntervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly chatService: ChatService,
    private readonly connectionService: ConnectionService,
    private readonly offlineNotificationService: OfflineNotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      await this.connectionService.handleConnection(client);
      // 初始化客户端的心跳数据
      client.data.lastHeartbeat = Date.now();
      this.clients.set(client.id, client);

      if (!this.heartbeatIntervalId) {
        this.startHeartbeatCheck();
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.clients.delete(client.id);
    await this.connectionService.handleDisconnect(client);

    if (this.clients.size === 0 && this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  @SubscribeMessage(SocketKeys.SINGLE_CHAT)
  async handlePrivateMessage(
    @MessageBody() data: { to: string; message: string; type: MessageType },
    @ConnectedSocket() socket: Socket,
  ) {
    const user = socket.data.user;
    await this.chatService.handlePrivateMessage(data, user.id, this.clients);
  }

  @OnEvent(SocketKeys.FRIEND_REQUEST_CREATED)
  async handleFriendRequestEvent(event: FriendRequestEvent) {
    const receiverSocket = this.clients.get(event.receiverId.toHexString());

    if (receiverSocket) {
      receiverSocket.emit('notification', { type: 'friendRequest', data: event });
    } else {
      const createOfflineNotificationDto: CreateOfflineNotificationDto = {
        receiverId: event.receiverId,
        message: {
          senderId: event.senderId,
          content: 'You have a new friend request',
          type: NotificationType.FRIEND_REQUEST,
          createdAt: new Date().toISOString(),
        },
      };
      await this.offlineNotificationService.saveOfflineNotification(createOfflineNotificationDto);
    }
  }

  @OnEvent(SocketKeys.FRIEND_REQUEST_UPDATED)
  async handleFriendRequestUpdatedEvent(event: FriendRequestEvent) {
    await this.chatService.processFriendRequestUpdate(event, this.clients);
  }

  // 处理心跳消息
  @SubscribeMessage(SocketKeys.HEARTBEAT)
  handleHeartbeat(@ConnectedSocket() socket: Socket) {
    // 更新客户端的最后心跳时间
    socket.data.lastHeartbeat = Date.now();
  }

  // 启动心跳检测
  private startHeartbeatCheck() {
    this.heartbeatIntervalId = setInterval(() => {
      this.checkHeartbeat();
    }, this.HEARTBEAT_INTERVAL);
  }

  // 检查心跳状态
  private checkHeartbeat() {
    const now = Date.now();

    this.clients.forEach((socket, clientId) => {
      if (now - socket.data.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
        // 如果超时没有收到心跳，断开连接
        console.log(`Client ${clientId} disconnected due to heartbeat timeout.`);
        socket.disconnect(true);
        this.clients.delete(clientId);
      }
    });
  }
}
