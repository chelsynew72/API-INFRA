import { OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
export declare class HttpClientService implements OnModuleInit {
    private readonly httpService;
    private readonly logger;
    private readonly circuitBreaker;
    constructor(httpService: HttpService);
    onModuleInit(): void;
    private setupAxiosRetry;
    private isCircuitOpen;
    private recordSuccess;
    private recordFailure;
    get<T>(url: string): Promise<T>;
    post<T>(url: string, body: unknown): Promise<T>;
}
