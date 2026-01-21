import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface ICashFlowDaily extends IVersionedUserEntityBase {
    id: number;
    openingBalance: number;
    closingBalance: number;
    date: Date;
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
