import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message: exception.message,
      error: {
        details:
          typeof exceptionResponse === 'object'
            ? exceptionResponse
            : { message: exceptionResponse },
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isJsonParsingError = this.isJsonParsingError(exception);
    const status = this.getStatusCode(exception, isJsonParsingError);
    const message = this.getMessage(exception, isJsonParsingError);
    const errorDetails = this.getErrorDetails(exception, isJsonParsingError);

    const errorResponse: ApiErrorResponse = {
      statusCode: status,
      message,
      error: {
        details: errorDetails,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private isJsonParsingError(exception: unknown): boolean {
    const errorMessage = exception instanceof Error ? exception.message : '';
    return (
      errorMessage.includes('JSON') ||
      errorMessage.includes('Unexpected token') ||
      errorMessage.includes('Expected property name')
    );
  }

  private getStatusCode(
    exception: unknown,
    isJsonParsingError: boolean,
  ): number {
    if (isJsonParsingError) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown, isJsonParsingError: boolean): string {
    if (isJsonParsingError) {
      return 'Invalid JSON format';
    }

    if (exception instanceof HttpException) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorDetails(
    exception: unknown,
    isJsonParsingError: boolean,
  ): { message: string } | undefined {
    if (isJsonParsingError) {
      return undefined;
    }

    if (exception instanceof Error) {
      return { message: exception.message };
    }

    return { message: 'Unknown error' };
  }
}
