import { Test, TestingModule } from '@nestjs/testing';
import { ExternalOauthService } from './external-oauth.service';

describe('ExternalOauthService', () => {
  let service: ExternalOauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalOauthService],
    }).compile();

    service = module.get<ExternalOauthService>(ExternalOauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
