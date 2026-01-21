import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import {
    isEmpty,
    isNull,
    isNullOrUndefined,
    isUndefined,
} from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { FilterIncomesDto } from './dto/filter-incomes.dto';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import {
    getFirstDayOfMonth,
    getLastDayOfMonth,
    formatDate,
} from '../common/utils/dates.utils';
import { RedisPublisher } from '../async-worker/publisher/redis.publisher';
import { ITransactionMessage } from '../async-worker/types/messages';
import { ASYNC_WORKER } from '../common/constants/constants';
import { buildTransactionMessage } from '../async-worker/utils/messages.builders';
import dayjs from 'dayjs';

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
        this.commonService.checkEntityExistence(income, 'Income');

        return income;
    }

    public async findByFilters(
        filters: FilterIncomesDto,
    ): Promise<IncomeEntity[]> {
        return await this.incomesRepository
            .createQueryBuilder('in')
            .where('in.income_month between :from and :to', {
                from: filters.fromDate,
                to: filters.toDate,
            })
            .andWhere('in.user_id = :userId', { userId: filters.userId })
            .orderBy('in.income_month', 'DESC')
            .getMany();
    }

    public async getUsersMonthTotalIncome(
        userId: number,
        incomeDate: string,
    ): Promise<number> {
        const firstDayOfTheMonth = formatDate(
            getFirstDayOfMonth(incomeDate),
            'YYYY-MM-DD',
        );
        const lastDayOfTheMonth = formatDate(
            getLastDayOfMonth(incomeDate),
            'YYYY-MM-DD',
        );

        const incomes = await this.incomesRepository
            .createQueryBuilder('in')
            .where('in.income_month between :from and :to', {
                from: firstDayOfTheMonth,
                to: lastDayOfTheMonth,
            })
            .andWhere('in.user_id = :userId', { userId })
            .getMany();

        if (isNullOrUndefined(incomes) || isEmpty(incomes)) {
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
        const newIncome = this.incomesRepository.create({
            name: createIncome.name,
            value: createIncome.value,
            incomeMonth: dayjs(createIncome.incomeMonth).toDate(),
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

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.INCOME_CREATED,
            message: buildTransactionMessage({
                transaction: newIncome,
                userId: newIncome.userId,
            }),
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

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.INCOME_UPDATED,
            message: buildTransactionMessage({
                transaction: updatedIncome,
                userId: updatedIncome.userId,
                originalPrice,
            }),
        });

        return updatedIncome;
    }

    public async delete(
        incomeId: number,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const income = await this.findById(incomeId, userId);

        await this.commonService.removeEntity(this.incomesRepository, income);

        void this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.INCOME_DELETED,
            message: buildTransactionMessage({
                transaction: income,
                userId: income.userId,
            }),
        });

        return this.commonService.generateGenericMessageResponse(
            'Successfully deleted income.',
        );
    }
}
