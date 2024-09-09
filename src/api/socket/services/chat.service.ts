import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Socket } from 'socket.io';

import { ChatHistory, ChatHistoryDocument, MessageType } from '../schema/chat-history.schema';
import { CreateChatHistoryDto } from '../dto/create-message.dto';
import { OfflineNotificationService } from './offline-notification.service';
import { CreateOfflineNotificationDto } from '../dto/offline-notification.dto';

import { NotificationType } from '@/common/enum/notification-type.enum';
import { SocketKeys } from '@/common/enum/socket';
import { FriendRequestEvent } from '@/core/events/friend-request.events';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatHistory.name) private readonly chatHistoryModel: Model<ChatHistoryDocument>,
    private readonly offlineNotificationService: OfflineNotificationService,
  ) {}

  /**
   * 创建聊天记录
   * @param createChatHistoryDto - 聊天记录的DTO
   * @returns 创建的聊天记录
   */
  async create(createChatHistoryDto: CreateChatHistoryDto): Promise<ChatHistory> {
    const createdChatHistory = new this.chatHistoryModel(createChatHistoryDto);

    return createdChatHistory.save();
  }

  /**
   * 查找指定用户的未读消息
   * @param userId - 用户ID
   * @returns 未读的聊天记录数组
   */
  async findUnreadMessagesForUser(userId: string): Promise<ChatHistory[]> {
    return this.chatHistoryModel.find({ receiverId: userId, isRead: false }).exec();
  }

  /**
   * 查找指定聊天房间的所有消息
   * @param chatroomId - 聊天房间ID
   * @returns 聊天记录数组
   */
  async findMessagesForChatRoom(chatroomId: string): Promise<ChatHistory[]> {
    return this.chatHistoryModel.find({ chatroomId }).exec();
  }

  /**
   * 标记指定用户的所有消息为已读
   * @param userId - 用户ID
   * @returns void
   */
  async markMessagesAsReadForUser(userId: string): Promise<void> {
    await this.chatHistoryModel.updateMany({ receiverId: userId, isRead: true }).exec();
  }

  /**
   * 标记指定聊天房间的所有消息为已读
   * @param chatroomId - 聊天房间ID
   * @returns void
   */
  async markMessagesAsReadForChatRoom(chatroomId: string): Promise<void> {
    await this.chatHistoryModel.updateMany({ chatroomId, isRead: true }).exec();
  }

  /**
   * 处理私聊消息的发送
   * @param data - 包含接收者、消息内容和消息类型的数据
   * @param userId - 发送者用户ID
   * @param clients - 当前活跃的客户端映射表
   * @returns void
   */
  async handlePrivateMessage(
    data: { to: string; message: string; type: MessageType },
    userId: string,
    clients: Map<string, Socket>,
  ): Promise<void> {
    const targetClient = clients.get(data.to);

    // 存储消息
    await this.create({
      content: data.message,
      senderId: userId,
      receiverId: data.to,
      isRead: false,
      type: data.type,
    });

    if (targetClient) {
      this.notifyClient(
        targetClient,
        {
          from: userId,
          message: data.message,
          type: data.type,
        },
        SocketKeys.SINGLE_CHAT,
      );
    } else {
      await this.saveOfflineNotification(
        new Types.ObjectId(data.to),
        new Types.ObjectId(userId),
        data.message,
        NotificationType.PRIVATE_MESSAGE,
      );
    }
  }

  /**
   * 处理好友请求更新事件
   * @param event - 好友请求事件对象
   * @param clients - 当前活跃的客户端映射表
   * @returns void
   */
  async processFriendRequestUpdate(
    event: FriendRequestEvent,
    clients: Map<string, Socket>,
  ): Promise<void> {
    const senderSocket = clients.get(event.senderId.toString());
    const receiverSocket = clients.get(event.receiverId.toString());

    const notification = { type: 'friendRequestUpdated', data: event };

    // 通知发送者和接收者
    this.notifyClient(senderSocket, notification, SocketKeys.FRIEND_REQUEST_UPDATED);

    if (receiverSocket) {
      this.notifyClient(receiverSocket, notification, SocketKeys.FRIEND_REQUEST_UPDATED);
    } else {
      await this.saveOfflineNotification(
        event.receiverId,
        event.senderId,
        'Your friend request has been updated',
        NotificationType.FRIEND_REQUEST_UPDATED,
      );
    }
  }

  /**
   * 向客户端发送通知
   * @param socket - 目标客户端的Socket
   * @param data - 要发送的数据
   * @param key - 通知的Socket键
   * @returns void
   */
  private notifyClient(socket: Socket | undefined, data: any, key: SocketKeys): void {
    if (socket) {
      socket.emit(key, data);
    }
  }

  /**
   * 保存离线通知
   * @param receiverId - 接收者用户ID
   * @param senderId - 发送者用户ID
   * @param content - 通知内容
   * @param type - 通知类型
   * @returns void
   */
  private async saveOfflineNotification(
    receiverId: Types.ObjectId,
    senderId: Types.ObjectId,
    content: string,
    type: NotificationType,
  ): Promise<void> {
    const createOfflineNotificationDto: CreateOfflineNotificationDto = {
      receiverId,
      message: {
        senderId,
        content,
        type,
        createdAt: new Date().toISOString(),
      },
    };

    await this.offlineNotificationService.saveOfflineNotification(createOfflineNotificationDto);
  }
}
