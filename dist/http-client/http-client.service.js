"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var HttpClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const axios_retry_1 = __importDefault(require("axios-retry"));
const rxjs_1 = require("rxjs");
let HttpClientService = HttpClientService_1 = class HttpClientService {
    httpService;
    logger = new common_1.Logger(HttpClientService_1.name);
    circuitBreaker = {
        failures: 0,
        threshold: 5,
        timeout: 30_000,
        lastFailureTime: 0,
        state: 'CLOSED',
    };
    constructor(httpService) {
        this.httpService = httpService;
    }
    onModuleInit() {
        this.setupAxiosRetry(this.httpService.axiosRef);
    }
    setupAxiosRetry(instance) {
        (0, axios_retry_1.default)(instance, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: (error) => axios_retry_1.default.isNetworkOrIdempotentRequestError(error) ||
                (error.response != null && error.response.status >= 500 && error.response.status < 600),
            onRetry: (retryCount, error) => {
                this.logger.warn(`Retry attempt #${retryCount} for ${error.config?.url} — reason: ${error.message}`);
            },
        });
    }
    isCircuitOpen() {
        const { state, lastFailureTime, timeout } = this.circuitBreaker;
        if (state === 'OPEN') {
            if (Date.now() - lastFailureTime > timeout) {
                this.circuitBreaker.state = 'HALF_OPEN';
                this.logger.log('Circuit breaker is now HALF_OPEN — testing downstream');
                return false;
            }
            return true;
        }
        return false;
    }
    recordSuccess() {
        this.circuitBreaker.failures = 0;
        this.circuitBreaker.state = 'CLOSED';
    }
    recordFailure() {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailureTime = Date.now();
        if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
            this.circuitBreaker.state = 'OPEN';
            this.logger.error(`Circuit breaker OPEN after ${this.circuitBreaker.failures} failures`);
        }
    }
    async get(url) {
        if (this.isCircuitOpen()) {
            throw new Error(`Circuit breaker OPEN — downstream at ${url} is unavailable`);
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            this.recordSuccess();
            return response.data;
        }
        catch (err) {
            this.recordFailure();
            throw err;
        }
    }
    async post(url, body) {
        if (this.isCircuitOpen()) {
            throw new Error(`Circuit breaker OPEN — downstream at ${url} is unavailable`);
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, body));
            this.recordSuccess();
            return response.data;
        }
        catch (err) {
            this.recordFailure();
            throw err;
        }
    }
};
exports.HttpClientService = HttpClientService;
exports.HttpClientService = HttpClientService = HttpClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], HttpClientService);
//# sourceMappingURL=http-client.service.js.map