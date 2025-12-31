import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IIncome } from '../interfaces/income.interface';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';

@Entity({ name: 'incomes' })
export class IncomeEntity implements IIncome {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'name' })
  public name: string;

  @Column('decimal', { name: 'value', precision: 10, scale: 2 })
  public value: number;

  @ManyToOne(() => BankAccountEntity, { nullable: true })
  public bankAccount?: IBankAccount;

  @Column({ name: 'user_id' })
  public userId: number;

  @Column('date', { name: 'income_month' })
  public incomeMonth: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
