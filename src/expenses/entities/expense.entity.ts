import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IExpense } from '../interfaces/expense.interface';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';
import { ICreditCard } from 'src/credit-cards/interfaces/credit-card.interface';
import { ExpenseType } from '../enums/expense-type.enum';
import { ExpenseStatus } from '../enums/expense-status.enum';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { CreditCardEntity } from 'src/credit-cards/entities/credit-card.entity';
import { ExpenseCategory } from '../enums/expense-category.enum';
import { IInvoice } from 'src/credit-cards/interfaces/invoice.interface';
import { InvoiceEntity } from 'src/credit-cards/entities/invoice.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { ISubscription } from 'src/credit-cards/interfaces/subscription.interface';
import { SubscriptionEntity } from 'src/credit-cards/entities/subscription.entity';
import { ICategory } from 'src/category/interfaces/category.interface';

@Entity({ name: 'expenses' })
export class ExpenseEntity implements IExpense {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => BankAccountEntity, (bankAccount) => bankAccount.expenses)
  public bankAccount?: IBankAccount;

  @ManyToOne(() => CreditCardEntity, (creditCard) => creditCard.expenses)
  public creditCard?: ICreditCard;

  @ManyToOne(
    () => SubscriptionEntity,
    (subscription) => subscription.expenses,
    { nullable: true, onDelete: 'SET NULL' },
  )
  public subscription?: ISubscription;

  @Column('enum', { name: 'expense_type', enum: ExpenseType })
  public expenseType: ExpenseType;

  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.expenses, {
    onDelete: 'SET NULL',
  })
  public invoice?: IInvoice;

  @Column({ name: 'installment_number', nullable: true })
  public installmentNumber?: number;

  @Column({ name: 'total_installments', nullable: true })
  public totalInstallments?: number;

  @Column({ name: 'name' })
  public name: string;

  @Column('decimal', { name: 'price', precision: 10, scale: 2 })
  public price: number;

  @Column('enum', { name: 'status', enum: ExpenseStatus })
  public status: ExpenseStatus;

  @Column('enum', { name: 'category', enum: ExpenseCategory, nullable: true })
  public category?: ExpenseCategory;

  @ManyToOne(
    () => CategoryEntity,
    (customCategory) => customCategory.expenses,
    { onDelete: 'SET NULL' },
  )
  public customCategory?: ICategory;

  @Column({ name: 'user_id' })
  public userId: number;

  @Column('date', { name: 'expense_date' })
  public expenseDate: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
