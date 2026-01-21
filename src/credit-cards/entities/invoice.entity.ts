import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IInvoice } from '../interfaces/invoice.interface';
import { CreditCard } from './credit-card.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { NumericColumnTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';
import { ITransaction } from 'src/cash-flow/interfaces/cash-flow.interface';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';
import { VersionedUserEntityBase } from '../../common/entities/versioned-user-base.entity';

@Entity({ name: 'invoices' })
export class Invoice
    extends VersionedUserEntityBase
    implements IInvoice, ITransaction
{
    @PrimaryGeneratedColumn()
    public id: number;

    @Column('decimal', {
        name: 'current_price',
        precision: 10,
        scale: 2,
        transformer: new NumericColumnTransformer(),
    })
    public currentPrice: number;

    @Column('decimal', {
        name: 'total_price',
        precision: 10,
        scale: 2,
        transformer: new NumericColumnTransformer(),
    })
    public totalPrice: number;

    @Column('date', {
        name: 'closing_date',
    })
    public closingDate: Date;

    @Column('date', { name: 'due_date' })
    public dueDate: Date;

    @ManyToOne(() => CreditCard, (creditCard) => creditCard.invoices)
    @JoinColumn({ name: 'credit_card_id' })
    public creditCard: CreditCard;

    @OneToMany(() => Expense, (expense) => expense.invoice)
    public expenses: Expense[];

    @Column('enum', { name: 'status', enum: InvoiceStatus })
    public status: InvoiceStatus;

    get entityId(): number {
        return this.id;
    }

    get type(): TransactionType {
        return TransactionType.INVOICE;
    }

    get price(): number {
        return this.currentPrice;
    }

    get title(): string {
        return `Invoice ${this.dueDate} ${this.creditCard.lastFourDigits}`;
    }

    get start(): Date {
        return this.dueDate;
    }

    get end(): Date {
        return this.dueDate;
    }
}
