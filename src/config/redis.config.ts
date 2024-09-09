import { ConfigService } from '@nestjs/config';

import { RedisConfigEnum } from '../common/enum/config.enum';

export default (configService: ConfigService) => ({
  port: parseInt(configService.get(RedisConfigEnum.REDIS_PORT)),
  host: configService.get(RedisConfigEnum.REDIS_HOST),
  password: configService.get(RedisConfigEnum.REDIS_PASSWORD),
  db: configService.get(RedisConfigEnum.REDIS_DB),
});
