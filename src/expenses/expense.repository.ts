import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Expense } from './entities/expense.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial, FindOptionsRelations } from 'typeorm';
import { FindExpensesFiltersDto } from './dto/find-expenses-filters.dto';
import {
    formatDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
} from '../common/utils/dates.utils';
import { ExpenseCategory } from './enums/expense-category.enum';
import { IExpense } from './interfaces/expense.interface';

@Injectable()
export class ExpenseRepository extends BaseRepository<Expense> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, Expense);
    }

    public async findById(
        expenseId: number,
        userId: number,
        relations?: FindOptionsRelations<Expense>,
    ): Promise<Expense> {
        const defaultRelations: FindOptionsRelations<Expense> = {
            invoice: { creditCard: false, expenses: false },
            customCategory: { expenses: false },
        };

        return await this.repository.findOne({
            where: {
                id: expenseId,
                userId,
            },
            relations: relations ?? defaultRelations,
        });
    }

    public async findByFilters(
        filters: FindExpensesFiltersDto,
        ignoreCreditCard = false,
    ): Promise<Expense[]> {
        const query = this.repository
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

    public async upsert(expense: DeepPartial<IExpense>): Promise<Expense>;
    public async upsert(expenses: DeepPartial<IExpense>[]): Promise<Expense[]>;
    public async upsert(
        expenses: DeepPartial<IExpense> | DeepPartial<IExpense>[],
    ): Promise<Expense | Expense[]> {
        return await this.repository.save(
            this.repository.create(expenses as unknown),
        );
    }

    public async delete(expense: IExpense): Promise<void> {
        await this.repository.delete(expense);
    }
}
