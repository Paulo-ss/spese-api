import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Invoice } from './entities/invoice.entity';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';
import { InvoiceStatus } from './enums/invoice-status.enum';

@Injectable()
export class InvoiceRepository extends BaseRepository<Invoice> {
    constructor(txHost: TransactionHost<TransactionalAdapterTypeOrm>) {
        super(txHost, Invoice);
    }

    public async findById(id: number): Promise<Invoice> {
        return await this.repository.findOne({
            where: { id },
            relations: {
                expenses: {
                    creditCard: false,
                    bankAccount: false,
                    invoice: false,
                },
                creditCard: {
                    expenses: false,
                    invoices: false,
                    subscriptions: false,
                },
            },
            order: {
                expenses: {
                    expenseDate: 'asc',
                },
            },
        });
    }

    public async findByMonth(
        firstDayOfTheMonth: string,
        lastDayOfTheMonth: string,
        userId: number,
    ): Promise<Invoice[]> {
        return await this.repository
            .createQueryBuilder('invoice')
            .where(
                'invoice.due_date between :firstDayOfTheMonth and :lastDayOfTheMonth',
                {
                    firstDayOfTheMonth,
                    lastDayOfTheMonth,
                },
            )
            .andWhere('invoice.user_id = :userId', {
                userId,
            })
            .getMany();
    }

    public async findByMonthAndCreditCard(
        creditCardId: number,
        closingDate: string,
    ): Promise<Invoice> {
        return await this.repository
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.creditCard', 'cc')
            .where('invoice.creditCardId = :creditCardId', { creditCardId })
            .andWhere('invoice.closing_date = :closingDate', {
                closingDate,
            })
            .getOne();
    }

    public async findInvoicesToBeClosed(today: string): Promise<Invoice[]> {
        return await this.repository
            .createQueryBuilder('in')
            .leftJoinAndSelect('in.creditCard', 'cc')
            .where('in.closing_date = :today', { today })
            .andWhere('in.status != :closed', {
                closed: InvoiceStatus.CLOSED,
            })
            .andWhere('in.status != :paid', {
                paid: InvoiceStatus.PAID,
            })
            .getMany();
    }

    public async findInvoicesToBeMarkedAsCurrent(
        nextMonth: string,
    ): Promise<Invoice[]> {
        return await this.repository
            .createQueryBuilder('in')
            .leftJoinAndSelect('in.creditCard', 'cc')
            .where('in.closing_date = :nextMonth', { nextMonth })
            .andWhere('in.status != :closed', {
                closed: InvoiceStatus.CLOSED,
            })
            .andWhere('in.status != :paid', {
                paid: InvoiceStatus.PAID,
            })
            .getMany();
    }

    public async findOverdueInvoices(today: string): Promise<Invoice[]> {
        return await this.repository
            .createQueryBuilder('in')
            .leftJoinAndSelect('in.creditCard', 'cc')
            .where('in.due_date < :today', { today })
            .andWhere('in.status = :closed', {
                closed: InvoiceStatus.CLOSED,
            })
            .getMany();
    }

    public async upsert(invoice: DeepPartial<Invoice>): Promise<Invoice>;
    public async upsert(invoices: DeepPartial<Invoice>[]): Promise<Invoice[]>;
    public async upsert(
        invoices: DeepPartial<Invoice> | DeepPartial<Invoice>[],
    ): Promise<Invoice | Invoice[]> {
        return await this.repository.save(
            this.repository.create(invoices as unknown),
        );
    }
}
