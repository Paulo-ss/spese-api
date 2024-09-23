import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IReport } from './interfaces/report.interface';
import { ReportJobDto } from './dto/report-job.dto';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async createReportRequest(
    report: ReportJobDto,
    userId: number,
  ): Promise<IReport> {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-report-request' },
        { ...report, userId },
      ),
    );

    return response;
  }
}
