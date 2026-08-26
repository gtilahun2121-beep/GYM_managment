import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: any = {
      success: false,
      error: {
        code:
          typeof exceptionResponse === 'object' &&
          'error' in exceptionResponse
            ? exceptionResponse['error']
            : 'ERROR',
        message: exception.message,
        requestId: request.id
      }
    };

    if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      const message = exceptionResponse['message'];
      if (Array.isArray(message)) {
        errorResponse.error.details = message;
      }
    }

    this.logger.error(
      `[${request.method}] ${request.path} - Status: ${status} - Message: ${exception.message}`
    );

    response.status(status).json(errorResponse);
  }
}
