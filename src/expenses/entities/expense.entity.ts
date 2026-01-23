import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IExpense } from '../interfaces/expense.interface';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { ICreditCard } from 'src/credit-cards/interfaces/credit-card.interface';
import { ExpenseType } from '../enums/expense-type.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { BankAccount } from 'src/bank-accounts/entities/bank.entity';
import { CreditCard } from 'src/credit-cards/entities/credit-card.entity';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { IInvoice } from 'src/credit-cards/interfaces/invoice.interface';
import { Invoice } from 'src/credit-cards/entities/invoice.entity';
import { ISubscription } from 'src/credit-cards/interfaces/subscription.interface';
import { Subscription } from 'src/credit-cards/entities/subscription.entity';
import { ICategory } from 'src/category/interfaces/category.interface';
import { ITransaction } from 'src/cash-flow/interfaces/cash-flow.interface';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { NumericColumnTransformer } from '../../common/transformers/column-numeric-transformer.transformer';
import { Category } from '../../category/entities/category.entity';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'expenses' })
export class Expense
    extends VersionedUserEntityBase
    implements IExpense, ITransaction
{
    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.expenses)
    @JoinColumn({ name: 'bank_account_id' })
    public bankAccount?: IBankAccount;

    @ManyToOne(() => CreditCard, (creditCard) => creditCard.expenses)
    @JoinColumn({ name: 'credit_card_id' })
    public creditCard?: ICreditCard;

    @ManyToOne(() => Subscription, (subscription) => subscription.expenses, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'subscription_id' })
    public subscription?: ISubscription;

    @Column('enum', { name: 'expense_type', enum: ExpenseType })
    public expenseType: ExpenseType;

    @ManyToOne(() => Invoice, (invoice) => invoice.expenses, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'invoice_id' })
    public invoice?: IInvoice;

    @Column({
        name: 'installment_number',
        nullable: true,
        transformer: new NumericColumnTransformer(),
    })
    public installmentNumber?: number;

    @Column({
        name: 'total_installments',
        nullable: true,
        transformer: new NumericColumnTransformer(),
    })
    public totalInstallments?: number;

    @Column({ name: 'name' })
    public name: string;

    @Column('decimal', {
        name: 'price',
        precision: 10,
        scale: 2,
        transformer: new NumericColumnTransformer(),
    })
    public price: number;

    @Column('enum', { name: 'status', enum: ExpenseStatus })
    public status: ExpenseStatus;

    @Column('enum', { name: 'category', enum: ExpenseCategory, nullable: true })
    public category?: ExpenseCategory;

    @ManyToOne(() => Category, (customCategory) => customCategory.expenses, {
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'custom_category_id' })
    public customCategory?: ICategory;

    @Column('timestamp', {
        name: 'expense_date',
    })
    public expenseDate: Date;

    get entityId(): number {
        return this.id;
    }

    get type(): TransactionType {
        return TransactionType.EXPENSE;
    }

    get title(): string {
        return this.name;
    }

    get start(): Date {
        return this.expenseDate;
    }

    get end(): Date {
        return this.expenseDate;
    }
}
