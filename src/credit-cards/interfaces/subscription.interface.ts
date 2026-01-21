import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { ICreditCard } from './credit-card.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface ISubscription extends IVersionedUserEntityBase {
    id: number;
    name: string;
    price: number;
    creditCard: ICreditCard;
    billingDay: number;
    expenses: IExpense[];
}
