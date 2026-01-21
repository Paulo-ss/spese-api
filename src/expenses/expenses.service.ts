import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExpenseEntity } from './entities/expense.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { InvoiceService } from 'src/credit-cards/invoice.service';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { CreditCardsService } from 'src/credit-cards/credit-cards.service';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { InvoiceEntity } from 'src/credit-cards/entities/invoice.entity';
import { InvoiceStatus } from 'src/credit-cards/enums/invoice-status.enum';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ExpenseStatus } from './enums/expense-status.enum';
import { ExpenseCategory } from './enums/expense-category.enum';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CategoryService } from 'src/category/category.service';
import { RedisPublisher } from 'src/async-worker/publisher/redis.publisher';
import { ASYNC_WORKER } from 'src/common/constants/constants';
import { ITransactionMessage } from 'src/async-worker/types/messages';
import {
    getFirstDayOfMonth,
    getLastDayOfMonth,
    formatDate,
} from '../common/utils/dates.utils';
import { buildTransactionMessage } from '../async-worker/utils/messages.builders';
import { CreditCardEntity } from '../credit-cards/entities/credit-card.entity';
import { CategoryEntity } from '../category/entities/category.entity';

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
        private readonly categoryService: CategoryService,
        @Inject()
        private readonly redisPublisher: RedisPublisher<ITransactionMessage>,
    ) {}

    public async findById(
        expenseId: number,
        userId: number,
        relations: FindOptionsRelations<ExpenseEntity> = {
            invoice: { creditCard: false, expenses: false },
            customCategory: { expenses: false },
        },
    ): Promise<ExpenseEntity> {
        const expense = await this.expensesRepository.findOne({
            where: {
                id: expenseId,
                userId,
            },
            relations,
        });
        this.commonService.checkEntityExistence(expense, 'Expense');

        return expense;
    }

    public async findByFilters(
        filters: FindExpensesFiltersDto,
        ignoreCreditCard = false,
    ): Promise<ExpenseEntity[]> {
        const query = this.expensesRepository
            .createQueryBuilder('e')
            .leftJoinAndSelect('e.bankAccount', 'ba')
            .leftJoinAndSelect('e.customCategory', 'cat')
            .leftJoin('e.creditCard', 'cc');

        if (filters.month) {
            const firstDayOfTheMonth = formatDate(
                getFirstDayOfMonth(filters.month),
                'YYYY-MM-DD',
            );
            const lastDayOfTheMonth = formatDate(
                getLastDayOfMonth(filters.month),
                'YYYY-MM-DD',
            );

            query.where(
                'e.expense_date between :firstDayOfTheMonth and :lastDayOfTheMonth',
                {
                    firstDayOfTheMonth: firstDayOfTheMonth,
                    lastDayOfTheMonth: lastDayOfTheMonth,
                },
            );
        }

        if (filters.fromDate && filters.toDate) {
            query.where('e.expense_date between :fromDate and :toDate', {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
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

        if (filters.type) {
            query.andWhere('e.expense_type = :type', { type: filters.type });
        }

        return query
            .andWhere('e.user_id = :userId', { userId: filters.userId })
            .orderBy('e.expense_date', 'DESC')
            .addOrderBy('cat.name', 'ASC')
            .getMany();
    }

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
        creditCard: CreditCardEntity;
        invoices: InvoiceEntity[];
        bankAccount: BankAccountEntity | null;
        customCategory: CategoryEntity | null;
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

        const installmentExpenses: ExpenseEntity[] = [];

        for (let i = 1; i <= installments; i++) {
            const nextMonthExpenseDate = new Date(expenseDate);
            nextMonthExpenseDate.setMonth(
                nextMonthExpenseDate.getMonth() + i - 1,
            );

            const installmentExpense = this.expensesRepository.create({
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
                    i === 1 ? new Date(expenseDate) : nextMonthExpenseDate,
            });

            const savedExpense = await this.commonService.saveEntity(
                this.expensesRepository,
                installmentExpense,
            );
            installmentExpenses.push(savedExpense);
        }

        void this.redisPublisher.batchPublishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED,
            messages: installmentExpenses.map((expense) =>
                buildTransactionMessage({
                    transaction: expense,
                    userId: expense.userId,
                    bankAccountId: expense.bankAccount?.id,
                    invoiceId: expense.invoice?.id,
                }),
            ),
        });
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
            customCategory: customCategoryId,
            creditCardId,
            installments,
            expenseDate,
            status,
        } = createExpenseDto;

        const creditCard = creditCardId
            ? await this.creditCardService.findById(creditCardId, userId)
            : null;

        let bankAccount: BankAccountEntity | null = null;
        if (bankAccountId || (creditCard && creditCard.bankAccount)) {
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

        const invoices: InvoiceEntity[] = creditCard
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

        const expense = this.expensesRepository.create({
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
        });

        await this.commonService.saveEntity(this.expensesRepository, expense);

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.EXPENSE_CREATED,
            message: buildTransactionMessage({
                transaction: expense,
                userId: expense.userId,
                bankAccountId: expense.bankAccount?.id,
                invoiceId: expense.invoice?.id,
            }),
        });

        return expense;
    }

    public async update(
        expenseId: number,
        userId: number,
        updateDto: UpdateExpenseDto,
    ): Promise<ExpenseEntity> {
        const expense = await this.findById(expenseId, userId);
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

        await this.commonService.saveEntity(this.expensesRepository, expense);

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
        await this.expensesRepository.save({
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
        const expense = await this.findById(id, userId);

        await this.commonService.removeEntity(this.expensesRepository, expense);

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
