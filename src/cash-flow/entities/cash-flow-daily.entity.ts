import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ICashFlowDaily,
  ICashFlowTransaction,
} from '../interfaces/cash-flow.interface';
import { CashFlowTransactionEntity } from './cash-flow-transactions.entity';

@Entity('daily_cash_flow')
export class CashFlowDailyEntity implements ICashFlowDaily {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('decimal', {
    name: 'opening_balance',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  public openingBalance: number;

  @Column('decimal', {
    name: 'closing_balance',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  public closingBalance: number;

  @Column('date', { name: 'date' })
  public date: Date;

  @Column({ name: 'user_id' })
  public userId: number;

  @OneToMany(() => CashFlowTransactionEntity, (event) => event.cashFlow)
  public events: ICashFlowTransaction[];

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
