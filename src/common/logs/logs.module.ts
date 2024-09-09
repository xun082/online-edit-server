import { Module } from '@nestjs/common';

import { LoggerService } from './logs.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LogsModule {}
