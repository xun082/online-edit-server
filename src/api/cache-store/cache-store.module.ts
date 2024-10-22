import { forwardRef, Module } from '@nestjs/common';

import { CacheStoreService } from './cache-store.service';
import { CollaborateDocModule } from '../collaborate-doc/collaborate-doc.module';

import { RedisModule } from '@/common/redis/redis.module';

@Module({
  imports: [RedisModule, forwardRef(() => CollaborateDocModule)],
  exports: [CacheStoreService],
  providers: [CacheStoreService],
})
export class CacheStoreModule {}
