import { healthResponseSchema } from '@meindocs/schemas';
import Fastify from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import type { z } from 'zod';

export function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.get<{ Reply: z.infer<typeof healthResponseSchema> }>('/health', async () => {
    return healthResponseSchema.parse({ status: 'ok' });
  });

  return app;
}
