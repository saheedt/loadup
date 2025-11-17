import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should format HttpException with proper structure', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    } as unknown as ArgumentsHost;

    const exception = new HttpException(
      'Validation failed',
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Validation failed',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          details: expect.anything(),
        }),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
        path: '/api/v1/jobs',
      }),
    );
  });

  it('should handle 404 Not Found exception', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs/123',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Job not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Job not found',
        path: '/api/v1/jobs/123',
      }),
    );
  });

  it('should handle exception with object response', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });

    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });

    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exceptionResponse = {
      message: ['title should not be empty', 'location is required'],
      error: 'Bad Request',
    };
    const exception = new HttpException(
      exceptionResponse,
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: {
          details: exceptionResponse,
        },
      }),
    );
  });
});

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    }).compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Test error',
      }),
    );
  });

  it('should handle unknown exceptions as 500', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: {
          details: {
            message: 'Unexpected error',
          },
        },
      }),
    );
  });

  it('should handle non-Error exceptions', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = 'string error';

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: {
          details: {
            message: 'Unknown error',
          },
        },
      }),
    );
  });

  it('should handle JSON request body exceptions', () => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    const mockGetResponse = jest.fn().mockReturnValue({
      status: mockStatus,
    });
    const mockGetRequest = jest.fn().mockReturnValue({
      url: '/api/v1/jobs',
    });
    const mockHttpArgumentsHost = {
      getResponse: mockGetResponse,
      getRequest: mockGetRequest,
    };
    const mockArgumentsHost = {
      switchToHttp: () => mockHttpArgumentsHost,
    } as unknown as ArgumentsHost;

    const exception = new Error('JSON');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid JSON format',
        error: {},
      }),
    );
  });
});
