import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from '../base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import { OperationType } from 'src/common/interfaces/operation-type';
import { BankAccountsService } from '../../../../bank-accounts/bank-accounts.service';
import { CommonService } from '../../../../common/common.service';

@Injectable()
export class IncomeCreatedSubscriber extends BaseSubscriber<ITransactionMessage> {
    constructor(
        private readonly commonService: CommonService,
        private readonly cashFlowService: CashFlowService,
        private readonly bankAccountService: BankAccountsService,
    ) {
        super();
    }

    get groupName(): GroupName {
        return ASYNC_WORKER.REDIS_GROUPS.INCOME_CREATED;
    }

    get totalConsumers(): number {
        return 1;
    }

    getStreamName(): StreamName {
        return ASYNC_WORKER.REDIS_STREAMS.INCOME_CREATED;
    }

    override async onMessage(income: ITransactionMessage): Promise<void> {
        try {
            this.logger.log(
                'New income message received! Processing...',
                income,
            );

            await this.commonService.confirmTransaction(async () => {
                await this.cashFlowService.updateCashFlowForTransaction({
                    transaction: income,
                    operation: OperationType.INSERT,
                });
                await this.bankAccountService.updateCurrentBalanceForTransaction(
                    {
                        transaction: income,
                        operation: OperationType.INSERT,
                    },
                );
            });
        } catch (error) {
            this.logger.error('INCOME CREATED SUBSCRIBER ERROR: ', { error });

            throw error;
        }
    }
}
