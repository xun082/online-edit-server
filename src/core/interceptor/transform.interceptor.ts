import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getReasonPhrase } from 'http-status-codes';

import { getCurrentTimestamp } from '@/utils';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    // 获取Fastify的响应对象
    const response: FastifyReply = context.switchToHttp().getResponse<FastifyReply>();

    return next.handle().pipe(
      map((data: any) => {
        // 检查数据是否已经是格式化过的响应
        const isSkip: boolean = this.checkSkipTransform(response);

        if (isSkip) {
          return data;
        }

        // 获取响应状态码，如果没有则默认200
        const statusCode = response.statusCode || 200;
        // 获取对应状态码的标准消息
        const message = getReasonPhrase(statusCode);

        // 设置响应状态码
        response.status(statusCode);

        // 构造标准响应格式
        return {
          code: statusCode,
          message: data?.message || message,
          data: (data?.data ? data.data : data) ?? null,
          timestamp: getCurrentTimestamp(),
        };
      }),
    );
  }

  // 检查是否应跳过转换
  checkSkipTransform(response: FastifyReply): boolean {
    // 过滤掉监控暴露的接口
    return response.request.url.includes('/metrics');
  }
}
