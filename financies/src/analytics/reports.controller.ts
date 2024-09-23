import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  Sse,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { concat, from, map, tap } from 'rxjs';
import { ReportEntity } from './entities/report.entity';
import { MessagePattern } from '@nestjs/microservices';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { ReportJobDto } from './dto/report-job.dto';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';
import { ReportStatus } from './enums/report-status.enum';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(IsAuthenticatedGuard)
  @Sse(':id/status')
  public async streamReportStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
    @Res() response: Response,
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
