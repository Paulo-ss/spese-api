import { Module } from '@nestjs/common';
import { ExpenseCreatedSubscriber } from './implementations/expense/expense-created.subscriber';
import { DEPENDENCY_INJECTION_PROVIDERS } from 'src/common/constants/constants';
import { ISubscriber } from '../interfaces/subscriber.interface';
import { CashFlowModule } from 'src/cash-flow/cash-flow.module';
import { IBaseMessage } from '../types/messages';
import { ExpenseUpdatedSubscriber } from './implementations/expense/expense-updated.subscriber';
import { ExpenseDeletedSubscriber } from './implementations/expense/expense-deleted.subscriber';

@Module({
    imports: [CashFlowModule],
    providers: [
        ExpenseCreatedSubscriber,
        ExpenseUpdatedSubscriber,
        ExpenseDeletedSubscriber,
        {
            provide: DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS,
            useFactory: (...subscribers: ISubscriber<IBaseMessage>[]) =>
                subscribers,
            inject: [
                ExpenseCreatedSubscriber,
                ExpenseUpdatedSubscriber,
                ExpenseDeletedSubscriber,
            ],
        },
    ],
    exports: [
        {
            provide: DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS,
            useFactory: (...subscribers: ISubscriber<IBaseMessage>[]) =>
                subscribers,
            inject: [
                ExpenseCreatedSubscriber,
                ExpenseUpdatedSubscriber,
                ExpenseDeletedSubscriber,
            ],
        },
    ],
})
export class SubscribersModule {}
