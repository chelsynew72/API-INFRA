import type { Job } from 'bull';
interface ProductCreatedJob {
    productId: string;
    productName: string;
    createdBy: string;
}
export declare class NotificationsProcessor {
    private readonly logger;
    handleProductCreated(job: Job<ProductCreatedJob>): Promise<{
        sent: boolean;
    }>;
    onCompleted(job: Job): void;
    onFailed(job: Job, err: Error): void;
}
export {};
