import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data: T) => {
        const response = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        const statusCode: number = response.statusCode;

        const result: ApiResponse<T> = {
          statusCode,
          message: 'Success',
          data,
        };

        return result;
      }),
    );
  }
}
