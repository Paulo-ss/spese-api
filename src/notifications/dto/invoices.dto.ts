import { IInvoices } from '../interfaces/invoices.interface';
import { ICreditCard } from '../interfaces/credit-card.interface';

export class InvoicesDto implements IInvoices {
  public invoiceId: number;
  public userId: number;
  public creditCard: ICreditCard;
  public month: string;
}
