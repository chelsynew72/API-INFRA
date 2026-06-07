"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const http_client_service_1 = require("./http-client.service");
let HttpClientModule = class HttpClientModule {
};
exports.HttpClientModule = HttpClientModule;
exports.HttpClientModule = HttpClientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    baseURL: config.get('externalApi.url'),
                    timeout: 5000,
                    headers: { 'Content-Type': 'application/json' },
                }),
            }),
        ],
        providers: [http_client_service_1.HttpClientService],
        exports: [http_client_service_1.HttpClientService],
    })
], HttpClientModule);
//# sourceMappingURL=http-client.module.js.map