import { Injectable } from '@nestjs/common';
import * as Y from 'yjs';
import { Cron } from '@nestjs/schedule';

import { CollaborateDocService } from '../collaborate-doc/collaborate-doc.service';

import { RedisService } from '@/common/redis/redis.service';

const getDocKey = (docName: string) => `doc:${docName}`;

@Injectable()
export class CacheStoreService {
  constructor(
    private readonly redisService: RedisService,
    private readonly collaborateDocService: CollaborateDocService,
  ) {}

  async storeDoc(docName: string, doc: Uint8Array) {
    const key = getDocKey(docName);
    const storedDoc = await this.getDoc(docName);

    let updatedDoc: Uint8Array[];

    if (storedDoc) {
      updatedDoc = [...storedDoc, doc];
    } else {
      updatedDoc = [doc];
    }

    const base64Docs = updatedDoc.map((d) => Buffer.from(d).toString('base64'));
    await this.redisService.set(key, JSON.stringify(base64Docs));
  }

  async getDoc(docName: string) {
    const key = getDocKey(docName);
    const jsonDoc = (await this.redisService.get(key)) as string;
    if (!jsonDoc) return null;

    const base64Docs = JSON.parse(jsonDoc);

    return base64Docs.map((d) => new Uint8Array(Buffer.from(d, 'base64')));
  }

  // @Cron('0 */1 * * * *')
  async persistDoc() {
    try {
      const docKeys = await this.getAllDocKeys();

      console.log('docKeys', docKeys);

      if (docKeys.length === 0) {
        return;
      }

      console.log('start persistDoc');

      const docs = await this.redisService.mget(docKeys);

      // 处理文档持久化任务的数组
      const persistTasks = docKeys.map(async (key, index) => {
        const docName = key.replace('doc:', ''); // 提取 docName
        const base64Docs = JSON.parse(docs[index]); // 从 Redis 获取的 base64 编码的文档数据
        const docUpdates = base64Docs.map((d) => new Uint8Array(Buffer.from(d, 'base64')));

        const ydoc = new Y.Doc();

        // 合并所有的更新

        ydoc.transact(() => {
          docUpdates.forEach((update) => {
            Y.applyUpdate(ydoc, update);
          });
        });

        const ytext = ydoc.getText('monaco');
        console.log("Y.Text 'monaco' exists:", !!ytext); // 检查共享对象是否存在
        console.log('Text content after updates:', ytext ? ytext.toString() : 'No content');

        // 持久化合并后的文档到 MongoDB
        const persistedDoc = Y.encodeStateAsUpdate(ydoc);

        await this.collaborateDocService.storeUpdate(docName, persistedDoc);

        // 返回删除 Redis 缓存的任务
        return key;
      });

      // 等待所有持久化任务完成
      const keysToDelete = await Promise.all(persistTasks);

      // 批量删除 Redis 中的缓存
      if (keysToDelete.length > 0) {
        await this.redisService.del(keysToDelete);
      }
    } catch (error) {
      console.log('persistDoc err', error);
    }
  }

  async getAllDocKeys() {
    return await this.redisService.scanKeys('doc:*');
  }
}
