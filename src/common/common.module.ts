import { Global, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { RequestContextService } from './request-context.service';

@Global()
@Module({
  providers: [CommonService, RequestContextService],
  exports: [CommonService, RequestContextService],
})
export class CommonModule {}
