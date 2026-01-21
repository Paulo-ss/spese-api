import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ICreditCard } from '../interfaces/credit-card.interface';
import { Banks } from 'src/bank-accounts/enums/banks.enum';
import { Invoice } from './invoice.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Subscription } from './subscription.entity';
import { BankAccount } from 'src/bank-accounts/entities/bank.entity';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'credit_cards' })
export class CreditCard extends VersionedUserEntityBase implements ICreditCard {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'nickname' })
    public nickname: string;

    @Column({ type: 'enum', enum: Banks })
    public bank: Banks;

    @Column('decimal', { name: 'limit', precision: 10, scale: 2 })
    public limit: number;

    @Column('integer', { name: 'closing_date' })
    public closingDay: number;

    @Column('integer', { name: 'due_date' })
    public dueDay: number;

    @Column({ name: 'last_four_digits' })
    public lastFourDigits: string;

    @OneToMany(() => Invoice, (invoice) => invoice.creditCard)
    public invoices?: Invoice[];

    @OneToMany(() => Subscription, (subscription) => subscription.creditCard)
    public subscriptions?: Subscription[];

    @ManyToOne(() => BankAccount, { nullable: true })
    @JoinColumn({ name: 'bank_account_id' })
    public bankAccount?: IBankAccount;

    @OneToMany(() => Expense, (expense) => expense.creditCard)
    public expenses?: Expense[];
}
