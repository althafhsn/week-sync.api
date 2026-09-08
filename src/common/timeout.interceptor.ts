import { CallHandler, ExecutionContext, Injectable, NestInterceptor, RequestTimeoutException } from '@nestjs/common';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';

export const REQUEST_TIMEOUT_MS = 30_000;

/** Applied globally in main.ts so no endpoint can hang past 30s — a slow or
 * stuck downstream call (Prisma, an external service) gets cut off with a
 * 408 instead of leaving the client and its connection waiting forever. */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((error: unknown) => {
        if (error instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request timed out'));
        }
        return throwError(() => error);
      }),
    );
  }
}
