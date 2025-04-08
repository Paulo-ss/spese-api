import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { getNextBusinessDay } from './utils/get-next-business-day.util';
import { getInvoiceMonth } from './utils/get-invoice-month.util';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ClosedInvoicesDto } from './dto/closed-invoices.dto';

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
        expenses: { creditCard: false, bankAccount: false, invoice: false },
        creditCard: { expenses: false, invoices: false, subscriptions: false },
      },
      order: {
        expenses: {
          expenseDate: 'asc',
        },
      },
    });

    this.commonService.checkEntityExistence(invoice, 'Fatura');

    return invoice;
  }

  public async findByMonth(
    month: string,
    userId: number,
  ): Promise<InvoiceEntity[]> {
    const [fromMonth, fromYear] = month.split('-').map(Number);
    const firstDayOfTheMonth = new Date(fromYear, fromMonth - 1);
    const lastDayOfTheMonth = new Date(fromYear, fromMonth, 0);

    const invoice = await this.invoiceRepository
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

    return invoice;
  }

  public async findByMonthAndCreditCard(
    creditCardId: number,
    creditCardClosingDay: number,
    invoiceDate: Date,
  ): Promise<InvoiceEntity> {
    const { month, year } = getInvoiceMonth(creditCardClosingDay, invoiceDate);
    const date = new Date(year, month, creditCardClosingDay)
      .toISOString()
      .split('T')[0];

    const invoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.creditCard', 'cc')
      .where('invoice.creditCardId = :creditCardId', { creditCardId })
      .andWhere('invoice.closing_date = :date', {
        date,
      })
      .getOne();

    return invoice;
  }

  public async create(
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<InvoiceEntity> {
    const { invoiceDate, creditCard } = createInvoiceDto;

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
      ...createInvoiceDto,
      currentPrice: 0,
      totalPrice: 0,
      closingDate: invoiceClosingDate,
      dueDate: getNextBusinessDay(invoiceDueDate),
      userId: creditCard.userId,
    });

    await this.commonService.saveEntity(this.invoiceRepository, invoice);

    return invoice;
  }

  public async payInvoice(invoiceId: number): Promise<IGenericMessageResponse> {
    const invoiceToBePaid = await this.findById(invoiceId);

    if (
      ![InvoiceStatus.OPENED_CURRENT, InvoiceStatus.OPENED_FUTURE].includes(
        invoiceToBePaid.status,
      )
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

    return this.commonService.generateGenericMessageResponse('Fatura paga!');
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
      invoicesToBeClosed.forEach(async (invoice) => {
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
        invoicesToBeMarkedAsCurrent.forEach(async (invoice) => {
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

  public async markInvoicesAsDelayed(): Promise<ClosedInvoicesDto[]> {
    const today = new Date().toISOString().split('T')[0];

    const delayedInvoices = await this.invoiceRepository
      .createQueryBuilder('in')
      .leftJoinAndSelect('in.creditCard', 'cc')
      .where('in.due_date < :today', { today: today })
      .andWhere('in.status = :closed', {
        closed: InvoiceStatus.CLOSED,
      })
      .getMany();

    if (delayedInvoices.length > 0) {
      delayedInvoices.forEach(async (invoice) => {
        invoice.status = InvoiceStatus.DELAYED;
      });

      await this.commonService.saveMultipleEntities(
        this.invoiceRepository,
        delayedInvoices,
      );
    }

    return delayedInvoices.map(ClosedInvoicesDto.entityToDto);
  }
}
