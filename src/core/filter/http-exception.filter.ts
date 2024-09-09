import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Counter } from 'prom-client';
import { LoggerService } from 'src/common/logs/logs.service';

import { ErrorResponseDto, RequestDetailsDto } from '@/common/dto/response.dto';
import { getCurrentTimestamp } from '@/utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectMetric('http_exception_total')
    private readonly prometheusCounter: Counter<string>,
    private readonly logger: LoggerService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const { url, method } = request;
    const status = exception.getStatus();

    // 监控异常
    this.prometheusCounter.labels(method, url, status.toString()).inc();

    // 记录错误日志
    this.logger.error(
      {
        message: exception.message,
        timestamp: getCurrentTimestamp(),
        path: url,
        status,
      },
      'http错误',
    );

    // 构建错误响应数据
    const requestDetails: RequestDetailsDto = {
      query: request.query,
      body: request.body,
      params: request.params,
      method: request.method,
      url: request.url,
      timestamp: getCurrentTimestamp(),
      ip: request.ip,
    };

    const errorResponse: ErrorResponseDto = {
      code: status,
      message: exception.message,
      data: requestDetails,
    };

    // 发送异常响应
    response.status(status).send(errorResponse);
  }
}
