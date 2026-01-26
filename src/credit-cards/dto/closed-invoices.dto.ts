import { Invoice } from '../entities/invoice.entity';
import { IClosedInvoices } from '../interfaces/closed-invoices.interface';
import { ICreditCard } from '../interfaces/credit-card.interface';
import * as dayjs from 'dayjs';
import { formatDate } from '../../common/utils/dates.utils';

export class ClosedInvoicesDto implements IClosedInvoices {
    public invoiceId: number;
    public userId: number;
    public creditCard: ICreditCard;
    public month: string;

    constructor(values: IClosedInvoices) {
        Object.assign(this, values);
    }

    public static entityToDto(invoice: Invoice) {
        const month = formatDate(dayjs(invoice.dueDate), 'YYYY-MM-DD');

        return new ClosedInvoicesDto({
            invoiceId: invoice.id,
            userId: invoice.creditCard.userId,
            creditCard: invoice.creditCard,
            month,
        });
    }
}
