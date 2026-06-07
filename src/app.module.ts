import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import {
  appConfig, dbConfig, redisConfig, jwtConfig, externalApiConfig,
} from './config/app.config';

import { UserEntity } from './database/user.entity';
import { ProductEntity } from './database/product.entity';

import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { HealthModule } from './modules/health/health.module';
import { HttpClientModule } from './http-client/http-client.module';
import { QueueModule } from './queue/queue.module';

import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ExternalProductsController } from './modules/products/external-products.controller';

@Module({
  imports: [
    // ── Config: load all env namespaces ──
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, redisConfig, jwtConfig, externalApiConfig],
    }),

    // ── Database: TypeORM + PostgreSQL ──
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        entities: [UserEntity, ProductEntity],
        synchronize: config.get('app.nodeEnv') !== 'production', // migrations in prod
        logging: config.get('app.nodeEnv') === 'development',
      }),
    }),

    // ── Cache: Redis (cache-aside pattern) ──
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: 'memory', // swap for redisStore in production
        ttl: 60,
        max: 500,
      }),
    }),

    // ── Rate Limiting: global throttler (60 req/min default) ──
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    // ── Queue: BullMQ backed by Redis ──
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host'),
          port: config.get('redis.port'),
        },
      }),
    }),

    // ── Feature modules ──
    AuthModule,
    ProductsModule,
    HealthModule,
    HttpClientModule,
    QueueModule,
  ],
  controllers: [ExternalProductsController],
  providers: [
    // Global rate-limit guard
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global logging interceptor
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    // Global response envelope
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    // Global error handler
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  // Correlation ID middleware applied to all routes
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
