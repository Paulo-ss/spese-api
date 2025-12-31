import { TransactionType } from 'src/analytics/enums/transaction-type';

export interface IBaseMessage {
  timestamp: string;
  userId: number;
}

export interface ITransactionCreatedMessage extends IBaseMessage {
  entityId: string;
  value: number;
  description: string;
  transactionType: TransactionType;
}
