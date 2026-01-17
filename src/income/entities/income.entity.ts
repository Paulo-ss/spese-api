import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IIncome } from '../interfaces/income.interface';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { ITransaction } from 'src/cash-flow/interfaces/cash-flow.interface';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { NumericColumnTransformer } from '../../common/transformers/column-numeric-transformer.transformer';

@Entity({ name: 'incomes' })
export class IncomeEntity implements IIncome, ITransaction {
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

    @ManyToOne(() => BankAccountEntity, { nullable: true })
    public bankAccount?: IBankAccount;

    @Column({ name: 'user_id', transformer: new NumericColumnTransformer() })
    public userId: number;

    @Column('timestamp', {
        name: 'income_month',
    })
    public incomeMonth: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    public updatedAt: Date;

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
        return this.incomeMonth;
    }

    get end(): Date {
        return this.incomeMonth;
    }
}
