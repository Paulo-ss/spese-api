import { InvoiceEntity } from '../entities/invoice.entity';
import { IClosedInvoices } from '../interfaces/closed-invoices.interface';
import { ICreditCard } from '../interfaces/credit-card.interface';

export class ClosedInvoicesDto implements IClosedInvoices {
  public userId: number;
  public creditCard: ICreditCard;
  public month: string;

  constructor(values: IClosedInvoices) {
    Object.assign(this, values);
  }

  public static entityToDto(invoice: InvoiceEntity) {
    const month = new Date(invoice.dueDate).toISOString().split('T')[0];

    return new ClosedInvoicesDto({
      userId: invoice.creditCard.userId,
      creditCard: invoice.creditCard,
      month,
    });
  }
}
