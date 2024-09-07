import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

@Entity({ name: 'expenses' })
export class ExpenseEntity implements IExpense {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('integer', { name: 'bank_account', nullable: true })
  @ManyToOne(() => BankAccountEntity)
  public bankAccount?: IBankAccount;

  @Column('integer', { name: 'credit_card', nullable: true })
  @ManyToOne(() => CreditCardEntity)
  public creditCard?: ICreditCard;

  @Column({ name: 'expense_type', enum: ExpenseType })
  public expenseType: ExpenseType;

  @Column({ name: 'installments', nullable: true })
  public installments?: number;

  @Column({ name: 'monthly', default: false })
  public monthly: boolean;

  @Column({ name: 'name' })
  public name: string;

  @Column('decimal', { name: 'price', precision: 10, scale: 2 })
  public price: number;

  @Column({ name: 'status', enum: ExpenseStatus })
  public status: ExpenseStatus;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
