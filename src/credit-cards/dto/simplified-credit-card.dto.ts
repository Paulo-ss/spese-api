import { Banks } from 'src/bank-accounts/enums/banks.enum';
import { SimplifiedCreditCardInterface } from '../interfaces/simplified-credit-card.interface';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { getInvoiceMonth } from '../utils/get-invoice-month.util';
import { getNextBusinessDay, getToday } from 'src/common/utils/dates.utils';
import { InvoiceEntity } from '../entities/invoice.entity';

export class SimplifiedCreditCardDto implements SimplifiedCreditCardInterface {
    public id: number;
    public bank: Banks;
    public closingDate: Date;
    public dueDate: Date;
    public currentMonthInvoiceTotal: number;
    public lastFourDigits: string;
    public otherMonthsTotal: number;
    public closedTotal: number;
    public limit: number;
    public nickname: string;

    constructor(values: SimplifiedCreditCardInterface) {
        Object.assign(this, values);
    }

    private static computeInvoicesTotalByStatus({
        invoices,
        status,
    }: {
        invoices: InvoiceEntity[];
        status: InvoiceStatus;
    }): number {
        return invoices.reduce((total, invoice) => {
            if (invoice.status === status) {
                return total + invoice.currentPrice;
            }

            return total;
        }, 0);
    }

    public static entityToDto(creditCard: CreditCardEntity) {
        const currentInvoice = creditCard.invoices.find(
            (invoice) => invoice.status === InvoiceStatus.OPENED_CURRENT,
        );
        const otherMonthsTotal =
            SimplifiedCreditCardDto.computeInvoicesTotalByStatus({
                invoices: creditCard.invoices,
                status: InvoiceStatus.OPENED_FUTURE,
            });
        const closedTotal =
            SimplifiedCreditCardDto.computeInvoicesTotalByStatus({
                invoices: creditCard.invoices,
                status: InvoiceStatus.CLOSED,
            });

        const currentMonthInvoiceTotal = currentInvoice?.currentPrice ?? 0;

        let closingDate = currentInvoice ? currentInvoice.closingDate : null;
        let dueDate = currentInvoice ? currentInvoice.dueDate : null;

        if (!closingDate && !dueDate) {
            const { month, year } = getInvoiceMonth(
                creditCard.closingDay,
                getToday().toDate(),
            );
            closingDate = new Date(year, month, creditCard.closingDay);

            const closingMonth =
                creditCard.dueDay < creditCard.closingDay
                    ? (month + 1) % 12
                    : month;
            const closingYear = closingMonth < month ? year + 1 : year;

            dueDate = getNextBusinessDay(
                new Date(closingYear, closingMonth, creditCard.dueDay),
            ).toDate();
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
            lastFourDigits: creditCard.lastFourDigits,
        });
    }
}
