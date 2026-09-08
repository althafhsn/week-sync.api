import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { REQUEST_TIMEOUT_MS, TimeoutInterceptor } from './common/timeout.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // Two layers, both 30s: the interceptor bounds how long a request handler
  // (including any Prisma/downstream call) may run before returning a 408;
  // the underlying server timeout bounds socket inactivity as a fallback for
  // anything that could hang below the interceptor (e.g. a stalled request body).
  app.useGlobalInterceptors(new TimeoutInterceptor());

  const corsOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  const server = await app.listen(process.env.PORT ?? 3000);
  server.setTimeout(REQUEST_TIMEOUT_MS);
}
bootstrap();
