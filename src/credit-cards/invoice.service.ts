import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { getInvoiceMonth } from './utils/get-invoice-month.util';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ClosedInvoicesDto } from './dto/closed-invoices.dto';
import {
    getMonthAndYear,
    getNextBusinessDay,
} from 'src/common/utils/dates.utils';
import { isNull } from '../common/utils/validation.utils';
import { CreditCardEntity } from './entities/credit-card.entity';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepository: Repository<InvoiceEntity>,
        @Inject(forwardRef(() => ExpensesService))
        private readonly expenseService: ExpensesService,
        private readonly commonService: CommonService,
    ) {}

    public async findById(id: number): Promise<InvoiceEntity> {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: {
                expenses: {
                    creditCard: false,
                    bankAccount: false,
                    invoice: false,
                },
                creditCard: {
                    expenses: false,
                    invoices: false,
                    subscriptions: false,
                },
            },
            order: {
                expenses: {
                    expenseDate: 'asc',
                },
            },
        });

        this.commonService.checkEntityExistence(invoice, 'Invoice');

        return invoice;
    }

    public async findByMonth(
        month: string,
        userId: number,
    ): Promise<InvoiceEntity[]> {
        const [fromMonth, fromYear] = getMonthAndYear(month);
        const firstDayOfTheMonth = new Date(fromYear, fromMonth - 1);
        const lastDayOfTheMonth = new Date(fromYear, fromMonth, 0);

        return await this.invoiceRepository
            .createQueryBuilder('invoice')
            .where(
                'invoice.due_date between :firstDayOfTheMonth and :lastDayOfTheMonth',
                {
                    firstDayOfTheMonth: firstDayOfTheMonth,
                    lastDayOfTheMonth: lastDayOfTheMonth,
                },
            )
            .andWhere('invoice.user_id = :userId', {
                userId,
            })
            .getMany();
    }

    public async findByMonthAndCreditCard(
        creditCardId: number,
        creditCardClosingDay: number,
        invoiceDate: Date,
    ): Promise<InvoiceEntity> {
        const { month, year } = getInvoiceMonth(
            creditCardClosingDay,
            invoiceDate,
        );
        const date = new Date(year, month, creditCardClosingDay)
            .toISOString()
            .split('T')[0];

        return await this.invoiceRepository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.creditCard', 'cc')
            .where('invoice.creditCardId = :creditCardId', { creditCardId })
            .andWhere('invoice.closing_date = :date', {
                date,
            })
            .getOne();
    }

    private computeInvoiceStatus({
        creditCardClosingDay,
        date,
    }: {
        creditCardClosingDay: number;
        date: Date;
    }): InvoiceStatus {
        const today = new Date();
        const { month, year } = getInvoiceMonth(creditCardClosingDay, date);

        let invoiceStatus: InvoiceStatus = InvoiceStatus.PAID;

        if (
            (month > today.getMonth() && year === today.getFullYear()) ||
            year > today.getFullYear()
        ) {
            invoiceStatus = InvoiceStatus.OPENED_FUTURE;
        }

        const { month: currentInvoiceMonth, year: currentInvoiceYear } =
            getInvoiceMonth(creditCardClosingDay, new Date());
        if (month === currentInvoiceMonth && year === currentInvoiceYear) {
            invoiceStatus = InvoiceStatus.OPENED_CURRENT;
        }

        return invoiceStatus;
    }

    public async create(
        createInvoiceDto: CreateInvoiceDto,
    ): Promise<InvoiceEntity> {
        const { invoiceDate, dateToComputeStatus, creditCard } =
            createInvoiceDto;

        const closingDay = createInvoiceDto.creditCard.closingDay;
        const dueDay = createInvoiceDto.creditCard.dueDay;

        const { month, year } = getInvoiceMonth(closingDay, invoiceDate);

        const invoiceClosingDate = new Date(year, month);
        invoiceClosingDate.setDate(closingDay);

        const invoiceDueDate = new Date(year, month);

        // If the due day is smaller than the closing day, that means
        // that the invoice due day is on the next month
        if (dueDay < closingDay) {
            invoiceDueDate.setMonth(invoiceDueDate.getMonth() + 1);
        }

        invoiceDueDate.setDate(dueDay);

        const invoice = this.invoiceRepository.create({
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

        await this.commonService.saveEntity(this.invoiceRepository, invoice);

        return invoice;
    }

    public async createInvoicesForExpense({
        creditCard,
        installments,
        expenseDate,
    }: {
        creditCard: CreditCardEntity;
        expenseDate: string;
        installments?: number;
    }): Promise<InvoiceEntity[]> {
        const invoices: InvoiceEntity[] = [];

        let invoice = await this.findByMonthAndCreditCard(
            creditCard.id,
            creditCard.closingDay,
            new Date(expenseDate),
        );

        if (isNull(invoice)) {
            invoice = await this.create({
                creditCard,
                invoiceDate: new Date(expenseDate),
            });
        }

        invoices.push(invoice);

        if (installments) {
            for (let i = 1; i <= installments - 1; i++) {
                const previousInvoice = invoices[i - 1];
                const nextInvoiceDate = new Date(previousInvoice.closingDate);
                nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);

                /*
                 * We use the previous invoice closing data, because it will
                 * eventually return the current invoice for that date, which will
                 * always get the next month invoice
                 */
                let installmentInvoice = await this.findByMonthAndCreditCard(
                    creditCard.id,
                    creditCard.closingDay,
                    new Date(previousInvoice.closingDate),
                );

                if (isNull(installmentInvoice)) {
                    installmentInvoice = await this.create({
                        creditCard,
                        invoiceDate: nextInvoiceDate,
                        dateToComputeStatus: new Date(
                            previousInvoice.closingDate,
                        ),
                    });
                }

                invoices.push(installmentInvoice);
            }
        }

        return invoices;
    }

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

            await this.commonService.saveEntity(
                this.invoiceRepository,
                invoiceToBePaid,
            );
        }

        invoiceToBePaid.expenses.forEach(async (expense) => {
            await this.expenseService.payExpense(expense.id);
        });

        return this.commonService.generateGenericMessageResponse(
            'Invoice paid!',
        );
    }

    public async closeInvoices(): Promise<ClosedInvoicesDto[]> {
        const today = new Date().toISOString().split('T')[0];

        const invoicesToBeClosed = await this.invoiceRepository
            .createQueryBuilder('in')
            .leftJoinAndSelect('in.creditCard', 'cc')
            .where('in.closing_date = :today', { today: today })
            .andWhere('in.status != :closed', {
                closed: InvoiceStatus.CLOSED,
            })
            .andWhere('in.status != :paid', {
                paid: InvoiceStatus.PAID,
            })
            .getMany();

        if (invoicesToBeClosed.length > 0) {
            invoicesToBeClosed.forEach((invoice) => {
                invoice.status = InvoiceStatus.CLOSED;
            });

            await this.commonService.saveMultipleEntities(
                this.invoiceRepository,
                invoicesToBeClosed,
            );

            const nextMonth = new Date();
            nextMonth.setMonth(new Date().getMonth() + 1);

            const invoicesToBeMarkedAsCurrent = await this.invoiceRepository
                .createQueryBuilder('in')
                .leftJoinAndSelect('in.creditCard', 'cc')
                .where('in.closing_date = :nextMonth', {
                    nextMonth: nextMonth.toISOString().split('T')[0],
                })
                .andWhere('in.status != :closed', {
                    closed: InvoiceStatus.CLOSED,
                })
                .andWhere('in.status != :paid', {
                    paid: InvoiceStatus.PAID,
                })
                .getMany();

            if (invoicesToBeMarkedAsCurrent.length > 0) {
                invoicesToBeMarkedAsCurrent.forEach((invoice) => {
                    invoice.status = InvoiceStatus.OPENED_CURRENT;
                });

                await this.commonService.saveMultipleEntities(
                    this.invoiceRepository,
                    invoicesToBeMarkedAsCurrent,
                );
            }
        }

        return invoicesToBeClosed.map(ClosedInvoicesDto.entityToDto);
    }

    public async markInvoicesAsOverdue(): Promise<ClosedInvoicesDto[]> {
        const today = new Date().toISOString().split('T')[0];

        const overdueInvoices = await this.invoiceRepository
            .createQueryBuilder('in')
            .leftJoinAndSelect('in.creditCard', 'cc')
            .where('in.due_date < :today', { today: today })
            .andWhere('in.status = :closed', {
                closed: InvoiceStatus.CLOSED,
            })
            .getMany();

        if (overdueInvoices.length > 0) {
            overdueInvoices.forEach((invoice) => {
                invoice.status = InvoiceStatus.OVERDUE;
            });

            await this.commonService.saveMultipleEntities(
                this.invoiceRepository,
                overdueInvoices,
            );
        }

        return overdueInvoices.map(ClosedInvoicesDto.entityToDto);
    }
}
