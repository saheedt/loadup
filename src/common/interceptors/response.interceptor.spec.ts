import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();

    interceptor = module.get<ResponseInterceptor<any>>(ResponseInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response with status code, message, and data', (done) => {
    const mockData = { id: '123', name: 'Test' };
    const mockStatusCode = 200;

    const mockResponse = {
      statusCode: mockStatusCode,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({
          statusCode: mockStatusCode,
          message: 'Success',
          data: mockData,
        });
        done();
      },
    });
  });

  it('should handle 201 status code for POST requests', (done) => {
    const mockData = { id: '456', title: 'Created' };
    const mockStatusCode = 201;

    const mockResponse = {
      statusCode: mockStatusCode,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.statusCode).toBe(201);
        expect(value.message).toBe('Success');
        expect(value.data).toEqual(mockData);
        done();
      },
    });
  });

  it('should handle empty response data', (done) => {
    const mockData = {};
    const mockStatusCode = 200;

    const mockResponse = {
      statusCode: mockStatusCode,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value).toEqual({
          statusCode: 200,
          message: 'Success',
          data: {},
        });
        done();
      },
    });
  });

  it('should handle array response data', (done) => {
    const mockData = [{ id: '1' }, { id: '2' }];
    const mockStatusCode = 200;

    const mockResponse = {
      statusCode: mockStatusCode,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
      next: (value) => {
        expect(value.data).toEqual(mockData);
        expect(Array.isArray(value.data)).toBe(true);
        done();
      },
    });
  });
});
