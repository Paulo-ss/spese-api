import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ISubscription } from '../interfaces/subscription.interface';
import { CreditCardEntity } from './credit-card.entity';

@Entity({ name: 'subscriptions' })
export class SubscriptionEntity implements ISubscription {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'name' })
  public name: string;

  @Column('decimal', { name: 'price', precision: 10, scale: 2 })
  public price: number;

  @ManyToOne(() => CreditCardEntity, (creditCard) => creditCard.subscriptions)
  public creditCard: CreditCardEntity;

  @Column({ name: 'user_id' })
  public userId: number;

  @CreateDateColumn({ name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  public updatedAt: Date;
}
