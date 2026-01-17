import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from '../base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import { OperationType } from 'src/common/interfaces/operation-type';
import { BankAccountsService } from '../../../../bank-accounts/bank-accounts.service';
import { CommonService } from '../../../../common/common.service';
import { InvoiceService } from '../../../../credit-cards/invoice.service';

@Injectable()
export class ExpenseDeletedSubscriber extends BaseSubscriber<ITransactionMessage> {
    constructor(
        private readonly commonService: CommonService,
        private readonly cashFlowService: CashFlowService,
        private readonly bankAccountService: BankAccountsService,
        private readonly invoiceService: InvoiceService,
    ) {
        super();
    }

    get groupName(): GroupName {
        return ASYNC_WORKER.REDIS_GROUPS.EXPENSE_DELETED;
    }

    get totalConsumers(): number {
        return 1;
    }

    getStreamName(): StreamName {
        return ASYNC_WORKER.REDIS_STREAMS.EXPENSE_DELETED;
    }

    override async onMessage(expense: ITransactionMessage): Promise<void> {
        try {
            this.logger.log(
                'Delete expense message received! Processing...',
                expense,
            );

            await this.commonService.confirmTransaction(async () => {
                await this.cashFlowService.updateCashFlowForTransaction({
                    transaction: expense,
                    operation: OperationType.DELETE,
                });
                await this.bankAccountService.updateCurrentBalanceForTransaction(
                    {
                        transaction: expense,
                        operation: OperationType.DELETE,
                    },
                );
                await this.invoiceService.updateInvoiceForTransaction({
                    transaction: expense,
                    operation: OperationType.DELETE,
                });
            });
        } catch (error) {
            this.logger.error('EXPENSE DELETED SUBSCRIBER ERROR: ', { error });

            throw error;
        }
    }
}
