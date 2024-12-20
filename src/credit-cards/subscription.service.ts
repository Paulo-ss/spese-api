import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreditCardsService } from './credit-cards.service';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpensesService } from 'src/expenses/expenses.service';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { ExpenseType } from 'src/expenses/enums/expense-type.enum';
import { ExpenseCategory } from 'src/expenses/enums/expense-category.enum';
import { ExpenseStatus } from 'src/expenses/enums/expense-status.enum';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(ExpenseEntity)
    private readonly expensesRepository: Repository<ExpenseEntity>,
    @Inject() private readonly creditCardService: CreditCardsService,
    private readonly commonService: CommonService,
    private readonly expensesService: ExpensesService,
  ) {}

  public async findById(id: number): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: {
        creditCard: true,
        expenses: {
          creditCard: false,
          bankAccount: false,
          subscription: false,
          invoice: { creditCard: false, expenses: false },
        },
      },
    });
    this.commonService.checkEntityExistence(subscription, 'Assinatura');

    return subscription;
  }

  public async findByUser(userId: number): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepository.find({
      where: { userId },
      relations: { creditCard: true },
    });
  }

  public async findByCreditCard(
    creditCardId: number,
  ): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepository.find({
      where: { creditCard: { id: creditCardId } },
      relations: { creditCard: true },
    });
  }

  public async create(
    subscription: CreateSubscriptionDto,
    userId: number,
  ): Promise<SubscriptionEntity> {
    const creditCard = await this.creditCardService.findById(
      subscription.creditCardId,
      userId,
    );

    const newSubscription = this.subscriptionRepository.create({
      ...subscription,
      creditCard,
      userId,
    });

    await this.commonService.saveEntity(
      this.subscriptionRepository,
      newSubscription,
    );

    if (creditCard.invoices && creditCard.invoices.length > 0) {
      const openedInvoices = creditCard.invoices.filter(
        (invoice) =>
          invoice.status === InvoiceStatus.OPENED_CURRENT ||
          invoice.status === InvoiceStatus.OPENED_FUTURE,
      );

      if (openedInvoices.length > 0) {
        const subscriptionsExpenses: IExpense[] = [];

        for (const invoice of openedInvoices) {
          const [year, month, day] = new Date(invoice.closingDate)
            .toISOString()
            .split('T')[0]
            .split('-')
            .map(Number);

          const billingMonth =
            subscription.billingDay < day ? month : month - 1;
          const billingDate = new Date(
            year,
            billingMonth - 1,
            subscription.billingDay,
          );

          const expense = this.expensesRepository.create({
            expenseType: ExpenseType.CREDIT_CARD,
            expenseDate: billingDate,
            userId: creditCard.userId,
            category: ExpenseCategory.SUBSCRIPTION,
            creditCard,
            status: ExpenseStatus.PENDING,
            subscription: newSubscription,
            name: subscription.name,
            price: subscription.price,
            invoice: invoice,
          });

          subscriptionsExpenses.push(expense);
        }

        await this.commonService.saveMultipleEntities(
          this.expensesRepository,
          subscriptionsExpenses,
        );
      }
    }

    return newSubscription;
  }

  public async update(
    id: number,
    dto: UpdateSubscriptionDto,
    userId: number,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    const creditCard = dto.creditCardId
      ? await this.creditCardService.findById(dto.creditCardId, userId)
      : null;

    if (creditCard) {
      subscription.creditCard = creditCard;
    }

    if (dto.name) {
      subscription.name = dto.name;
    }

    if (dto.price) {
      subscription.price = dto.price;
    }

    if (dto.billingDay) {
      subscription.billingDay = dto.billingDay;
    }

    await this.commonService.saveEntity(
      this.subscriptionRepository,
      subscription,
    );

    const subscriptionExpenses =
      await this.expensesService.findBySubscription(id);

    if (subscriptionExpenses.length > 0) {
      for (const expense of subscriptionExpenses) {
        const [year, month] = `${expense.expenseDate}`.split('-').map(Number);
        const newExpenseDate = new Date(year, month - 1, dto.billingDay)
          .toLocaleDateString('en')
          .replaceAll('/', '-');

        await this.expensesService.update(expense.id, userId, {
          expenseDate: newExpenseDate,
          name: dto.name,
          price: dto.price,
        });
      }
    }

    return subscription;
  }

  public async delete(id: number): Promise<IGenericMessageResponse> {
    const subscription = await this.findById(id);

    await this.commonService.removeEntity(
      this.subscriptionRepository,
      subscription,
    );

    if (subscription.expenses.length > 0) {
      for (const expense of subscription.expenses) {
        if (expense.invoice.status === InvoiceStatus.OPENED_CURRENT) {
          expense.subscription = null;
          await this.commonService.saveEntity(this.expensesRepository, expense);

          if (new Date(expense.expenseDate) > new Date()) {
            await this.expensesService.delete(expense.id, expense.userId);
          }

          continue;
        }

        if (expense.invoice.status === InvoiceStatus.OPENED_FUTURE) {
          expense.subscription = null;

          await this.commonService.saveEntity(this.expensesRepository, expense);
          await this.expensesService.delete(expense.id, expense.userId);
        }
      }
    }

    return this.commonService.generateGenericMessageResponse(
      'Assinatura removida com sucesso.',
    );
  }
}
