import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IBankAccount } from '../interfaces/bank-account.interface';
import { Banks } from '../enums/banks.enum';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { ColumnNumericTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';

@Entity({ name: 'bank_accounts' })
export class BankAccountEntity implements IBankAccount {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'bank', enum: Banks })
  public bank: Banks;

  @Column('decimal', {
    name: 'current_balance',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  public currentBalance?: number;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;

  @OneToMany(() => ExpenseEntity, (expense) => expense.bankAccount)
  public expenses?: ExpenseEntity[];
}
