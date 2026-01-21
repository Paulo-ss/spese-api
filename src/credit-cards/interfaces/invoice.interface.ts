import { ICreditCard } from './credit-card.interface';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';

export interface IInvoice extends IVersionedUserEntityBase {
    id: number;
    currentPrice: number;
    totalPrice: number;
    creditCard: ICreditCard;
    closingDate: Date;
    dueDate: Date;
    status: InvoiceStatus;
    expenses: IExpense[];
}
