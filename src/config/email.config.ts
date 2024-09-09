import { ConfigService } from '@nestjs/config';

import { EmailConfigEnum } from '../common/enum/config.enum';

export default (configService: ConfigService) => {
  const host = configService.get(EmailConfigEnum.EMAIL_HOST);
  const port = configService.get(EmailConfigEnum.EMAIL_PORT);
  const authUser = configService.get(EmailConfigEnum.EMAIL_AUTH_USER);
  const authPass = configService.get(EmailConfigEnum.EMAIL_AUTH_PASS);

  return {
    host,
    port,
    authUser,
    authPass,
  };
};
