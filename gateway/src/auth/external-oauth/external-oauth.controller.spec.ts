import { Test, TestingModule } from '@nestjs/testing';
import { ExternalOauthController } from './external-oauth.controller';
import { ExternalOauthService } from './external-oauth.service';

describe('ExternalOauthController', () => {
  let controller: ExternalOauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalOauthController],
      providers: [ExternalOauthService],
    }).compile();

    controller = module.get<ExternalOauthController>(ExternalOauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
