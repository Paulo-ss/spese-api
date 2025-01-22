import { Test, TestingModule } from '@nestjs/testing';
import { CashFlowController } from './cash-flow.controller';
import { CashFlowService } from './cash-flow.service';

describe('CashFlowController', () => {
  let controller: CashFlowController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CashFlowController],
      providers: [CashFlowService],
    }).compile();

    controller = module.get<CashFlowController>(CashFlowController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
