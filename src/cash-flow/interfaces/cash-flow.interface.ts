import { TransactionType } from 'src/analytics/enums/transaction-type';

export interface ICashFlowDaily {
  id: number;
  openingBalance: number;
  closingBalance: number;
  date: Date;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransaction {
  id: number;
  type: TransactionType;
  value: number;
  title: string;
  date: Date;
}

export type TDailyCashFlow = {
  [key: string]: {
    transactions: ITransaction[];
    openingBalance?: number;
    closingBalance?: number;
  };
};

export interface ICashFlowResponse {
  currentAccountsBalance?: number;
  dailyCashFlow: TDailyCashFlow;
}
