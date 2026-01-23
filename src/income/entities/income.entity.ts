import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IIncome } from '../interfaces/income.interface';
import { BankAccount } from 'src/bank-accounts/entities/bank.entity';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { ITransaction } from 'src/cash-flow/interfaces/cash-flow.interface';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { NumericColumnTransformer } from '../../common/transformers/column-numeric-transformer.transformer';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'incomes' })
export class Income
    extends VersionedUserEntityBase
    implements IIncome, ITransaction
{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'name' })
    public name: string;

    @Column('decimal', {
        name: 'value',
        precision: 10,
        scale: 2,
        transformer: new NumericColumnTransformer(),
    })
    public value: number;

    @ManyToOne(() => BankAccount, { nullable: true })
    @JoinColumn({ name: 'bank_account_id' })
    public bankAccount?: IBankAccount;

    @Column('date', {
        name: 'income_date',
    })
    public incomeDate: Date;

    get entityId(): number {
        return this.id;
    }

    get type(): TransactionType {
        return TransactionType.INCOME;
    }

    get price(): number {
        return this.value;
    }

    get title(): string {
        return this.name;
    }

    get start(): Date {
        return this.incomeDate;
    }

    get end(): Date {
        return this.incomeDate;
    }
}
