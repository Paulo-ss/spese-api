import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IWage } from '../interfaces/wage.interface';
import { WageBusinessDay } from '../enums/wage-business-day.enum';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { IBankAccount } from 'src/bank-accounts/interfaces/bank-account.interface';

@Entity({ name: 'wages' })
export class WageEntity implements IWage {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column('decimal', { name: 'wage', precision: 10, scale: 2 })
  public wage: number;

  @Column({ name: 'payment_day' })
  public paymentDay: number;

  @Column('enum', {
    name: 'business_day',
    enum: WageBusinessDay,
  })
  public businessDay: WageBusinessDay;

  @ManyToOne(() => BankAccountEntity, { nullable: true })
  public bankAccount?: IBankAccount;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
