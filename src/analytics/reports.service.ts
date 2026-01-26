import { Injectable, Logger } from '@nestjs/common';
import { Report } from './entities/report.entity';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CommonService } from 'src/common/common.service';
import { ReportStatus } from './enums/report-status.enum';
import { AnalyticsService } from './analytics.service';
import { EventEmitter } from 'stream';
import { fromEvent } from 'rxjs';
import { ReportJobDto } from './dto/report-job.dto';
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from '@json2csv/plainjs';
import { DATE_YYYY_MM_REGEX } from 'src/common/utils/regex.const';
import { NotificationsDBService } from 'src/notifications/notifications-db.service';
import { RedisPublisher } from '../async-worker/publisher/redis.publisher';
import { IReportRequestedMessage } from '../async-worker/types/messages';
import { ASYNC_WORKER } from '../common/constants/constants';
import { ReportRepository } from './report.repository';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);
    private readonly emitter: EventEmitter;

    constructor(
        private readonly reportRepository: ReportRepository,
        private readonly commonService: CommonService,
        private readonly analyticsService: AnalyticsService,
        private readonly notificationsDBService: NotificationsDBService,
        private readonly redisPublisher: RedisPublisher<IReportRequestedMessage>,
    ) {
        this.emitter = new EventEmitter();
    }

    subscribe(channel: string) {
        return fromEvent(this.emitter, channel);
    }

    async emit(channel: string, status: ReportStatus) {
        this.emitter.emit(channel, status);
    }

    public async getReportById(reportId: number): Promise<Report> {
        return await this.reportRepository.findById(reportId);
    }

    public async getUsersReports(userId: number): Promise<Report[]> {
        return await this.reportRepository.findByUserId(userId);
    }

    public async createReportRequest(
        reportDto: ReportJobDto,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const newReport = await this.reportRepository.upsert({
            userId: userId,
            status: ReportStatus.PENDING,
        });

        await this.redisPublisher.publishToStream({
            streamName: ASYNC_WORKER.REDIS_STREAMS.REPORT_PROCESSING,
            message: {
                ...reportDto,
                userId,
                reportId: newReport.id,
                timestamp: new Date().toISOString(),
            },
        });

        return this.commonService.generateGenericMessageResponse(
            `Seu pedido de relatório foi criado. Por favor, aguarde.`,
        );
    }

    public async generateReport(reportDto: ReportJobDto) {
        const { reportId, month, userId } = reportDto;

        try {
            await this.reportRepository.upsert({
                id: reportId,
                status: ReportStatus.PROCESSING,
            });

            await this.emit(
                `${userId}.${reportId}.report-status`,
                ReportStatus.PROCESSING,
            );

            const monthSummary = await this.analyticsService.getMonthSummary(
                month,
                userId,
            );

            const reportContent = {
                Mês: month,
                Renda: monthSummary.budget,
                'Despesas Totais': monthSummary.expensesTotal,
                'Total Pago': monthSummary.paidTotal,
                'Saldo do Mês': monthSummary.monthBalance,
            };

            const parser = new Parser();
            const csv = parser.parse(reportContent);

            await this.reportRepository.upsert({
                id: reportId,
                status: ReportStatus.DONE,
                filename: `${userId}-${month}-summary.csv`,
                content: csv,
            });

            await this.emit(
                `${userId}.${reportId}.report-status`,
                ReportStatus.DONE,
            );

            void this.notificationsDBService.emitReportDoneNotification(
                reportDto,
            );
        } catch (error) {
            const report = await this.reportRepository.upsert({
                id: reportId,
                status: ReportStatus.ERROR,
            });

            await this.emit(
                `${report.userId}.${reportId}.report-status`,
                ReportStatus.ERROR,
            );

            this.logger.error(
                `Error generating report ${reportId} for user ${userId}`,
                error,
            );
        }
    }

    public async deleteReportsOlderThanOneDay(): Promise<IGenericMessageResponse> {
        const reports =
            await this.reportRepository.findReportsOlderThanOneDay();

        await this.reportRepository.deleteMultiple(reports);

        return this.commonService.generateGenericMessageResponse(
            'Relatórios com mais de 1h de geração foram deletados.',
        );
    }

    public async downloadReport(
        reportId: number,
    ): Promise<{ filename: string; file: fs.ReadStream }> {
        const report = await this.getReportById(reportId);
        this.commonService.checkEntityExistence(report, 'Relatório');

        const filename = `${report.content.match(DATE_YYYY_MM_REGEX)[0]}-report.csv`;
        fs.writeFileSync(path.join(__dirname, filename), report.content);

        const file = fs.createReadStream(path.join(__dirname, filename));

        return { filename, file };
    }
}
