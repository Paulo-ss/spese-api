import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Sse,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { concat, from, map } from 'rxjs';
import { ReportEntity } from './entities/report.entity';
import { ReportJobDto } from './dto/report-job.dto';

@UseGuards(IsAuthenticatedGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Sse(':id/status')
  public async streamReportStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return concat(
      from(this.reportsService.getReportById(id)).pipe(
        map((data) => ({ data: { id: id, status: data?.status } })),
      ),
      this.reportsService
        .subscribe(`${userId}.${id}.report-status`)
        .pipe(map((status) => ({ data: { id, status: status } }))),
    );
  }

  @Get(':id/download')
  public async downloadReport(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StreamableFile> {
    const { filename, file } = await this.reportsService.downloadReport(id);

    return new StreamableFile(file, {
      type: 'application/json',
      disposition: `attachment; filename=${filename}`,
    });
  }

  @Get('/user')
  public async getAllUsersReports(
    @CurrentUser() userId: number,
  ): Promise<ReportEntity[]> {
    return this.reportsService.getUsersReports(userId);
  }

  @Post()
  public async createReportRequest(
    @Body() report: ReportJobDto,
    @CurrentUser() userId: number,
  ) {
    return this.reportsService.createReportRequest(report, userId);
  }
}
