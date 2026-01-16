import { ITransaction } from '../../cash-flow/interfaces/cash-flow.interface';
import { ITransactionMessage } from '../types/messages';

export const buildTransactionMessage = ({
    transaction,
    userId,
    bankAccountId,
    originalPrice,
}: {
    transaction: ITransaction;
    userId: number;
    bankAccountId?: number;
    originalPrice?: number;
}): ITransactionMessage => {
    const timestamp =
        typeof transaction.start === 'string'
            ? transaction.start
            : transaction.start.toISOString();

    return {
        transactionType: transaction.type,
        entityId: transaction.entityId.toString(),
        userId,
        timestamp,
        price: transaction.price,
        originalPrice,
        description: transaction.title,
        bankAccountId,
    };
};
