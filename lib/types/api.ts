export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  next_cursor?: string | null;
  has_more?: boolean;
  error?: { message: string; details?: unknown };
}

export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}
