"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const config = app.get(config_1.ConfigService);
    const port = config.get('app.port');
    const env = config.get('app.nodeEnv');
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: env === 'production' ? ['https://yourdomain.com'] : '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    if (env !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('API Infrastructure')
            .setDescription('Production-grade NestJS API showcasing: JWT Auth, RBAC, ' +
            'Caching, Rate Limiting, Background Jobs, Axios Retry, Circuit Breaker, ' +
            'Pagination, Correlation IDs, Swagger docs')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('Auth')
            .addTag('Products')
            .addTag('External API (Axios Retry + Circuit Breaker demo)')
            .addTag('Health')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
        logger.log(`Swagger docs available at http://localhost:${port}/docs`);
    }
    app.enableShutdownHooks();
    await app.listen(port ?? 3000);
    logger.log(`🚀 Server running on http://localhost:${port}/api/v1 [${env}]`);
}
bootstrap();
//# sourceMappingURL=main.js.map