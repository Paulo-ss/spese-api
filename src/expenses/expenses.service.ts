import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Expense } from './entities/expense.entity';
import { DeepPartial, FindOptionsRelations } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { BankAccount } from 'src/bank-accounts/entities/bank.entity';
import { Invoice } from 'src/credit-cards/entities/invoice.entity';
import { InvoiceStatus } from 'src/credit-cards/enums/invoice-status.enum';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpenseStatus } from './enums/expense-status.enum';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoryService } from 'src/category/category.service';
import { RedisPublisher } from 'src/async-worker/publisher/redis.publisher';
import { ASYNC_WORKER } from 'src/common/constants/constants';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import { buildTransactionMessage } from '../async-worker/utils/messages.builders';
import { CreditCard } from '../credit-cards/entities/credit-card.entity';
import { Category } from '../category/entities/category.entity';
import { ExpenseRepository } from './expense.repository';
import { IExpense } from './interfaces/expense.interface';
import { Transactional } from '@nestjs-cls/transactional';
import * as dayjs from 'dayjs';

@Injectable()
export class ExpensesService {
    constructor(
        @Inject(forwardRef(() => InvoiceService))
        private readonly invoiceService: InvoiceService,
        private readonly bankAccountService: BankAccountsService,
        private readonly creditCardService: CreditCardsService,
        private readonly commonService: CommonService,
        private readonly categoryService: CategoryService,
        private readonly redisPublisher: RedisPublisher<ITransactionMessage>,
        private readonly expenseRepository: ExpenseRepository,
    ) {}

    public async findById(
        expenseId: number,
        userId: number,
        relations: FindOptionsRelations<Expense>,
    ): Promise<Expense> {
        const expense = await this.expenseRepository.findById(
            expenseId,
            userId,
            relations,
        );
        this.commonService.checkEntityExistence(expense, 'Expense');

        return expense;
    }

    public async findByFilters(
        filters: FindExpensesFiltersDto,
        ignoreCreditCard = false,
    ): Promise<Expense[]> {
        return await this.expenseRepository.findByFilters(
            filters,
            ignoreCreditCard,
        );
    }

    @Transactional()
    public async createInstallmentExpenses({
        createExpenseDto,
        userId,
        creditCard,
        invoices,
        bankAccount,
        customCategory,
    }: {
        createExpenseDto: CreateExpenseDto;
        userId: number;
        creditCard: CreditCard;
        invoices: Invoice[];
        bankAccount: BankAccount | null;
        customCategory: Category | null;
    }): Promise<void> {
        const {
            expenseType,
            name,
            price,
            category,
            customCategory: customCategoryId,
            installments,
            expenseDate,
        } = createExpenseDto;

        const installmentExpenses: DeepPartial<IExpense>[] = [];

        for (let i = 1; i <= installments; i++) {
            const nextMonthExpenseDate = dayjs(expenseDate)
                .add(1, 'month')
                .toDate();

            const installmentExpense: DeepPartial<IExpense> = {
                expenseType,
                status:
                    invoices[i - 1].status === InvoiceStatus.PAID
                        ? ExpenseStatus.PAID
                        : ExpenseStatus.PENDING,
                name,
                price,
                bankAccount,
                creditCard,
                category,
                customCategory: customCategoryId ? customCategory : null,
                invoice: invoices[i - 1],
                installmentNumber: i,
                totalInstallments: installments,
                userId,
                expenseDate:
                    i === 1
                        ? dayjs(expenseDate).toDate()
                        : nextMonthExpenseDate,
            };

            installmentExpenses.push(installmentExpense);
        }

        const expenses =
            await this.expenseRepository.upsert(installmentExpenses);

        void this.redisPublisher.batchPublishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED,
            messages: expenses.map((expense) =>
                buildTransactionMessage({
                    transaction: expense,
                    userId: expense.userId,
                    bankAccountId: expense.bankAccount?.id,
                    invoiceId: expense.invoice?.id,
                }),
            ),
        });
    }

    @Transactional()
    public async create(
        createExpenseDto: CreateExpenseDto,
        userId: number,
    ): Promise<Expense | IGenericMessageResponse> {
        const {
            expenseType,
            name,
            price,
            bankAccountId,
            category,
            customCategory: customCategoryId,
            creditCardId,
            installments,
            expenseDate,
            status,
        } = createExpenseDto;

        const creditCard = creditCardId
            ? await this.creditCardService.findById(creditCardId, userId)
            : null;

        let bankAccount: BankAccount | null = null;
        if (bankAccountId || creditCard?.bankAccount) {
            bankAccount = await this.bankAccountService.findById(
                bankAccountId ?? creditCard.bankAccount.id,
                userId,
            );
        }

        const customCategory = await this.categoryService.findById(
            customCategoryId,
            userId,
            false,
        );

        const invoices: Invoice[] = creditCard
            ? await this.invoiceService.createInvoicesForExpense({
                  creditCard,
                  expenseDate,
                  installments,
              })
            : [];

        if (installments) {
            await this.createInstallmentExpenses({
                createExpenseDto,
                userId,
                creditCard,
                invoices,
                bankAccount,
                customCategory,
            });

            return this.commonService.generateGenericMessageResponse(
                `Successfully created expenses split in ${installments} installments.`,
            );
        }

        const expense: DeepPartial<IExpense> = {
            expenseType,
            status,
            name,
            price,
            bankAccount,
            creditCard,
            category,
            customCategory: customCategoryId ? customCategory : null,
            invoice: invoices[0],
            userId,
            expenseDate: new Date(expenseDate),
        };

        const newExpense = await this.expenseRepository.upsert(expense);

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED,
            message: buildTransactionMessage({
                transaction: newExpense,
                userId: newExpense.userId,
                bankAccountId: newExpense.bankAccount?.id,
                invoiceId: newExpense.invoice?.id,
            }),
        });

        return newExpense;
    }

    public async update(
        expenseId: number,
        userId: number,
        updateDto: UpdateExpenseDto,
    ): Promise<Expense> {
        let expense = await this.expenseRepository.findById(expenseId, userId);
        const originalPrice = expense.price;

        if (updateDto.category) {
            expense.category = updateDto.category;
        }

        if (updateDto.customCategory) {
            expense.customCategory = await this.categoryService.findById(
                updateDto.customCategory,
                userId,
            );
        }

        if (updateDto.price) {
            expense.price = updateDto.price;
        }

        if (updateDto.name) {
            expense.name = updateDto.name;
        }

        expense = await this.expenseRepository.upsert(expense);

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_UPDATED,
            message: buildTransactionMessage({
                transaction: expense,
                userId: expense.userId,
                bankAccountId: expense.bankAccount?.id,
                originalPrice,
                invoiceId: expense.invoice?.id,
            }),
        });

        return expense;
    }

    public async payExpense(
        expenseId: number,
    ): Promise<IGenericMessageResponse> {
        await this.expenseRepository.upsert({
            id: expenseId,
            status: ExpenseStatus.PAID,
        });

        return this.commonService.generateGenericMessageResponse(
            `Expense paid!`,
        );
    }

    public async delete(
        id: number,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const expense = await this.expenseRepository.findById(id, userId);

        await this.expenseRepository.delete(expense);

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_DELETED,
            message: buildTransactionMessage({
                transaction: expense,
                userId: expense.userId,
                bankAccountId: expense.bankAccount?.id,
                invoiceId: expense.invoice?.id,
            }),
        });

        return this.commonService.generateGenericMessageResponse(
            'Successfully deleted expense!',
        );
    }
}
