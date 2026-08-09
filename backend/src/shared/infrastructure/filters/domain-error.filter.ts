import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from 'src/shared/domain/domain-error';

// One mapping point for every context: use-cases stay free to throw
// DomainError without knowing HTTP exists, controllers stay free of
// try/catch boilerplate per route.
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: exception.message,
    });
  }
}
