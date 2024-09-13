import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InstallmentService } from 'src/credit-cards/installment.service';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { CreditCardEntity } from 'src/credit-cards/entities/credit-card.entity';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { InvoiceEntity } from 'src/credit-cards/entities/invoice.entity';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { CreateInstallmentDto } from 'src/credit-cards/dto/create-installment.dto';
import { InvoiceStatus } from 'src/credit-cards/enums/invoice-status.enum';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpenseStatus } from './enums/expense-status.enum';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expensesRepository: Repository<ExpenseEntity>,
    @Inject() private readonly installmentService: InstallmentService,
    @Inject() private readonly invoiceService: InvoiceService,
    @Inject() private readonly bankAccountService: BankAccountsService,
    @Inject() private readonly creditCardService: CreditCardsService,
    private readonly commonService: CommonService,
  ) {}

  public async findById(
    expenseId: number,
    userId: number,
  ): Promise<ExpenseEntity> {
    const expense = await this.expensesRepository.findOneBy({
      id: expenseId,
      userId,
    });
    this.commonService.checkEntityExistence(expense, 'Despesa');

    return expense;
  }

  public async findByFilters(
    filters: FindExpensesFiltersDto,
  ): Promise<ExpenseEntity[]> {
    const [fromMonth, fromYear] = filters.toMonth.split('-').map(Number);
    const fromDate = new Date(fromYear, fromMonth);

    const query = this.expensesRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.bank_account', 'ba')
      .leftJoinAndSelect('e.credit_card', 'cc')
      .where('e.created_at = :fromMonth', { fromMonth: fromDate });

    if (filters.toMonth) {
      const [toMonth, toYear] = filters.fromMonth.split('-').map(Number);

      query.where('e.created_at between :fromMonth and :toMonth', {
        fromMonth: fromDate,
        toMonth: new Date(toYear, toMonth),
      });
    }

    if (filters.category) {
      query.andWhere('e.category = :category', {
        category: filters.category,
      });
    }

    if (filters.name) {
      query.andWhere('e.name like :name', {
        name: `%${filters.name.toUpperCase()}%`,
      });
    }

    if (filters.creditCardId) {
      query.andWhere('cc.id = :creditCardId', {
        creditCardId: filters.creditCardId,
      });
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;

      query.andWhere('e.price between :min and :max', {
        min,
        max,
      });
    }

    if (filters.status) {
      query.andWhere('e.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  public async create(
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseEntity> {
    const {
      expenseType,
      name,
      price,
      status,
      userId,
      bankAccountId,
      category,
      creditCardId,
      installments,
      expenseDate,
    } = createExpenseDto;

    let bankAccount: BankAccountEntity = null;
    if (bankAccountId) {
      bankAccount = await this.bankAccountService.findById(
        bankAccountId,
        userId,
      );
    }

    const creditCard = creditCardId
      ? await this.creditCardService.findById(creditCardId, userId)
      : null;
    let invoice: InvoiceEntity = null;
    const invoices: InvoiceEntity[] = [];

    if (creditCard) {
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();

      invoice = await this.invoiceService.findByMonthAndCreditCard(
        creditCardId,
        creditCard.closingDay,
        expenseDate,
      );
      if (isNull(invoice) || isUndefined(invoice)) {
        const currentMonth = new Date().getMonth();
        const invoiceStatus =
          currentMonth === expenseMonth
            ? InvoiceStatus.OPENED_CURRENT
            : InvoiceStatus.OPENED_FUTURE;

        invoice = await this.invoiceService.create({
          creditCard,
          currentPrice: price,
          invoiceDate: new Date(expenseYear, expenseMonth),
          status: invoiceStatus,
        });
      } else {
        const id = invoice.id;
        const currentPrice = invoice.currentPrice;

        invoice = await this.invoiceService.updatePrice(
          id,
          currentPrice + price,
        );
      }

      invoices.push(invoice);

      if (installments) {
        for (let i = 1; i <= installments - 1; i++) {
          const previousInvoice = invoices[i - 1];
          const nextInvoiceDate = previousInvoice.closingDate;
          nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);

          let installmentInvoice =
            await this.invoiceService.findByMonthAndCreditCard(
              creditCardId,
              creditCard.closingDay,
              nextInvoiceDate,
            );

          if (isNull(installmentInvoice) || isUndefined(installmentInvoice)) {
            installmentInvoice = await this.invoiceService.create({
              creditCard,
              currentPrice: price,
              invoiceDate: new Date(
                nextInvoiceDate.getFullYear(),
                nextInvoiceDate.getMonth(),
              ),
              status: InvoiceStatus.OPENED_FUTURE,
            });
          } else {
            const id = installmentInvoice.id;
            const currentPrice = installmentInvoice.currentPrice;

            installmentInvoice = await this.invoiceService.updatePrice(
              id,
              currentPrice + price,
            );
          }

          invoices.push(installmentInvoice);
        }
      }
    }

    const expense = this.expensesRepository.create({
      expenseType,
      status,
      name,
      price,
      bankAccount,
      creditCard,
      category,
      installments,
      invoice,
    });

    if (installments) {
      const newInstallments: CreateInstallmentDto[] = [];

      for (let i = 1; i <= installments; i++) {
        newInstallments.push({ creditCard, expense, invoice: invoices[i - 1] });
      }

      await this.installmentService.create(newInstallments);
    }

    await this.commonService.saveEntity(this.expensesRepository, expense);

    return expense;
  }

  public async payExpense(expenseId: number): Promise<IGenericMessageResponse> {
    await this.expensesRepository.save({
      id: expenseId,
      status: ExpenseStatus.PAID,
    });

    return this.commonService.generateGenericMessageResponse(`Despesa paga!`);
  }
}
