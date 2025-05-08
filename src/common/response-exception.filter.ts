import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class ResponseExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let error_code = 500;
    let message = 'something went wrong';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      error_code = status === HttpStatus.INTERNAL_SERVER_ERROR ? 500 : 400;
      if (status !== HttpStatus.INTERNAL_SERVER_ERROR) {
        if (typeof exceptionResponse === 'string') {
          message = exceptionResponse;
        } else if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null &&
          'message' in exceptionResponse
        ) {
          message = (exceptionResponse as any).message;
        }
      }
    }

    console.error('____ERROR !!!!', error_code, exception);
    response.status(error_code).json({
      error_code,
      message,
    });
  }
}
