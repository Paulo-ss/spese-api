import { Module } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { CashFlowController } from './cash-flow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlowDailyEntity } from './entities/cash-flow-daily.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashFlowDailyEntity])],
  controllers: [CashFlowController],
  providers: [CashFlowService],
})
export class CashFlowModule {}
