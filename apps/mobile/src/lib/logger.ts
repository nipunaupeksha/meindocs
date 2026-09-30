import { AppError, toAppError } from '@meindocs/domain';

type LogContext = Record<string, string | number | boolean | undefined>;

function redact(context: LogContext = {}) {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (/text|content|password|secret|key|token|identity|ocr/i.test(key))
        return [key, '[redacted]'];
      return [key, value];
    }),
  );
}

export const logger = {
  info(event: string, context?: LogContext) {
    if (__DEV__) console.info(`[MeinDocs] ${event}`, redact(context));
  },
  warn(event: string, cause?: unknown, context?: LogContext) {
    if (__DEV__)
      console.warn(`[MeinDocs] ${event}`, {
        error: toAppError(cause).category,
        ...redact(context),
      });
  },
  error(event: string, cause?: unknown, context?: LogContext) {
    if (__DEV__)
      console.error(`[MeinDocs] ${event}`, {
        error: toAppError(cause).category,
        ...redact(context),
      });
  },
};

export function safeError(error: unknown, fallback: AppError['category'] = 'unknown') {
  return toAppError(error, fallback);
}
