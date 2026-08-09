import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from 'src/shared/domain/domain-error';
import { DomainErrorFilter } from './domain-error.filter';

describe('DomainErrorFilter', () => {
  it('maps a DomainError to a 400 response with its message', () => {
    const filter = new DomainErrorFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as unknown as Response;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new DomainError('Email already registered'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Email already registered',
    });
  });

  it('carries through a subclass of DomainError with its own message', () => {
    class OutOfStockError extends DomainError {}
    const filter = new DomainErrorFilter();
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status } as unknown as Response;
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;

    filter.catch(new OutOfStockError('Out of stock'), host);

    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Out of stock',
    });
  });
});
