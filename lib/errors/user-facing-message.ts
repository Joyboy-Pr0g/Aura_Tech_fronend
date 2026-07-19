const NEXTJS_SANITIZED_ERROR =
  /An error occurred in the Server Components render|digest property is included|omitted in production builds/i;

export function shouldShowErrorDetails(): boolean {
  return process.env.NODE_ENV === 'development';
}

/** Only shown in development — never expose Next.js production placeholders to users. */
export function getDevErrorMessage(error: Error): string | undefined {
  if (!shouldShowErrorDetails()) return undefined;
  const message = error.message?.trim();
  if (!message || NEXTJS_SANITIZED_ERROR.test(message)) return undefined;
  return message;
}
