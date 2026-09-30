export type ErrorCategory =
  | 'validation'
  | 'database'
  | 'filesystem'
  | 'ocr'
  | 'ai'
  | 'network'
  | 'authentication'
  | 'backup'
  | 'encryption'
  | 'unknown';

const messages: Record<ErrorCategory, string> = {
  validation: 'Some information needs attention. Please check your input.',
  database: 'Your local data could not be loaded. Please try again.',
  filesystem: 'The file could not be accessed. Please try again.',
  ocr: 'Text could not be read from this document. You can review it manually.',
  ai: 'Document analysis is temporarily unavailable. Please try again.',
  network: 'The network request failed. Check your connection and try again.',
  authentication: 'Authentication was not completed. Please try again.',
  backup: 'The backup operation failed. Your local data is unchanged.',
  encryption: 'Encrypted data could not be opened. Check your device security settings.',
  unknown: 'Something went wrong. Please try again.',
};

export class AppError extends Error {
  readonly category: ErrorCategory;
  readonly retryable: boolean;
  readonly cause?: unknown;

  constructor(
    category: ErrorCategory,
    message = messages[category],
    options?: { retryable?: boolean; cause?: unknown },
  ) {
    super(message);
    this.name = 'AppError';
    this.category = category;
    this.retryable = options?.retryable ?? ['network', 'ai', 'ocr', 'backup'].includes(category);
    this.cause = options?.cause;
  }
}

export function toAppError(cause: unknown, fallback: ErrorCategory = 'unknown') {
  if (cause instanceof AppError) return cause;
  if (cause instanceof Error && /network|fetch|timeout|offline/i.test(cause.message)) {
    return new AppError('network', undefined, { cause, retryable: true });
  }
  return new AppError(fallback, undefined, { cause });
}

export function userErrorMessage(cause: unknown, fallback: ErrorCategory = 'unknown') {
  return toAppError(cause, fallback).message;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: { attempts?: number; delayMs?: number },
) {
  const attempts = Math.max(1, options?.attempts ?? 3);
  const delayMs = options?.delayMs ?? 250;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || (error instanceof AppError && !error.retryable)) throw error;
      // Keep this package runtime-neutral (it is shared by Bun, Node and React Native).
      // Consumers can add scheduling around the operation when they need backoff timing.
      if (delayMs * attempt > 0) await Promise.resolve();
    }
  }
  throw lastError;
}
