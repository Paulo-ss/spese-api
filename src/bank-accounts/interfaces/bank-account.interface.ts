import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { Banks } from '../enums/banks.enum';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface IBankAccount extends IVersionedUserEntityBase {
    id: number;
    bank: Banks;
    currentBalance?: number;
    expenses?: IExpense[];
}
