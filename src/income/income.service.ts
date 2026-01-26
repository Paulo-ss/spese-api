import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Income } from './entities/income.entity';
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
import { RedisPublisher } from '../async-worker/publisher/redis.publisher';
import { ITransactionMessage } from '../async-worker/types/messages';
import { ASYNC_WORKER } from '../common/constants/constants';
import { buildTransactionMessage } from '../async-worker/utils/messages.builders';
import { IncomeRepository } from './income.repository';
import * as dayjs from 'dayjs';
import {
    formatDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
} from '../common/utils/dates.utils';

@Injectable()
export class IncomeService {
    constructor(
        private readonly incomeRepository: IncomeRepository,
        private readonly commonService: CommonService,
        @Inject(forwardRef(() => BankAccountsService))
        private readonly bankAccountService: BankAccountsService,
        private readonly redisPublisher: RedisPublisher<ITransactionMessage>,
    ) {}

    public async findById(incomeId: number, userId: number): Promise<Income> {
        const income = await this.incomeRepository.findById(incomeId, userId);
        this.commonService.checkEntityExistence(income, 'Income');

        return income;
    }

    public async findByFilters(filters: FilterIncomesDto): Promise<Income[]> {
        return await this.incomeRepository.findByFilters(filters);
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

        const incomes = await this.findByFilters({
            fromDate: firstDayOfTheMonth,
            toDate: lastDayOfTheMonth,
            userId,
        });

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
    ): Promise<Income> {
        const newIncome = await this.incomeRepository.upsert({
            name: createIncome.name,
            value: createIncome.value,
            incomeDate: dayjs(createIncome.incomeDate).toDate(),
            bankAccount: createIncome.bankAccountId
                ? await this.bankAccountService.findById(
                      createIncome.bankAccountId,
                      userId,
                      false,
                  )
                : undefined,
            userId,
        });

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
    ): Promise<Income> {
        const income = await this.findById(incomeId, userId);
        const originalPrice = income.price;

        if (!isUndefined(name) && !isNull(name)) {
            income.name = name;
        }

        if (!isUndefined(value) && !isNull(value)) {
            income.value = value;
        }

        const updatedIncome = await this.incomeRepository.upsert(income);

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

        await this.incomeRepository.delete(income);

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
