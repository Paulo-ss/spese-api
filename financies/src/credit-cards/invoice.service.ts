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
      relations: { expenses: true },
    });
    this.commonService.checkEntityExistence(invoice, 'Fatura');

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
    const { invoiceDate } = createInvoiceDto;

    const closingDay = createInvoiceDto.creditCard.closingDay;
    const dueDay = createInvoiceDto.creditCard.dueDay;

    const { month, year } = getInvoiceMonth(closingDay, invoiceDate);

    const invoiceClosingDate = new Date(year, month);
    invoiceClosingDate.setDate(closingDay);

    const invoiceDueDate = getNextBusinessDay(new Date(year, month));
    invoiceDueDate.setDate(dueDay);

    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      closingDate: invoiceClosingDate,
      dueDate: invoiceDueDate,
    });

    await this.commonService.saveEntity(this.invoiceRepository, invoice);

    return invoice;
  }

  public async createMultiple(
    invoices: CreateInvoiceDto[],
  ): Promise<InvoiceEntity[]> {
    const createdInvoices: InvoiceEntity[] = [];

    invoices.forEach((invoice) => {
      createdInvoices.push(this.invoiceRepository.create({ ...invoice }));
    });

    await this.commonService.saveMultipleEntities(
      this.invoiceRepository,
      createdInvoices,
    );

    return createdInvoices;
  }

  public async updatePrice(id: number, price: number): Promise<InvoiceEntity> {
    const invoice = await this.findById(id);
    invoice.currentPrice = price;

    await this.commonService.saveEntity(this.invoiceRepository, invoice);

    return invoice;
  }

  public async payInvoice(invoiceId: number): Promise<IGenericMessageResponse> {
    await this.invoiceRepository.save({
      id: invoiceId,
      status: InvoiceStatus.PAID,
    });

    const invoice = await this.findById(invoiceId);
    invoice.expenses.forEach(async (expense) => {
      await this.expenseService.payExpense(expense.id);
    });

    return this.commonService.generateGenericMessageResponse('Fatura paga!');
  }
}
