import { Injectable } from '@nestjs/common';

import { CreateOfflineNotificationDto } from '../dto/offline-notification.dto';

import { RedisService } from '@/common/redis/redis.service';

@Injectable()
export class OfflineNotificationService {
  constructor(private readonly redisService: RedisService) {}

  async saveOfflineNotification(
    createOfflineNotificationDto: CreateOfflineNotificationDto,
  ): Promise<void> {
    const key = `offline_notifications:${createOfflineNotificationDto.receiverId}`;
    const notifications = ((await this.redisService.get(key)) as string) || '[]';
    const parsedNotifications = JSON.parse(notifications);
    parsedNotifications.push(createOfflineNotificationDto.message);
    await this.redisService.set(key, JSON.stringify(parsedNotifications));
  }

  async getOfflineNotifications(receiverId: string): Promise<any[]> {
    const key = `offline_notifications:${receiverId}`;
    const notifications = ((await this.redisService.get(key)) as string) || '[]';
    await this.clearOfflineNotifications(receiverId); // 在获取时删除

    return JSON.parse(notifications);
  }

  async clearOfflineNotifications(receiverId: string): Promise<void> {
    const key = `offline_notifications:${receiverId}`;
    await this.redisService.del(key);
  }
}
