import { expect, test } from 'bun:test';
import { buildApp } from './app';

test('GET /health returns the health contract', async () => {
  const app = buildApp();
  try {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toEqual({ status: 'ok' });
  } finally {
    await app.close();
  }
});
