import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CalendarEventType } from 'src/analytics/enums/calendar-event-type.enum';
import { CashFlowDailyEntity } from './cash-flow-daily.entity';
import {
  ICashFlowDaily,
  ICashFlowTransaction,
} from '../interfaces/cash-flow.interface';

@Entity('cash_flow_transactions')
export class CashFlowTransactionEntity implements ICashFlowTransaction {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'reference_id', unique: true })
  public referenceId: string;

  @Column('enum', { name: 'type', enum: CalendarEventType })
  public type: CalendarEventType;

  @Column('decimal', { name: 'value', precision: 10, scale: 2 })
  public value: number;

  @Column({ name: 'title' })
  public title: string;

  @Column('date', { name: 'start' })
  public start: Date;

  @Column('date', { name: 'end' })
  public end: Date;

  @ManyToOne(() => CashFlowDailyEntity, (cashFlow) => cashFlow.events)
  public cashFlow: ICashFlowDaily;
}
