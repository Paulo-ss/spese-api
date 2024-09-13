import { Banks } from 'src/bank-accounts/enums/banks.enum';
import { SimplifiedCreditCardInterface } from '../interfaces/simplified-credit-card.interface';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export class SimplifiedCreditCardDto implements SimplifiedCreditCardInterface {
  public id: number;
  public bank: Banks;
  public dueDay: number;
  public currentMonthInvoiceTotal: number;
  public otherMonthsTotal: number;
  public closedTotal: number;
  public limit: number;
  public nickname: string;

  constructor(values: SimplifiedCreditCardInterface) {
    Object.assign(this, values);
  }

  public static entityToDto(creditCard: CreditCardEntity) {
    const subscriptionsTotal = creditCard.subscriptions
      ? creditCard.subscriptions.reduce((total, subscription) => {
          return (total += subscription.price);
        }, 0)
      : null;
    const currentMonthInvoiceTotal = creditCard.invoices.find(
      (invoice) => invoice.status === InvoiceStatus.OPENED_CURRENT,
    ).currentPrice;
    const otherMonthsTotal = creditCard.invoices.reduce((total, invoice) => {
      if (invoice.status === InvoiceStatus.OPENED_FUTURE) {
        return total + invoice.currentPrice;
      }

      return total;
    }, 0);
    const closedTotal = creditCard.invoices.reduce((total, invoice) => {
      if (invoice.status === InvoiceStatus.CLOSED) {
        return total + invoice.currentPrice;
      }

      return total;
    }, 0);

    return new SimplifiedCreditCardDto({
      id: creditCard.id,
      bank: creditCard.bank,
      dueDay: creditCard.dueDay,
      currentMonthInvoiceTotal: subscriptionsTotal
        ? subscriptionsTotal + currentMonthInvoiceTotal
        : currentMonthInvoiceTotal,
      otherMonthsTotal,
      closedTotal,
      limit: creditCard.limit,
      nickname: creditCard.nickname,
    });
  }
}
