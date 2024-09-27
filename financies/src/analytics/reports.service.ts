import { Inject, Injectable } from '@nestjs/common';
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
import * as fs from 'fs';
import * as path from 'path';
import { Parser } from '@json2csv/plainjs';
import { DATE_MM_YYYY_REGEX } from 'src/common/utils/validation.utils';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ReportsService {
  private readonly emitter: EventEmitter;

  constructor(
    @InjectRepository(ReportEntity)
    private readonly reportRepository: Repository<ReportEntity>,
    @InjectQueue('reports')
    private readonly reportsQueue: Queue<ReportJobDto>,
    @Inject('COMMUNICATIONS')
    private readonly communicationsClient: ClientProxy,
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

      const reportContent = {
        Mês: month,
        Renda: monthSummary.budget,
        'Despesas Totais': monthSummary.expensesTotal,
        'Total Pago': monthSummary.paidTotal,
        'Saldo do Mês': monthSummary.monthBalance,
      };

      const parser = new Parser();
      const csv = parser.parse(reportContent);

      await this.reportRepository.save({
        id: reportId,
        status: ReportStatus.DONE,
        filename: `${userId}-${month}-summary.csv`,
        content: csv,
      });

      await this.emit(`${userId}.${reportId}.report-status`, ReportStatus.DONE);

      this.communicationsClient.emit(
        { cmd: 'send-report-done-not' },
        reportDto,
      );
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

  public async deleteReportsOlderThanOneDay(): Promise<IGenericMessageResponse> {
    const reports = await this.reportRepository
      .createQueryBuilder('r')
      .where('r.created_at < NOW() - INTERVAL "1 Day"')
      .getMany();

    await this.commonService.removeMultipleEntities(
      this.reportRepository,
      reports,
    );

    return this.commonService.generateGenericMessageResponse(
      'Relatórios com mais de 1h de geração foram deletados.',
    );
  }

  public async downloadReport(
    reportId: number,
  ): Promise<{ filename: string; file: fs.ReadStream }> {
    const report = await this.getReportById(reportId);
    this.commonService.checkEntityExistence(report, 'Relatório');

    const filename = `${report.content.match(DATE_MM_YYYY_REGEX)[0]}-report.csv`;
    fs.writeFileSync(path.join(__dirname, filename), report.content);

    const file = fs.createReadStream(path.join(__dirname, filename));

    return { filename, file };
  }
}
