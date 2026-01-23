import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface IIncome extends IVersionedUserEntityBase {
    id: number;
    name: string;
    value: number;
    bankAccount?: IBankAccount;
    incomeDate: Date;
}
