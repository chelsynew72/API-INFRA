"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.externalApiConfig = exports.jwtConfig = exports.redisConfig = exports.dbConfig = exports.appConfig = void 0;
const config_1 = require("@nestjs/config");
exports.appConfig = (0, config_1.registerAs)('app', () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
    nodeEnv: process.env.NODE_ENV ?? 'development',
}));
exports.dbConfig = (0, config_1.registerAs)('database', () => ({
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'api_infrastructure',
}));
exports.redisConfig = (0, config_1.registerAs)('redis', () => ({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
}));
exports.jwtConfig = (0, config_1.registerAs)('jwt', () => ({
    secret: process.env.JWT_SECRET ?? 'fallback-secret-change-in-prod',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
}));
exports.externalApiConfig = (0, config_1.registerAs)('externalApi', () => ({
    url: process.env.EXTERNAL_API_URL ?? 'https://jsonplaceholder.typicode.com',
}));
//# sourceMappingURL=app.config.js.map