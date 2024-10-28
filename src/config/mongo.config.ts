import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { MongoDbConfigEnum, MongoDbUrlEnum } from '../common/enum/config.enum';

export default (configService: ConfigService): MongooseModuleOptions => {
  const dbName = configService.get<string>(MongoDbConfigEnum.MONGODB_DATABASE);

  return {
    uri: configService.get<string>(MongoDbUrlEnum.MONGODB_URL),
    retryAttempts: 2,
    dbName,
  };
};
