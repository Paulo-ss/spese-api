import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportJobDto } from './dto/report-job.dto';
import { ReportsService } from './reports.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  public async createReportRequest(
    @Body() report: ReportJobDto,
    @CurrentUser() userId: number,
  ) {
    return this.reportsService.createReportRequest(report, userId);
  }
}
