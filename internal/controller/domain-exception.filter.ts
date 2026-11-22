import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../domain/errors';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof DomainError) {
      switch (exception.code) {
        case 'INVALID_INPUT':
          return res.status(HttpStatus.BAD_REQUEST).json({
            error: exception.message,
            code: exception.code,
          });
        case 'NOT_FOUND':
          return res.status(HttpStatus.NOT_FOUND).json({
            error: exception.message,
            code: exception.code,
          });
        case 'CONFLICT':
        case 'ALREADY_EXISTS':
          return res.status(HttpStatus.CONFLICT).json({
            error: exception.message,
            code: exception.code,
          });
      }
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
    });
  }
}