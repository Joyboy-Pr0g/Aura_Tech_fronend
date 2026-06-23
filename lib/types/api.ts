export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: { message: string; details?: unknown };
}

export interface PaginatedResult<T> {
  items?: T[];
  orders?: T[];
  payments?: T[];
  total: number;
  page: number;
  limit: number;
}
