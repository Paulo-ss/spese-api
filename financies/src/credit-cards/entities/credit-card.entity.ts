import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICreditCard } from '../interfaces/credit-card.interface';
import { Banks } from 'src/bank-accounts/enums/banks.enum';

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

  @Column('timestamp', { name: 'closing_date' })
  public closingDate: Date;

  @Column('timestamp', { name: 'due_date' })
  public dueDate: Date;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
