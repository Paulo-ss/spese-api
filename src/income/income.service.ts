import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { isEmpty } from 'class-validator';
import { FilterIncomesDto } from './dto/filter-incomes.dto';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import {
    getMonthAndDayAndYear,
    getMonthAndYear,
} from '../common/utils/dates.utils';
import { RedisPublisher } from '../async-worker/publisher/redis.publisher';
import { ITransactionMessage } from '../async-worker/types/messages';
import { ASYNC_WORKER } from '../common/constants/constants';
import { TransactionType } from '../cash-flow/interfaces/transaction-type';
import { buildTransactionMessages } from '../async-worker/utils/messages.builders';

@Injectable()
export class IncomeService {
    constructor(
        @InjectRepository(IncomeEntity)
        private readonly incomesRepository: Repository<IncomeEntity>,
        private readonly commonService: CommonService,
        @Inject(forwardRef(() => BankAccountsService))
        private readonly bankAccountService: BankAccountsService,
        private readonly redisPublisher: RedisPublisher<ITransactionMessage>,
    ) {}

    public async findById(
        incomeId: number,
        userId: number,
    ): Promise<IncomeEntity> {
        const income = await this.incomesRepository.findOne({
            where: {
                id: incomeId,
                userId,
            },
            relations: {
                bankAccount: { expenses: false },
            },
        });
        this.commonService.checkEntityExistence(income, 'Renda');

        return income;
    }

    public async findByFilters(
        filters: FilterIncomesDto,
    ): Promise<IncomeEntity[]> {
        const [month, day, year] = getMonthAndYear(filters.fromDate);
        const [toMonth, toDay, toYear] = getMonthAndYear(filters.toDate);

        const query = this.incomesRepository
            .createQueryBuilder('in')
            .where('in.income_month between :from and :to', {
                from: new Date(year, month - 1, day),
                to: new Date(toYear, toMonth - 1, toDay),
            });

        if (filters.userId) {
            query.andWhere('in.user_id = :userId', { userId: filters.userId });
        }

        query.orderBy('in.income_month', 'DESC');

        return query.getMany();
    }

    public async getUsersMonthTotalIncome(
        userId: number,
        incomeDate: string,
    ): Promise<number> {
        const [month, year] = getMonthAndYear(incomeDate);
        const firstDayOfTheMonth = new Date(year, month - 1)
            .toISOString()
            .split('T')[0];
        const lastDayOfTheMonth = new Date(year, month, 0)
            .toISOString()
            .split('T')[0];

        const incomes = await this.incomesRepository
            .createQueryBuilder('in')
            .where('in.income_month between :from and :to', {
                from: firstDayOfTheMonth,
                to: lastDayOfTheMonth,
            })
            .andWhere('in.user_id = :userId', { userId })
            .getMany();

        if (isNull(incomes) || isUndefined(incomes) || isEmpty(incomes)) {
            return 0;
        }

        return incomes.reduce((monthTotal, income) => {
            return monthTotal + Number(income.value);
        }, 0);
    }

    public async create(
        createIncome: CreateIncomeDto,
        userId: number,
    ): Promise<IncomeEntity> {
        const [month, day, year] = getMonthAndDayAndYear(
            createIncome.incomeMonth,
        );

        const newIncome = this.incomesRepository.create({
            name: createIncome.name,
            value: createIncome.value,
            incomeMonth: new Date(year, month - 1, day),
            bankAccount: createIncome.bankAccountId
                ? await this.bankAccountService.findById(
                      createIncome.bankAccountId,
                      userId,
                      false,
                  )
                : undefined,
            userId: userId,
        });

        await this.commonService.saveEntity(this.incomesRepository, newIncome);

        this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.INCOME_CREATED,
            message: buildTransactionMessages({
                transactions: newIncome,
                userId: newIncome.userId,
            }) as ITransactionMessage,
        });

        return newIncome;
    }

    public async update(
        { name, value }: UpdateIncomeDto,
        userId: number,
        incomeId: number,
    ): Promise<IncomeEntity> {
        const income = await this.findById(incomeId, userId);
        const originalPrice = income.price;

        if (!isUndefined(name) && !isNull(name)) {
            income.name = name;
        }

        if (!isUndefined(value) && !isNull(value)) {
            income.value = value;
        }

        const updatedIncome = await this.commonService.saveEntity(
            this.incomesRepository,
            income,
        );

        this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.INCOME_UPDATED,
            message: {
                userId: updatedIncome.userId,
                price: updatedIncome.price,
                originalPrice,
                bankAccountId: updatedIncome.bankAccount?.id,
                description: updatedIncome.title,
                entityId: updatedIncome.id.toString(),
                timestamp: updatedIncome.incomeMonth.toISOString(),
                transactionType: TransactionType.INCOME,
            },
        });

        return updatedIncome;
    }

    public async delete(
        incomeId: number,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const income = await this.findById(incomeId, userId);

        await this.commonService.removeEntity(this.incomesRepository, income);

        return this.commonService.generateGenericMessageResponse(
            'Renda deletada com sucesso.',
        );
    }
}
