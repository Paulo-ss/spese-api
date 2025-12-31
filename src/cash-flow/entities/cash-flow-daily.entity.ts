import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICashFlowDaily } from '../interfaces/cash-flow.interface';

@Entity('cash_flow_days')
export class CashFlowDayEntity implements ICashFlowDaily {
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

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
