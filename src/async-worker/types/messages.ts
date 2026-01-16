import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';

export interface IBaseMessage {
    timestamp: string;
    userId: number;
}

export interface ITransactionMessage extends IBaseMessage {
    entityId: string;
    description: string;
    transactionType: TransactionType;
    price: number;
    originalPrice?: number;
    bankAccountId?: number;
}
