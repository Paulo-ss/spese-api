import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import { CommonService } from 'src/common/common.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { getInvoiceMonth } from './utils/get-invoice-month.util';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ClosedInvoicesDto } from './dto/closed-invoices.dto';
import {
    formatDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    getNextBusinessDay,
    getToday,
} from 'src/common/utils/dates.utils';
import { isEmpty, isNull } from '../common/utils/validation.utils';
import { CreditCard } from './entities/credit-card.entity';
import { ITransactionMessage } from '../async-worker/types/messages';
import { OperationType } from '../common/interfaces/operation-type';
import { InvoiceRepository } from './invoice.repository';
import { Transactional } from '@nestjs-cls/transactional';
import * as dayjs from 'dayjs';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        @Inject(forwardRef(() => ExpensesService))
        private readonly expenseService: ExpensesService,
        private readonly commonService: CommonService,
    ) {}

    public async findById(id: number): Promise<Invoice> {
        const invoice = await this.invoiceRepository.findById(id);
        this.commonService.checkEntityExistence(invoice, 'Invoice');

        return invoice;
    }

    public async findByMonth(date: string, userId: number): Promise<Invoice[]> {
        const firstDayOfTheMonth = formatDate(
            getFirstDayOfMonth(date),
            'YYYY-MM-DD',
        );
        const lastDayOfTheMonth = formatDate(
            getLastDayOfMonth(date),
            'YYYY-MM-DD',
        );

        return await this.invoiceRepository.findByMonth(
            firstDayOfTheMonth,
            lastDayOfTheMonth,
            userId,
        );
    }

    public async findByMonthAndCreditCard(
        creditCardId: number,
        creditCardClosingDay: number,
        invoiceDate: Date,
    ): Promise<Invoice> {
        const { month, year } = getInvoiceMonth(
            creditCardClosingDay,
            invoiceDate,
        );
        const closingDate = dayjs()
            .year(year)
            .month(month)
            .date(creditCardClosingDay);

        return await this.invoiceRepository.findByMonthAndCreditCard(
            creditCardId,
            formatDate(closingDate, 'YYYY-MM-DD'),
        );
    }

    private computeInvoiceStatus({
        creditCardClosingDay,
        date,
    }: {
        creditCardClosingDay: number;
        date: Date;
    }): InvoiceStatus {
        const today = getToday().toDate();
        const { month, year } = getInvoiceMonth(creditCardClosingDay, date);

        let invoiceStatus: InvoiceStatus = InvoiceStatus.PAID;

        if (
            (month > today.getMonth() && year === today.getFullYear()) ||
            year > today.getFullYear()
        ) {
            invoiceStatus = InvoiceStatus.OPENED_FUTURE;
        }

        const { month: currentInvoiceMonth, year: currentInvoiceYear } =
            getInvoiceMonth(creditCardClosingDay, today);
        if (month === currentInvoiceMonth && year === currentInvoiceYear) {
            invoiceStatus = InvoiceStatus.OPENED_CURRENT;
        }

        return invoiceStatus;
    }

    public async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
        const { invoiceDate, dateToComputeStatus, creditCard } =
            createInvoiceDto;

        const closingDay = createInvoiceDto.creditCard.closingDay;
        const dueDay = createInvoiceDto.creditCard.dueDay;

        const { month, year } = getInvoiceMonth(closingDay, invoiceDate);

        const invoiceMonthAndYear = dayjs().year(year).month(month);
        const invoiceClosingDate = invoiceMonthAndYear.date(closingDay);
        let invoiceDueDate = invoiceMonthAndYear.date(dueDay);

        // If the due day is smaller than the closing day, that means
        // the invoice due date is on the next month
        if (dueDay < closingDay) {
            invoiceDueDate = invoiceDueDate.add(1, 'month');
        }

        return await this.invoiceRepository.upsert({
            currentPrice: 0,
            totalPrice: 0,
            closingDate: invoiceClosingDate,
            dueDate: getNextBusinessDay(invoiceDueDate),
            userId: creditCard.userId,
            status: this.computeInvoiceStatus({
                creditCardClosingDay: creditCard.closingDay,
                date: dateToComputeStatus ?? invoiceDate,
            }),
        });
    }

    public async createInvoicesForExpense({
        creditCard,
        installments,
        expenseDate,
    }: {
        creditCard: CreditCard;
        expenseDate: string;
        installments?: number;
    }): Promise<Invoice[]> {
        const invoices: Invoice[] = [];

        let invoice = await this.findByMonthAndCreditCard(
            creditCard.id,
            creditCard.closingDay,
            dayjs(expenseDate).toDate(),
        );

        if (isNull(invoice)) {
            invoice = await this.create({
                creditCard,
                invoiceDate: dayjs(expenseDate).toDate(),
            });
        }

        invoices.push(invoice);

        if (installments) {
            for (let i = 1; i <= installments - 1; i++) {
                const previousInvoice = invoices[i - 1];
                const nextInvoiceDate = dayjs(previousInvoice.closingDate).add(
                    1,
                    'month',
                );

                /*
                 * We use the previous invoice closing date, because it will
                 * eventually return the current invoice for that date, which will
                 * always get the next month invoice
                 */
                let installmentInvoice = await this.findByMonthAndCreditCard(
                    creditCard.id,
                    creditCard.closingDay,
                    dayjs(previousInvoice.closingDate).toDate(),
                );

                if (isNull(installmentInvoice)) {
                    installmentInvoice = await this.create({
                        creditCard,
                        invoiceDate: nextInvoiceDate.toDate(),
                        dateToComputeStatus: dayjs(
                            previousInvoice.closingDate,
                        ).toDate(),
                    });
                }

                invoices.push(installmentInvoice);
            }
        }

        return invoices;
    }

    @Transactional()
    public async payInvoice(
        invoiceId: number,
    ): Promise<IGenericMessageResponse> {
        const invoiceToBePaid = await this.findById(invoiceId);

        if (
            ![
                InvoiceStatus.OPENED_CURRENT,
                InvoiceStatus.OPENED_FUTURE,
            ].includes(invoiceToBePaid.status)
        ) {
            invoiceToBePaid.status = InvoiceStatus.PAID;

            await this.invoiceRepository.upsert(invoiceToBePaid);
        }

        for (const expense of invoiceToBePaid.expenses) {
            await this.expenseService.payExpense(expense.id);
        }

        return this.commonService.generateGenericMessageResponse(
            'Invoice paid!',
        );
    }

    @Transactional()
    public async closeInvoices(): Promise<ClosedInvoicesDto[]> {
        const today = formatDate(getToday(), 'YYYY-MM-DD');

        const invoicesToBeClosed =
            await this.invoiceRepository.findInvoicesToBeClosed(today);

        if (isEmpty(invoicesToBeClosed)) {
            return [];
        }

        invoicesToBeClosed.forEach((invoice) => {
            invoice.status = InvoiceStatus.CLOSED;
        });

        await this.invoiceRepository.upsert(invoicesToBeClosed);

        const nextMonth = formatDate(getToday().add(1, 'month'), 'YYYY-MM-DD');

        const invoicesToBeMarkedAsCurrent =
            await this.invoiceRepository.findInvoicesToBeMarkedAsCurrent(
                nextMonth,
            );

        if (!isEmpty(invoicesToBeMarkedAsCurrent)) {
            invoicesToBeMarkedAsCurrent.forEach((invoice) => {
                invoice.status = InvoiceStatus.OPENED_CURRENT;
            });

            await this.invoiceRepository.upsert(invoicesToBeMarkedAsCurrent);
        }

        return invoicesToBeClosed.map(ClosedInvoicesDto.entityToDto);
    }

    @Transactional()
    public async markInvoicesAsOverdue(): Promise<ClosedInvoicesDto[]> {
        const today = formatDate(getToday(), 'YYYY-MM-DD');

        const overdueInvoices =
            await this.invoiceRepository.findOverdueInvoices(today);

        if (overdueInvoices.length > 0) {
            overdueInvoices.forEach((invoice) => {
                invoice.status = InvoiceStatus.OVERDUE;
            });

            await this.invoiceRepository.upsert(overdueInvoices);
        }

        return overdueInvoices.map(ClosedInvoicesDto.entityToDto);
    }

    public async updateInvoiceForTransaction({
        transaction,
        operation,
    }: {
        transaction: ITransactionMessage;
        operation: OperationType;
    }) {
        await this.commonService.confirmTransaction(async (entityManager) => {
            const { invoiceId, transactionType, originalPrice, price } =
                transaction;

            const invoice = await entityManager.findOne(Invoice, {
                where: { id: invoiceId },
            });

            if (invoice) {
                const transformedPrice =
                    this.commonService.transformPriceByTransactionAndOperationType(
                        {
                            transactionType,
                            operation,
                            price,
                            originalPrice,
                        },
                    );

                invoice.currentPrice += transformedPrice;
                invoice.totalPrice += transformedPrice;

                await entityManager.save(Invoice, invoice);
            }
        });
    }
}
