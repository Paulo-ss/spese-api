import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface ICategory extends IVersionedUserEntityBase {
    id: number;
    name: string;
    color: string;
    expenses?: IExpense[];
}
