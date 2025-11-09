export type ApiSuccess<T> = {
  success: true;
  data: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
};

export type ApiError = {
  success: false;
  error: { message: string; statusCode: number };
  timestamp: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;


