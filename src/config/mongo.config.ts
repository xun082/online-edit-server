import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import { MongoDbConfigEnum } from '../common/enum/config.enum';

export default (configService: ConfigService): MongooseModuleOptions => {
  const host = configService.get<string>(MongoDbConfigEnum.MONGODB_HOST);
  const port = configService.get<number>(MongoDbConfigEnum.MONGODB_PORT);
  const username = configService.get<string>(MongoDbConfigEnum.MONGODB_USERNAME);
  const password = configService.get<string>(MongoDbConfigEnum.MONGODB_PASSWORD);
  const dbName = configService.get<string>(MongoDbConfigEnum.MONGODB_DATABASE);
  const authSource = configService.get<string>(MongoDbConfigEnum.MONGODB_AUTH_SOURCE);

  const uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=${authSource}`;
  console.log(uri);

  return {
    uri: 'mongodb://admin:online@localhost:27017/online?authSource=admin',
    retryAttempts: 2,
    dbName,
  };
};
