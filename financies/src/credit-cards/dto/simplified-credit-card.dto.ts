import { Banks } from 'src/bank-accounts/enums/banks.enum';
import { SimplifiedCreditCardInterface } from '../interfaces/simplified-credit-card.interface';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { getNextBusinessDay } from '../utils/get-next-business-day.util';
import { getInvoiceMonth } from '../utils/get-invoice-month.util';

export class SimplifiedCreditCardDto implements SimplifiedCreditCardInterface {
  public id: number;
  public bank: Banks;
  public closingDate: Date;
  public dueDate: Date;
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
    const currentInvoice = creditCard.invoices.find(
      (invoice) => invoice.status === InvoiceStatus.OPENED_CURRENT,
    );
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

    let currentMonthInvoiceTotal = currentInvoice?.currentPrice ?? 0;
    if (subscriptionsTotal) {
      currentMonthInvoiceTotal += subscriptionsTotal;
    }

    let closingDate = currentInvoice ? currentInvoice.closingDate : null;
    let dueDate = currentInvoice ? currentInvoice.dueDate : null;

    if (!closingDate && !dueDate) {
      const { month, year } = getInvoiceMonth(
        creditCard.closingDay,
        new Date(),
      );
      closingDate = new Date(year, month, creditCard.closingDay);

      dueDate = getNextBusinessDay(new Date(year, month, creditCard.dueDay));
    }

    return new SimplifiedCreditCardDto({
      id: creditCard.id,
      bank: creditCard.bank,
      closingDate,
      dueDate,
      currentMonthInvoiceTotal,
      otherMonthsTotal,
      closedTotal,
      limit: creditCard.limit,
      nickname: creditCard.nickname,
    });
  }
}
