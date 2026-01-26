import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Income } from './entities/income.entity';
import {
    InjectTransactionHost,
    TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';
import { FilterIncomesDto } from './dto/filter-incomes.dto';

@Injectable()
export class IncomeRepository extends BaseRepository<Income> {
    constructor(
        @InjectTransactionHost('default')
        txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    ) {
        super(txHost, Income);
    }

    public async findById(incomeId: number, userId: number): Promise<Income> {
        return await this.repository.findOne({
            where: {
                id: incomeId,
                userId,
            },
            relations: {
                bankAccount: { expenses: false },
            },
        });
    }

    public async findByFilters(filters: FilterIncomesDto): Promise<Income[]> {
        return await this.repository
            .createQueryBuilder('in')
            .where('in.income_date between :from and :to', {
                from: filters.fromDate,
                to: filters.toDate,
            })
            .andWhere('in.user_id = :userId', { userId: filters.userId })
            .orderBy('in.income_date', 'DESC')
            .getMany();
    }

    public async upsert(income: DeepPartial<Income>): Promise<Income> {
        return await this.repository.save(this.repository.create(income));
    }

    public async delete(income: Income): Promise<void> {
        await this.repository.remove(income);
    }
}
