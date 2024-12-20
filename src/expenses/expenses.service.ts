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
import { InvoiceStatus } from 'src/credit-cards/enums/invoice-status.enum';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpenseStatus } from './enums/expense-status.enum';
import { ExpenseCategory } from './enums/expense-category.enum';
import { getInvoiceMonth } from 'src/credit-cards/utils/get-invoice-month.util';
import { ExpenseType } from './enums/expense-type.enum';
import { UpdateExpenseDto } from './dto/update-expense.dto';

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
    const expense = await this.expensesRepository.findOne({
      where: {
        id: expenseId,
        userId,
      },
      relations: {
        invoice: { creditCard: false, expenses: false },
      },
    });
    this.commonService.checkEntityExistence(expense, 'Despesa');

    return expense;
  }

  public async findBySubscription(
    subscriptionId: number,
  ): Promise<ExpenseEntity[]> {
    const expenses = await this.expensesRepository.find({
      where: {
        subscription: { id: subscriptionId },
      },
      relations: {
        invoice: {
          creditCard: false,
          expenses: {
            bankAccount: false,
            creditCard: false,
            invoice: false,
            subscription: false,
          },
        },
      },
    });

    return expenses;
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
      .leftJoinAndSelect('e.customCategory', 'cat')
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
        query.andWhere('e.customCategory = :customCategory', {
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
      .orderBy('e.expense_date', 'DESC')
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
      const today = new Date();

      invoice = await this.invoiceService.findByMonthAndCreditCard(
        creditCardId,
        creditCard.closingDay,
        new Date(expenseDate),
      );

      if (isNull(invoice) || isUndefined(invoice)) {
        const { month, year } = getInvoiceMonth(
          creditCard.closingDay,
          new Date(expenseDate),
        );

        let invoiceStatus: InvoiceStatus = InvoiceStatus.PAID;

        if (month > today.getMonth() || year > today.getFullYear()) {
          invoiceStatus = InvoiceStatus.OPENED_FUTURE;
        }

        const { month: currentInvoiceMonth, year: currentInvoiceYear } =
          getInvoiceMonth(creditCard.closingDay, new Date());
        if (month === currentInvoiceMonth && year === currentInvoiceYear) {
          invoiceStatus = InvoiceStatus.OPENED_CURRENT;
        }

        invoice = await this.invoiceService.create({
          creditCard,
          invoiceDate: new Date(expenseDate),
          status: invoiceStatus,
        });
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
            const { month, year } = getInvoiceMonth(
              creditCard.closingDay,
              new Date(previousInvoice.closingDate),
            );

            let invoiceStatus = InvoiceStatus.PAID;

            if (month > today.getMonth() || year > today.getFullYear()) {
              invoiceStatus = InvoiceStatus.OPENED_FUTURE;
            }

            const { month: currentInvoiceMonth, year: currentInvoiceYear } =
              getInvoiceMonth(creditCard.closingDay, new Date());
            if (month === currentInvoiceMonth && year === currentInvoiceYear) {
              invoiceStatus = InvoiceStatus.OPENED_CURRENT;
            }

            installmentInvoice = await this.invoiceService.create({
              creditCard,
              invoiceDate: new Date(
                nextInvoiceDate.getFullYear(),
                nextInvoiceDate.getMonth(),
              ),
              status: invoiceStatus,
            });
          }

          invoices.push(installmentInvoice);
        }

        const expenses: ExpenseEntity[] = [];
        for (let i = 1; i <= installments; i++) {
          const nextMonthExpenseDate = new Date(expenseDate);
          nextMonthExpenseDate.setMonth(
            nextMonthExpenseDate.getMonth() + i - 1,
          );

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
              totalInstallments: installments,
              userId,
              expenseDate:
                i === 1 ? new Date(expenseDate) : nextMonthExpenseDate,
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
      status:
        expenseType === ExpenseType.DEBIT
          ? ExpenseStatus.PAID
          : ExpenseStatus.PENDING,
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

  public async update(
    expenseId: number,
    userId: number,
    updateDto: UpdateExpenseDto,
  ): Promise<ExpenseEntity> {
    const expense = await this.findById(expenseId, userId);

    if (updateDto.category) {
      expense.category = updateDto.category;
    }

    if (updateDto.customCategory) {
      expense.customCategory = updateDto.customCategory;
    }

    if (updateDto.price) {
      expense.price = updateDto.price;
    }

    if (updateDto.name) {
      expense.name = updateDto.name;
    }

    if (updateDto.expenseDate) {
      expense.expenseDate = new Date(updateDto.expenseDate);
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
