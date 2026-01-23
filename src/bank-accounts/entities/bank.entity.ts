import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IBankAccount } from '../interfaces/bank-account.interface';
import { Banks } from '../enums/banks.enum';
import { Expense } from 'src/expenses/entities/expense.entity';
import { NumericColumnTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'bank_accounts' })
export class BankAccount
    extends VersionedUserEntityBase
    implements IBankAccount
{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'bank', enum: Banks })
    public bank: Banks;

    @Column('decimal', {
        name: 'current_balance',
        precision: 10,
        scale: 2,
        nullable: true,
        transformer: new NumericColumnTransformer(),
    })
    public currentBalance?: number;

    @OneToMany(() => Expense, (expense) => expense.bankAccount)
    public expenses?: Expense[];
}
