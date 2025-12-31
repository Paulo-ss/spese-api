import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from './base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionCreatedMessage } from 'src/async-worker/types/messages';

@Injectable()
export class ExpenseCreatedSubscriber extends BaseSubscriber<ITransactionCreatedMessage> {
  constructor(private readonly cashFlowService: CashFlowService) {
    super();
  }

  get groupName(): GroupName {
    return ASYNC_WORKER.REDIS_GROUPS.EXPENSE_CREATED;
  }

  get totalConsumers(): number {
    return 2;
  }

  getStreamName(): StreamName {
    return ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED;
  }

  override async onMessage(expense: ITransactionCreatedMessage): Promise<void> {
    try {
      this.logger.log('New expense message received! Processing...', expense);

      await this.cashFlowService.updateCashFlowForTransaction(expense);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
