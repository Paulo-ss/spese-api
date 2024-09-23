import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from './entities/report.entity';
import { Repository } from 'typeorm';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { CommonService } from 'src/common/common.service';
import { ReportStatus } from './enums/report-status.enum';
import { AnalyticsService } from './analytics.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { EventEmitter } from 'stream';
import { fromEvent } from 'rxjs';
import { ReportJobDto } from './dto/report-job.dto';
import * as csvWriter from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  private readonly emitter: EventEmitter;

  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    @InjectQueue('reports')
    private readonly reportsQueue: Queue<ReportJobDto>,
    private readonly commonService: CommonService,
    private readonly analyticsService: AnalyticsService,
  ) {
    this.emitter = new EventEmitter();
  }

  subscribe(channel: string) {
    return fromEvent(this.emitter, channel);
  }

  async emit(channel: string, status: ReportStatus) {
    this.emitter.emit(channel, status);
  }

  public async getReportById(reportId: number): Promise<ReportEntity> {
    return await this.reportRepository.findOneBy({ id: reportId });
  }

  public async getUsersReports(userId: number): Promise<ReportEntity[]> {
    return await this.reportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async createReportRequest(
    reportDto: ReportJobDto,
  ): Promise<IGenericMessageResponse> {
    const report = this.reportRepository.create({
      userId: reportDto.userId,
      status: ReportStatus.PENDING,
    });

    const newReport = await this.commonService.saveEntity(
      this.reportRepository,
      report,
    );

    await this.reportsQueue.add({ ...reportDto, reportId: newReport.id });

    return this.commonService.generateGenericMessageResponse(
      `Seu pedido de relatório foi criado. Por favor, aguarde.`,
    );
  }

  public async produce(reportDto: ReportJobDto) {
    const { reportId, month, userId } = reportDto;

    try {
      await this.reportRepository.save({
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

      const reportContent = { ...monthSummary, month };

      const writer = csvWriter.createObjectCsvWriter({
        path: path.resolve(__dirname, `${userId}-${month}-summary.csv`),
        header: [
          { id: 'month', title: 'Mês' },
          { id: 'budget', title: 'Renda' },
          { id: 'expensesTotal', title: 'Despesas Totais' },
          { id: 'paidTotal', title: 'Total Pago' },
          { id: 'monthBalance', title: 'Saldo do Mês' },
        ],
      });

      await writer.writeRecords([reportContent]);

      const reportFile = fs.readFileSync(
        path.join(__dirname, `${userId}-${month}-summary.csv`),
        'utf-8',
      );

      await this.reportRepository.save({
        id: reportId,
        status: ReportStatus.DONE,
        filename: `${userId}-${month}-summary.csv`,
        content: reportFile.toString(),
      });

      await this.emit(`${userId}.${reportId}.report-status`, ReportStatus.DONE);
    } catch (error) {
      console.log({ error });

      const report = await this.reportRepository.save({
        id: reportId,
        status: ReportStatus.ERROR,
      });

      await this.emit(
        `${report.userId}.${reportId}.report-status`,
        ReportStatus.ERROR,
      );
    }
  }
}
