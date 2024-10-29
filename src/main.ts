import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { fastifyMultipart } from '@fastify/multipart';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppModule } from './app.module';
// import metadata from './metadata';
import { registerFastifyPlugin } from './common/fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ bodyLimit: 50 * 1024 * 1024 }),
    {
      snapshot: true,
    },
  );

  await registerFastifyPlugin(app, fastifyMultipart);

  app.enableCors({
    origin: ['http://localhost:3000', 'https://online-edit-web.vercel.app/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.setGlobalPrefix('api/v1/');

  app.useWebSocketAdapter(new WsAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder().setTitle('接口文档').setVersion('1.0').build();

  /** @see https://github.com/nestjs/swagger/issues/2493 */
  // await SwaggerModule.loadPluginMetadata(metadata);

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'openApiJson',
  });

  await app.listen(8080, '0.0.0.0');
}

bootstrap();
