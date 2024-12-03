import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICreditCard } from '../interfaces/credit-card.interface';
import { Banks } from 'src/bank-accounts/enums/banks.enum';
import { InvoiceEntity } from './invoice.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { SubscriptionEntity } from './subscription.entity';

@Entity({ name: 'credit_cards' })
export class CreditCardEntity implements ICreditCard {
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

  @Column({ name: 'user_id' })
  public userId: number;

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.creditCard)
  public invoices?: InvoiceEntity[];

  @OneToMany(
    () => SubscriptionEntity,
    (subscription) => subscription.creditCard,
  )
  public subscriptions?: SubscriptionEntity[];

  @OneToMany(() => ExpenseEntity, (expense) => expense.creditCard)
  public expenses?: ExpenseEntity[];

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
