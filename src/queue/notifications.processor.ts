import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

interface ProductCreatedJob {
  productId: string;
  productName: string;
  createdBy: string;
}

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  @Process('product-created')
  async handleProductCreated(job: Job<ProductCreatedJob>) {
    this.logger.log(
      `[Job #${job.id}] Processing notification for "${job.data.productName}" by ${job.data.createdBy}`,
    );
    await new Promise((r) => setTimeout(r, 500));
    this.logger.log(`[Job #${job.id}] Notification sent`);
    return { sent: true };
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Job #${job.id} (${job.name}) completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job #${job.id} FAILED after ${job.attemptsMade} attempts — ${err.message}`,
    );
  }
}
