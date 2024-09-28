import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { InvoiceEntity } from 'src/credit-cards/entities/invoice.entity';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { CreateInstallmentDto } from 'src/credit-cards/dto/create-installment.dto';
import { InvoiceStatus } from 'src/credit-cards/enums/invoice-status.enum';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpenseStatus } from './enums/expense-status.enum';
import { ExpenseCategory } from './enums/expense-category.enum';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly expensesRepository: Repository<ExpenseEntity>,
    @Inject(forwardRef(() => InvoiceService))
    private readonly invoiceService: InvoiceService,
    private readonly bankAccountService: BankAccountsService,
    private readonly creditCardService: CreditCardsService,
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
    ignoreCreditCard = false,
  ): Promise<ExpenseEntity[]> {
    const [fromMonth, fromYear] = filters.fromMonth.split('-').map(Number);
    const fromDate = new Date(fromYear, fromMonth - 1);
    const lastDayOfTheMonth = new Date(fromYear, fromMonth, 0);

    const query = this.expensesRepository
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.bankAccount', 'ba')
      .leftJoin('e.creditCard', 'cc')
      .where('e.expense_date between :fromMonth and :nextMonth', {
        fromMonth: fromDate,
        nextMonth: lastDayOfTheMonth,
      });

    if (filters.toMonth) {
      const [toMonth, toYear] = filters.toMonth.split('-').map(Number);

      query.where('e.expense_date between :fromMonth and :toMonth', {
        fromMonth: fromDate,
        toMonth: new Date(toYear, toMonth),
      });
    }

    if (filters.category) {
      if (filters.category === ExpenseCategory.CUSTOM) {
        query.andWhere('e.custom_category = :customCategory', {
          customCategory: filters.customCategory,
        });
      }

      if (filters.category !== ExpenseCategory.CUSTOM) {
        query.andWhere('e.category = :category', {
          category: filters.category,
        });
      }
    }

    if (filters.name) {
      query.andWhere('UPPER(e.name) like :name', {
        name: `%${filters.name.toUpperCase()}%`,
      });
    }

    if (filters.creditCardId) {
      query.andWhere('cc.id = :creditCardId', {
        creditCardId: filters.creditCardId,
      });
    }

    if (ignoreCreditCard) {
      query.andWhere('e.creditCard is null');
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

    return query
      .andWhere('e.user_id = :userId', { userId: filters.userId })
      .getMany();
  }

  public async create(
    createExpenseDto: CreateExpenseDto,
    userId: number,
  ): Promise<ExpenseEntity | IGenericMessageResponse> {
    const {
      expenseType,
      name,
      price,
      bankAccountId,
      category,
      customCategory,
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
      const expenseMonth = new Date(expenseDate).getMonth();

      invoice = await this.invoiceService.findByMonthAndCreditCard(
        creditCardId,
        creditCard.closingDay,
        new Date(expenseDate),
      );

      if (isNull(invoice) || isUndefined(invoice)) {
        const currentMonth = new Date().getMonth();
        const invoiceStatus =
          currentMonth === expenseMonth
            ? InvoiceStatus.OPENED_CURRENT
            : currentMonth < expenseMonth
              ? InvoiceStatus.PAID
              : InvoiceStatus.OPENED_FUTURE;

        invoice = await this.invoiceService.create({
          creditCard,
          currentPrice: price,
          invoiceDate: new Date(expenseDate),
          status: invoiceStatus,
        });
      } else {
        const id = invoice.id;
        const currentPrice = invoice.currentPrice;

        invoice = await this.invoiceService.updatePrice(
          id,
          parseFloat(String(currentPrice)) + price,
        );
      }

      invoices.push(invoice);

      if (installments) {
        for (let i = 1; i <= installments - 1; i++) {
          const previousInvoice = invoices[i - 1];
          const nextInvoiceDate = new Date(previousInvoice.closingDate);
          nextInvoiceDate.setMonth(nextInvoiceDate.getMonth() + 1);

          let installmentInvoice =
            await this.invoiceService.findByMonthAndCreditCard(
              creditCardId,
              creditCard.closingDay,
              new Date(previousInvoice.closingDate),
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
              parseFloat(String(currentPrice)) + price,
            );
          }

          invoices.push(installmentInvoice);
        }

        const expenses: ExpenseEntity[] = [];
        for (let i = 1; i <= installments; i++) {
          const invoiceDate = new Date(invoices[i - 1].closingDate);

          expenses.push(
            this.expensesRepository.create({
              expenseType,
              status: ExpenseStatus.PENDING,
              name,
              price,
              bankAccount,
              creditCard,
              category,
              customCategory,
              invoice: invoices[i - 1],
              installmentNumber: i,
              userId,
              expenseDate: invoiceDate,
            }),
          );
        }

        await this.commonService.saveMultipleEntities(
          this.expensesRepository,
          expenses,
        );

        return this.commonService.generateGenericMessageResponse(
          `Despesa criada com sucesso em ${installments} parcelas.`,
        );
      }
    }

    const expense = this.expensesRepository.create({
      expenseType,
      status: ExpenseStatus.PENDING,
      name,
      price,
      bankAccount,
      creditCard,
      category,
      customCategory,
      invoice: invoices[0],
      userId,
      expenseDate: new Date(expenseDate),
    });

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

  public async delete(
    id: number,
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const expense = await this.findById(id, userId);

    await this.commonService.removeEntity(this.expensesRepository, expense);

    return this.commonService.generateGenericMessageResponse(
      'Despesa deletada com sucesso!',
    );
  }
}
