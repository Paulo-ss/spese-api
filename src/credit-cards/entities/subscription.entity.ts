import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ISubscription } from '../interfaces/subscription.interface';
import { CreditCard } from './credit-card.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { IExpense } from 'src/expenses/interfaces/expense.interface';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';
import { NumericColumnTransformer } from '../../common/transformers/column-numeric-transformer.transformer';

@Entity({ name: 'subscriptions' })
export class Subscription
    extends VersionedUserEntityBase
    implements ISubscription
{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'name' })
    public name: string;

    @Column('decimal', {
        name: 'price',
        precision: 10,
        scale: 2,
        transformer: new NumericColumnTransformer(),
    })
    public price: number;

    @ManyToOne(() => CreditCard, (creditCard) => creditCard.subscriptions)
    @JoinColumn({ name: 'credit_card_id' })
    public creditCard: CreditCard;

    @OneToMany(() => Expense, (expense) => expense.subscription)
    public expenses: IExpense[];

    @Column({ name: 'billing_day', nullable: true })
    public billingDay: number;
}
