import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from '../base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { CashFlowService } from 'src/cash-flow/cash-flow.service';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import { OperationType } from 'src/common/interfaces/operation-type';
import { BankAccountsService } from '../../../../bank-accounts/bank-accounts.service';
import { InvoiceService } from '../../../../credit-cards/invoice.service';

@Injectable()
export class ExpenseUpdatedSubscriber extends BaseSubscriber<ITransactionMessage> {
    constructor(
        private readonly cashFlowService: CashFlowService,
        private readonly bankAccountService: BankAccountsService,
        private readonly invoiceService: InvoiceService,
    ) {
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

    override async onMessage(expense: ITransactionMessage): Promise<void> {
        try {
            this.logger.log(
                'Expense update message received! Processing...',
                expense,
            );

            await this.cashFlowService.updateCashFlowForTransaction({
                transaction: expense,
                operation: OperationType.UPDATE,
            });
            await this.bankAccountService.updateCurrentBalanceForTransaction({
                transaction: expense,
                operation: OperationType.UPDATE,
            });
            await this.invoiceService.updateInvoiceForTransaction({
                transaction: expense,
                operation: OperationType.UPDATE,
            });
        } catch (error) {
            this.logger.error('EXPENSE UPDATED SUBSCRIBER ERROR: ', { error });

            throw error;
        }
    }
}
