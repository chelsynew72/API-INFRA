import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HttpClientService implements OnModuleInit {
  private readonly logger = new Logger(HttpClientService.name);
  private readonly circuitBreaker = {
    failures: 0,
    threshold: 5,       // open circuit after 5 consecutive failures
    timeout: 30_000,    // stay open for 30s
    lastFailureTime: 0,
    state: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN',
  };

  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    this.setupAxiosRetry(this.httpService.axiosRef);
  }

  // ── Axios Retry: exponential back-off, retries on network errors & 5xx ──
  private setupAxiosRetry(instance: AxiosInstance) {
    axiosRetry(instance, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,   // 1s, 2s, 4s
      retryCondition: (error) =>
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        (error.response != null && error.response.status >= 500 && error.response.status < 600),
      onRetry: (retryCount, error) => {
        this.logger.warn(
          `Retry attempt #${retryCount} for ${error.config?.url} — reason: ${error.message}`,
        );
      },
    });
  }

  // ── Circuit Breaker: prevents calling a failing downstream service ──
  private isCircuitOpen(): boolean {
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

  private recordSuccess() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.state = 'CLOSED';
  }

  private recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'OPEN';
      this.logger.error(
        `Circuit breaker OPEN after ${this.circuitBreaker.failures} failures`,
      );
    }
  }

  async get<T>(url: string): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new Error(`Circuit breaker OPEN — downstream at ${url} is unavailable`);
    }
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.get<T>(url),
      );
      this.recordSuccess();
      return response.data;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }

  async post<T>(url: string, body: unknown): Promise<T> {
    if (this.isCircuitOpen()) {
      throw new Error(`Circuit breaker OPEN — downstream at ${url} is unavailable`);
    }
    try {
      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.post<T>(url, body),
      );
      this.recordSuccess();
      return response.data;
    } catch (err) {
      this.recordFailure();
      throw err;
    }
  }
}
