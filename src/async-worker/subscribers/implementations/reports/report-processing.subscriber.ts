import { ASYNC_WORKER } from 'src/common/constants/constants';
import { BaseSubscriber } from '../base-subscriber.abstract';
import { Injectable } from '@nestjs/common';
import { GroupName, StreamName } from 'src/async-worker/types/redis';
import { IReportRequestedMessage } from 'src/async-worker/types/messages';
import { ReportsService } from '../../../../analytics/reports.service';

@Injectable()
export class ReportProcessingSubscriber extends BaseSubscriber<IReportRequestedMessage> {
    constructor(private readonly reportService: ReportsService) {
        super();
    }

    get groupName(): GroupName {
        return ASYNC_WORKER.REDIS_GROUPS.REPORT_PROCESSING;
    }

    get totalConsumers(): number {
        return 1;
    }

    getStreamName(): StreamName {
        return ASYNC_WORKER.REDIS_STREAMS.REPORT_PROCESSING;
    }

    override async onMessage(
        reportRequest: IReportRequestedMessage,
    ): Promise<void> {
        try {
            this.logger.log(
                'New report request received! Processing...',
                reportRequest,
            );

            await this.reportService.generateReport(reportRequest);
        } catch (error) {
            this.logger.error('REPORT PROCESSING SUBSCRIBER ERROR: ', {
                error,
            });

            throw error;
        }
    }
}
