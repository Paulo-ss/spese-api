import { Injectable } from '@nestjs/common';
import { ExternalSignInDto } from '../../dto/external-sign-in.dto';
import { AvailableExternalOauthProviders } from 'src/auth/types/available-external-oauth-providers.type';

@Injectable()
export abstract class ExternalOauthService {
  abstract oauthProviderName: AvailableExternalOauthProviders;

  abstract validateExternalProviderToken(
    externalSignInDto: ExternalSignInDto,
  ): Promise<{ name: string; email: string }>;
}
