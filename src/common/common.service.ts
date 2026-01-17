import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    Logger,
    LoggerService,
    NotFoundException,
} from '@nestjs/common';
import { isNull, isUndefined } from './utils/validation.utils';
import { DataSource, EntityManager, Repository } from 'typeorm';
import slugify from 'slugify';
import { IGenericMessageResponse } from './interfaces/generic-message-response.interface';
import { v4 } from 'uuid';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { TransactionType } from '../cash-flow/interfaces/transaction-type';
import { OperationType } from './interfaces/operation-type';
import { getNegativeNumber } from './utils/numbers.utils';
import { ITransaction } from '../cash-flow/interfaces/cash-flow.interface';
import { formatInTimezone } from './utils/dates.utils';
import { RequestContextService } from './request-context.service';

@Injectable()
export class CommonService {
    private readonly loggerService: LoggerService;

    constructor(
        private dataSource: DataSource,
        private readonly requestContext: RequestContextService,
    ) {
        this.loggerService = new Logger(CommonService.name);
    }

    public formatName(title: string): string {
        return title
            .trim()
            .replace(/\n/g, ' ')
            .replace(/\s\s+/g, ' ')
            .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
    }

    public generatePointSlug(str: string): string {
        return slugify(str, {
            lower: true,
            replacement: '.',
            remove: /['_\.\-]/g,
        });
    }

    public generateGenericMessageResponse(
        message: string,
    ): IGenericMessageResponse {
        return { id: v4(), message };
    }

    public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
        try {
            return await promise;
        } catch (error) {
            this.loggerService.error(error);

            if (error.code === '23505') {
                throw new ConflictException(
                    message ?? 'Duplicated value in database',
                );
            }

            throw new BadRequestException(error.message);
        }
    }

    public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            this.loggerService.error(error);
            throw new InternalServerErrorException(error);
        }
    }

    public checkEntityExistence<T>(
        entity: T | null | undefined,
        name: string,
    ): void {
        if (isNull(entity) || isUndefined(entity)) {
            throw new NotFoundException(`${name} não encontrado.`);
        }
    }

    public async saveEntity<T>(repo: Repository<T>, entity: T) {
        return await this.throwDuplicateError(repo.save(entity));
    }

    public async saveMultipleEntities<T>(repo: Repository<T>, entities: T[]) {
        return await this.throwDuplicateError(repo.save(entities));
    }

    public async removeEntity<T>(repo: Repository<T>, entity: T) {
        await this.throwInternalError(repo.remove(entity));
    }

    public async removeMultipleEntities<T>(repo: Repository<T>, entity: T[]) {
        await this.throwInternalError(repo.remove(entity));
    }

    public async confirmTransaction<T>(
        callback: (entityManager: EntityManager) => Promise<T>,
    ) {
        return this.dataSource.transaction(async (entityManager) => {
            return await callback(entityManager);
        });
    }

    public async getCurrentUserId(@CurrentUser() userId: number) {
        return userId;
    }

    public transformPriceByTransactionAndOperationType({
        transactionType,
        operation,
        price,
        originalPrice,
    }: {
        transactionType: TransactionType;
        operation: OperationType;
        price: number;
        originalPrice?: number;
    }): number {
        const outcomeOperations = {
            [OperationType.INSERT]: getNegativeNumber(price),
            [OperationType.UPDATE]: originalPrice - price,
            [OperationType.DELETE]: price,
        };

        const operationsMap = {
            [TransactionType.INCOME]: {
                [OperationType.INSERT]: price,
                [OperationType.UPDATE]: price - originalPrice,
                [OperationType.DELETE]: getNegativeNumber(price),
            },
            [TransactionType.EXPENSE]: outcomeOperations,
            [TransactionType.INVOICE]: outcomeOperations,
        };

        return operationsMap[transactionType][operation];
    }

    public mapToTransaction({
        transactions,
    }: {
        transactions: ITransaction[];
    }): ITransaction[] {
        const userTimezone = this.requestContext.getTimezone();

        return transactions.map((transaction) => ({
            title: transaction.title,
            price: transaction.price,
            entityId: transaction.entityId,
            type: transaction.type,
            start: formatInTimezone(transaction.start, userTimezone),
            end: formatInTimezone(transaction.end, userTimezone),
        }));
    }
}
