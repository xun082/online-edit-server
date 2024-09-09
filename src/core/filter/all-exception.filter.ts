import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import * as requestIp from '@supercharge/request-ip';

import { LoggerService } from '../../common/logs/logs.service';

import { getCurrentTimestamp } from '@/utils';

interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

const getErrorMessage = <T>(exception: T): any => {
  if (exception instanceof HttpException) {
    const errorResponse = exception.getResponse();

    return (errorResponse as HttpExceptionResponse).message || exception.message;
  } else {
    return String(exception);
  }
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const errorMessage = getErrorMessage(exception);
    const errorStackTrace = exception.stack.split('\n');

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let httpStatus: number;

    try {
      httpStatus = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    } catch (e) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const userIp = requestIp.getClientIp(request);
    const responseBody = {
      code: httpStatus,
      message: errorMessage,
      data: {
        query: request.query,
        body: request.body,
        params: request.params,
        method: request.method,
        url: request.url,
        timestamp: getCurrentTimestamp(),
        ip: userIp,
      },
    };
    this.logger.error(
      {
        ...responseBody,
        headers: request.headers,
        stackTrace: errorStackTrace,
      },
      '错误日志',
    );

    httpAdapter.reply(response, responseBody, httpStatus);
  }
}
