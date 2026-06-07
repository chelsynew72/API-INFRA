export declare const appConfig: (() => {
    port: number;
    nodeEnv: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    port: number;
    nodeEnv: string;
}>;
export declare const dbConfig: (() => {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}>;
export declare const redisConfig: (() => {
    host: string;
    port: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    host: string;
    port: number;
}>;
export declare const jwtConfig: (() => {
    secret: string;
    expiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    expiresIn: string;
}>;
export declare const externalApiConfig: (() => {
    url: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    url: string;
}>;
