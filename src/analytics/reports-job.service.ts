import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ReportsService } from './reports.service';
import { ReportJobDto } from './dto/report-job.dto';

@Processor('reports')
export class ReportsJobService {
  constructor(private readonly reportsService: ReportsService) {}

  @Process()
  public async produce(job: Job<ReportJobDto>) {
    await this.reportsService.produce(job.data);

    return {};
  }
}
