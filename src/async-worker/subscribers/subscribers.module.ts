import { forwardRef, Module } from '@nestjs/common';
import { ExpenseCreatedSubscriber } from './implementations/expense/expense-created.subscriber';
import { DEPENDENCY_INJECTION_PROVIDERS } from 'src/common/constants/constants';
import { ISubscriber } from '../interfaces/subscriber.interface';
import { CashFlowModule } from 'src/cash-flow/cash-flow.module';
import { IBaseMessage } from '../types/messages';
import { ExpenseUpdatedSubscriber } from './implementations/expense/expense-updated.subscriber';
import { ExpenseDeletedSubscriber } from './implementations/expense/expense-deleted.subscriber';
import { IncomeCreatedSubscriber } from './implementations/incomes/income-created.subscriber';
import { IncomeUpdatedSubscriber } from './implementations/incomes/income-updated.subscriber';
import { IncomeDeletedSubscriber } from './implementations/incomes/income-deleted.subscriber';
import { BankAccountsModule } from '../../bank-accounts/bank-accounts.module';
import { CreditCardsModule } from '../../credit-cards/credit-cards.module';
import { AnalyticsModule } from '../../analytics/analytics.module';
import { ReportProcessingSubscriber } from './implementations/reports/report-processing.subscriber';

const ALL_SUBSCRIBERS = [
    ExpenseCreatedSubscriber,
    ExpenseUpdatedSubscriber,
    ExpenseDeletedSubscriber,
    IncomeCreatedSubscriber,
    IncomeUpdatedSubscriber,
    IncomeDeletedSubscriber,
    ReportProcessingSubscriber,
];

@Module({
    imports: [
        CashFlowModule,
        forwardRef(() => BankAccountsModule),
        CreditCardsModule,
        forwardRef(() => AnalyticsModule),
    ],
    providers: [
        ...ALL_SUBSCRIBERS,
        {
            provide: DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS,
            useFactory: (...subscribers: ISubscriber<IBaseMessage>[]) =>
                subscribers,
            inject: [...ALL_SUBSCRIBERS],
        },
    ],
    exports: [
        {
            provide: DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS,
            useFactory: (...subscribers: ISubscriber<IBaseMessage>[]) =>
                subscribers,
            inject: [...ALL_SUBSCRIBERS],
        },
    ],
})
export class SubscribersModule {}
