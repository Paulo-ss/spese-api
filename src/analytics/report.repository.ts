import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/repositories/base.repository';
import { Report } from './entities/report.entity';
import {
    InjectTransactionHost,
    TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { DeepPartial } from 'typeorm';

@Injectable()
export class ReportRepository extends BaseRepository<Report> {
    constructor(
        @InjectTransactionHost('default')
        txHost: TransactionHost<TransactionalAdapterTypeOrm>,
    ) {
        super(txHost, Report);
    }

    public async findById(reportId: number): Promise<Report> {
        return await this.repository.findOneBy({ id: reportId });
    }

    public async findByUserId(userId: number): Promise<Report[]> {
        return await this.repository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    public async findReportsOlderThanOneDay(): Promise<Report[]> {
        return await this.repository
            .createQueryBuilder('r')
            .where("r.created_at < NOW() - INTERVAL '1 Day'")
            .getMany();
    }

    public async upsert(report: DeepPartial<Report>): Promise<Report>;
    public async upsert(
        reports: DeepPartial<Report> | DeepPartial<Report>[],
    ): Promise<Report | Report[]> {
        return await this.repository.save(
            this.repository.create(reports as unknown),
        );
    }

    public async deleteMultiple(reports: Report[]): Promise<void> {
        await this.repository.remove(reports);
    }
}
