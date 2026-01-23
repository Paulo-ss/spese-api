import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { Banks } from '../../bank-accounts/enums/banks.enum';
import { ISubscription } from './subscription.interface';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface ICreditCard extends IVersionedUserEntityBase {
    id: number;
    nickname: string;
    bank: Banks;
    dueDay: number;
    closingDay: number;
    lastFourDigits: string;
    bankAccount?: IBankAccount;
    limit?: number;
    expenses?: IExpense[];
    subscriptions?: ISubscription[];
}
