import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port');
  const env = config.get<string>('app.nodeEnv');

  // ── Security: HTTP headers ──
  app.use(helmet());

  // ── Performance: gzip compression ──
  app.use(compression());

  // ── CORS: whitelist in production ──
  app.enableCors({
    origin: env === 'production' ? ['https://yourdomain.com'] : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  // ── Global prefix ──
  app.setGlobalPrefix('api/v1');

  // ── Validation: strip unknowns, auto-transform DTOs ──
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,           // auto-cast query params to their DTO types
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger: API documentation ──
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Infrastructure')
      .setDescription(
        'Production-grade NestJS API showcasing: JWT Auth, RBAC, ' +
        'Caching, Rate Limiting, Background Jobs, Axios Retry, Circuit Breaker, ' +
        'Pagination, Correlation IDs, Swagger docs',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth')
      .addTag('Products')
      .addTag('External API (Axios Retry + Circuit Breaker demo)')
      .addTag('Health')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log(`Swagger docs available at http://localhost:${port}/docs`);
  }

  // ── Graceful shutdown ──
  app.enableShutdownHooks();

  await app.listen(port ?? 3000);
  logger.log(`🚀 Server running on http://localhost:${port}/api/v1 [${env}]`);
}

bootstrap();
