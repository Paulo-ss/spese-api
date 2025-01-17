import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IInvoice } from '../interfaces/invoice.interface';
import { CreditCardEntity } from './credit-card.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

@Entity({ name: 'invoices' })
export class InvoiceEntity implements IInvoice {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('decimal', {
    name: 'current_price',
    precision: 10,
    scale: 2,
  })
  public currentPrice: number;

  @Column('date', { name: 'closing_date' })
  public closingDate: Date;

  @Column('date', { name: 'due_date' })
  public dueDate: Date;

  @ManyToOne(() => CreditCardEntity, (creditCard) => creditCard.invoices)
  public creditCard: CreditCardEntity;

  @OneToMany(() => ExpenseEntity, (expense) => expense.invoice)
  public expenses: ExpenseEntity[];

  @Column('enum', { name: 'status', enum: InvoiceStatus })
  public status: InvoiceStatus;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @Column({ name: 'user_id' })
  public userId: number;
}
