export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: {
    details?: any;
  };
  timestamp: string;
  path: string;
}
