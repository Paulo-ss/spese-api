import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from './base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionCreatedMessage } from 'src/async-worker/types/messages';
import { OperationType } from 'src/cash-flow/interfaces/operation-type';

@Injectable()
export class ExpenseUpdatedSubscriber extends BaseSubscriber<ITransactionCreatedMessage> {
  constructor(private readonly cashFlowService: CashFlowService) {
    super();
  }

  get groupName(): GroupName {
    return ASYNC_WORKER.REDIS_GROUPS.EXPENSE_UPDATED;
  }

  get totalConsumers(): number {
    return 2;
  }

  getStreamName(): StreamName {
    return ASYNC_WORKER.REDIS_STREAMS.EXPENSE_UPDATED;
  }

  override async onMessage(expense: ITransactionCreatedMessage): Promise<void> {
    try {
      this.logger.log(
        'Expense update message received! Processing...',
        expense,
      );

      await this.cashFlowService.updateCashFlowForTransaction({
        transaction: expense,
        operation: OperationType.UPDATE,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
