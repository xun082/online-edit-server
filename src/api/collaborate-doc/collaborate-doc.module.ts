import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CollaborateDocService } from './collaborate-doc.service';
import { CollaborateDocGateway } from './collaborate-doc.gateway';
import { CollaborateDocController } from './collaborate-doc.controller';
import { CollaborateDoc, CollaborateDocSchema } from './schema/collaborate-doc.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CollaborateDoc.name, schema: CollaborateDocSchema }]),
  ],
  providers: [CollaborateDocService, CollaborateDocGateway],
  exports: [CollaborateDocService],
  controllers: [CollaborateDocController],
})
export class YDocumentModule {}
