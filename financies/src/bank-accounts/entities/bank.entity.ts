import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IBankAccount } from '../interfaces/bank-account.interface';
import { Banks } from '../enums/banks.enum';

@Entity({ name: 'bank_accounts' })
export class BankAccountEntity implements IBankAccount {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'bank', enum: Banks })
  public bank: Banks;

  @Column({ name: 'current_balance', nullable: true })
  public currentBalance?: number;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
