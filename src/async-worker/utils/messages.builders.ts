import { ITransaction } from '../../cash-flow/interfaces/cash-flow.interface';
import { ITransactionMessage } from '../types/messages';

export const buildTransactionMessages = ({
    transactions,
    userId,
    bankAccountId,
    originalPrice,
}: {
    transactions: ITransaction | ITransaction[];
    userId: number;
    bankAccountId?: number;
    originalPrice?: number;
}): ITransactionMessage | ITransactionMessage[] => {
    const builder = (transaction: ITransaction): ITransactionMessage => {
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

    return Array.isArray(transactions)
        ? transactions.map(builder)
        : builder(transactions);
};
