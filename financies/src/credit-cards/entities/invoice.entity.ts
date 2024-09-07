import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IInvoice } from '../interfaces/invoice.interface';
import { ICreditCard } from '../interfaces/credit-card.interface';
import { CreditCardEntity } from './credit-card.entity';

@Entity({ name: 'invoices' })
export class InvoiceEntity implements IInvoice {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'current_price' })
  public currentPrice: number;

  @Column('date', { name: 'invoice_date' })
  public invoiceDate: Date;

  @Column('integer', { name: 'credit_card' })
  @ManyToOne(() => CreditCardEntity)
  public creditCard: ICreditCard;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
