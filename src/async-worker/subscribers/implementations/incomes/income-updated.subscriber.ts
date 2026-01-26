import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from '../base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import { OperationType } from 'src/common/interfaces/operation-type';
import { BankAccountsService } from '../../../../bank-accounts/bank-accounts.service';

@Injectable()
export class IncomeUpdatedSubscriber extends BaseSubscriber<ITransactionMessage> {
    constructor(
        private readonly cashFlowService: CashFlowService,
        private readonly bankAccountService: BankAccountsService,
    ) {
        super();
    }

    get groupName(): GroupName {
        return ASYNC_WORKER.REDIS_GROUPS.INCOME_UPDATED;
    }

    get totalConsumers(): number {
        return 1;
    }

    getStreamName(): StreamName {
        return ASYNC_WORKER.REDIS_STREAMS.INCOME_UPDATED;
    }

    override async onMessage(income: ITransactionMessage): Promise<void> {
        try {
            this.logger.log(
                'Income updated message received! Processing...',
                income,
            );

            await this.cashFlowService.updateCashFlowForTransaction({
                transaction: income,
                operation: OperationType.UPDATE,
            });
            await this.bankAccountService.updateCurrentBalanceForTransaction({
                transaction: income,
                operation: OperationType.UPDATE,
            });
        } catch (error) {
            this.logger.error('INCOME UPDATED SUBSCRIBER ERROR: ', { error });

            throw error;
        }
    }
}
