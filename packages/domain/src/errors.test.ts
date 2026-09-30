import { describe, expect, test } from 'bun:test';
import { AppError, toAppError, userErrorMessage, withRetry } from './errors';

describe('app errors', () => {
  test('maps failures to safe user messages', () => {
    const error = toAppError(new Error('provider leaked secret'), 'backup');
    expect(error.category).toBe('backup');
    expect(userErrorMessage(error)).toContain('backup');
    expect(userErrorMessage(error)).not.toContain('provider leaked');
  });
  test('retries retryable operations', async () => {
    let calls = 0;
    const value = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw new AppError('network');
        return 'ok';
      },
      { delayMs: 0 },
    );
    expect(value).toBe('ok');
    expect(calls).toBe(3);
  });
});
