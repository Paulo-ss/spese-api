import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Sse,
  StreamableFile,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { concat, from, map } from 'rxjs';
import { ReportEntity } from './entities/report.entity';
import { MessagePattern } from '@nestjs/microservices';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ReportJobDto } from './dto/report-job.dto';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(IsAuthenticatedGuard)
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

  @UsePipes(new ValidationPipe())
  @UseFilters(new RcpExceptionFilter())
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

  @MessagePattern({ cmd: 'reports-by-user' })
  public async getAllUsersReports(userId: number): Promise<ReportEntity[]> {
    return this.reportsService.getUsersReports(userId);
  }

  @UsePipes(new ValidationPipe())
  @UseFilters(new RcpExceptionFilter())
  @MessagePattern({ cmd: 'create-report-request' })
  public async createReportRequest(
    report: ReportJobDto,
  ): Promise<IGenericMessageResponse> {
    return this.reportsService.createReportRequest(report);
  }
}
