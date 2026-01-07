import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';

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
  entityId: number;
  type: TransactionType;
  price: number;
  title: string;
  start: Date | string;
  end: Date | string;
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
