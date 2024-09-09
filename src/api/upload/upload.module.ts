import { Module } from '@nestjs/common';

import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';

import { MinioModule } from '@/common/minio/minio.module';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  imports: [MinioModule],
})
export class UploadModule {}
