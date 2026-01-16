import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IInvoice } from '../interfaces/invoice.interface';
import { CreditCardEntity } from './credit-card.entity';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { NumericColumnTransformer } from 'src/common/transformers/column-numeric-transformer.transformer';
import { ITransaction } from 'src/cash-flow/interfaces/cash-flow.interface';
import { TransactionType } from 'src/cash-flow/interfaces/transaction-type';

@Entity({ name: 'invoices' })
export class InvoiceEntity implements IInvoice, ITransaction {
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

    @ManyToOne(() => CreditCardEntity, (creditCard) => creditCard.invoices)
    public creditCard: CreditCardEntity;

    @OneToMany(() => ExpenseEntity, (expense) => expense.invoice)
    public expenses: ExpenseEntity[];

    @Column('enum', { name: 'status', enum: InvoiceStatus })
    public status: InvoiceStatus;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    public updatedAt: Date;

    @Column({ name: 'user_id' })
    public userId: number;

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
