import { ApiResponse } from '@/lib/types/api';
import { ApiError } from '@/lib/errors/api-error';

const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  413: 'Upload too large. Reduce image count/size (max 5MB per file) or ask ops to raise nginx client_max_body_size.',
  429: 'Too many requests, please try again later.',
  503: 'Service unavailable',
};

function normalizeErrorMessage(status: number, text: string): string {
  if (status === 413 || /413|Request Entity Too Large/i.test(text)) {
    return DEFAULT_ERROR_MESSAGES[413]!;
  }
  if (/<html/i.test(text)) {
    return DEFAULT_ERROR_MESSAGES[status] ?? `Request failed (${status})`;
  }
  return text.trim() || DEFAULT_ERROR_MESSAGES[status] || 'Request failed';
}

export async function readApiResponse(response: Response): Promise<{
  text: string;
  json: ApiResponse | null;
}> {
  const text = await response.text();

  if (!text.trim()) {
    return { text: '', json: null };
  }

  try {
    return { text, json: JSON.parse(text) as ApiResponse };
  } catch {
    return { text, json: null };
  }
}

export async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const { text, json } = await readApiResponse(response);

  if (json) {
    if (!response.ok || !json.success) {
      throw new ApiError(
        json.message ?? DEFAULT_ERROR_MESSAGES[response.status] ?? 'Request failed',
        response.status,
        json.error?.details,
      );
    }

    return json as ApiResponse<T>;
  }

  const fallbackMessage = normalizeErrorMessage(response.status, text);

  throw new ApiError(fallbackMessage, response.status);
}
