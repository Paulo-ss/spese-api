import {
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { isNull, isUndefined } from './utils/validation.utils';
import slugify from 'slugify';
import { IGenericMessageResponse } from './interfaces/generic-message-response.interface';
import { v4 } from 'uuid';
import { TransactionType } from '../cash-flow/interfaces/transaction-type';
import { OperationType } from './interfaces/operation-type';
import { getNegativeNumber } from './utils/numbers.utils';
import { ITransaction } from '../cash-flow/interfaces/cash-flow.interface';
import { formatDate } from './utils/dates.utils';

@Injectable()
export class CommonService {
    private readonly logger = new Logger(CommonService.name);

    public formatName(title: string): string {
        return title
            .trim()
            .replaceAll(/\n/g, ' ')
            .replaceAll(/\s\s+/g, ' ')
            .replaceAll(/\w\S*/g, (w) =>
                w.replace(/^\w/, (l) => l.toUpperCase()),
            );
    }

    public generatePointSlug(str: string): string {
        return slugify(str, {
            lower: true,
            replacement: '.',
            remove: /['_.-]/g,
        });
    }

    public generateGenericMessageResponse(
        message: string,
    ): IGenericMessageResponse {
        return { id: v4(), message };
    }

    public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
        try {
            return await promise;
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException(error);
        }
    }

    public checkEntityExistence<T>(
        entity: T | null | undefined,
        name: string,
    ): void {
        if (isNull(entity) || isUndefined(entity)) {
            throw new NotFoundException(`${name} not found.`);
        }
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
        return transactions.map((transaction) => ({
            title: transaction.title,
            price: transaction.price,
            entityId: transaction.entityId,
            type: transaction.type,
            start: formatDate(transaction.start, 'YYYY-MM-DD'),
            end: formatDate(transaction.end, 'YYYY-MM-DD'),
        }));
    }
}
