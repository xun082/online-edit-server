import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis, { ClientContext, Result } from 'ioredis';

import { ObjectType } from '../types';
import { isObject } from '../../utils';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  onModuleDestroy(): void {
    this.redisClient.disconnect();
  }

  /**
   * @Description: 设置值到redis中
   * @param {string} key
   * @param {any} value
   * @return {*}
   */
  public async set(key: string, value: unknown): Promise<Result<'OK', ClientContext>>;

  public async set(
    key: string,
    value: unknown,
    second: number,
  ): Promise<Result<'OK', ClientContext>>;

  public async set(key: string, value: any, second?: number): Promise<Result<'OK', ClientContext>> {
    value = isObject(value) ? JSON.stringify(value) : value;

    if (!second) {
      return await this.redisClient.set(key, value);
    } else {
      return await this.redisClient.set(key, value, 'EX', second);
    }
  }

  /**
   * @Description: 设置自动 +1
   * @param {string} key
   * @return {*}
   */
  public async incr(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.incr(key);
  }

  /**
   * @Description: 设置获取redis缓存中的值
   * @param key {String}
   */
  public async get(key: string): Promise<Result<string | null, ClientContext>> {
    try {
      const data = await this.redisClient.get(key);

      if (data) {
        return data;
      } else {
        return null;
      }
    } catch (e) {
      return await this.redisClient.get(key);
    }
  }

  /**
   * @Description: 根据key删除redis缓存数据
   * @param {string} key
   * @return {*}
   */
  public async del(key: string): Promise<Result<number, ClientContext>> {
    return await this.redisClient.del(key);
  }

  async hset(key: string, field: ObjectType): Promise<Result<number, ClientContext>> {
    return await this.redisClient.hset(key, field);
  }

  /**
   * @Description: 获取单一个值
   * @param {string} key
   * @param {string} field
   * @return {*}
   */
  async hget(key: string, field: string): Promise<Result<string | null, ClientContext>> {
    return await this.redisClient.hget(key, field);
  }

  /**
   * @Description: 获取全部的hget的
   * @param {string} key
   * @return {*}
   */
  async hgetall(key: string): Promise<Result<Record<string, string>, ClientContext>> {
    return await this.redisClient.hgetall(key);
  }

  /**
   * @Description: 清空redis的缓存
   * @return {*}
   */
  public async flushall(): Promise<Result<'OK', ClientContext>> {
    return await this.redisClient.flushall();
  }

  async saveOfflineNotification(userId: string, notification: any): Promise<void> {
    await this.redisClient.lpush(`offline_notifications:${userId}`, JSON.stringify(notification));
  }

  async getOfflineNotifications(userId: string): Promise<any[]> {
    const notifications = await this.redisClient.lrange(`offline_notifications:${userId}`, 0, -1);
    await this.redisClient.del(`offline_notifications:${userId}`);

    return notifications.map((notification) => JSON.parse(notification));
  }
}
