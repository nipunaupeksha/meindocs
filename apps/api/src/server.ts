import { buildApp } from './app';

const app = buildApp({ logger: true });

try {
  await app.listen({
    port: Number(Bun.env.PORT ?? 3000),
    host: Bun.env.HOST ?? '127.0.0.1',
  });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
