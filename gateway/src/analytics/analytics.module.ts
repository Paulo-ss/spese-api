import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FINANCIES',
        transport: Transport.TCP,
        options: { port: 8082, host: 'financies' },
      },
    ]),
  ],
  controllers: [AnalyticsController, ReportsController],
  providers: [AnalyticsService, ReportsService],
})
export class AnalyticsModule {}
