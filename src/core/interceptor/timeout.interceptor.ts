import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { LoggerService } from 'src/common/logs/logs.service';

import { TIMEOUT_INTERCEPTOR } from '@/utils';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly requestTimeout = TIMEOUT_INTERCEPTOR;
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(this.requestTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          this.logger.error(`Request timed out: ${context.switchToHttp().getRequest().url}`);

          return throwError(() => new RequestTimeoutException('Request timeout'));
        }

        return throwError(() => err);
      }),
    );
  }
}
