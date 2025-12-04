import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from './base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import {
  GroupName,
  RedisMessage,
  StreamName,
} from 'src/async-worker/types/messages-definition';
import { v4 } from 'uuid';

@Injectable()
export class ExpenseCreatedSubscriber extends BaseSubscriber {
  get groupName(): GroupName {
    return ASYNC_WORKER.REDIS_GROUPS.EXPENSE_CREATED;
  }

  get consumerName(): string {
    return v4();
  }

  getStreamName(): StreamName {
    return ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED;
  }

  onMessage(
    message: RedisMessage<typeof ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED>,
  ): Promise<void> {
    console.log('Expense created:', message);

    return Promise.resolve();
  }
}
