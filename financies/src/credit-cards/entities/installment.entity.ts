import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IInstallment } from '../interfaces/installment.interface';
import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { ICreditCard } from '../interfaces/credit-card.interface';
import { CreditCardEntity } from './credit-card.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';

@Entity({ name: 'installments' })
export class InstallmentEntity implements IInstallment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('integer', { name: 'expense' })
  @ManyToOne(() => ExpenseEntity)
  public expense: IExpense;

  @Column('integer', { name: 'credit_card' })
  @ManyToOne(() => CreditCardEntity)
  public creditCard: ICreditCard;

  @Column({ name: 'installment_number' })
  public installmentNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
