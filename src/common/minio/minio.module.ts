import { Global, Module } from '@nestjs/common';
import * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

import { MinioService } from './minio.service';

import loadMiNiOConfig from '@/config/minio.config';

@Global()
@Module({
  providers: [
    {
      provide: 'MINIO_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const minioConfig = loadMiNiOConfig(configService);

        const minioClient = new Minio.Client(minioConfig);

        return minioClient;
      },
      inject: [ConfigService],
    },
    MinioService,
  ],
  exports: [MinioService],
})
export class MinioModule {}
