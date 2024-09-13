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
import { IInvoice } from '../interfaces/invoice.interface';
import { InvoiceEntity } from './invoice.entity';

@Entity({ name: 'installments' })
export class InstallmentEntity implements IInstallment {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => ExpenseEntity)
  public expense: IExpense;

  @ManyToOne(() => CreditCardEntity, (creditCard) => creditCard.installments)
  public creditCard: ICreditCard;

  @ManyToOne(() => InvoiceEntity)
  public invoice: IInvoice;

  @Column({ name: 'installment_number' })
  public installmentNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
