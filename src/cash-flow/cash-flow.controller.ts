import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CashFlowService } from './cash-flow.service';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(IsAuthenticatedGuard)
@Controller('cash-flow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get('month/:month')
  public async getMonthCashFlow(
    @Param('month') month: string,
    @CurrentUser() userId: number,
  ) {
    return this.cashFlowService.getMonthCashFlow(month, userId);
  }
}
