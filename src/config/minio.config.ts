import { ConfigService } from '@nestjs/config';

import { MiNiOConfigEnum } from '@/common/enum/config.enum';

interface MiNiOConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
}

export default function loadMiNiOConfig(configService: ConfigService): MiNiOConfig {
  const { MINIO_ACCESS_KEY, MINIO_ENDPOINT, MINIO_PORT, MINIO_SECRET_KEY } = MiNiOConfigEnum;

  return {
    endPoint: configService.get(MINIO_ENDPOINT),
    port: parseInt(configService.get(MINIO_PORT), 10),
    useSSL: false,
    accessKey: configService.get(MINIO_ACCESS_KEY),
    secretKey: configService.get(MINIO_SECRET_KEY),
  };
}
