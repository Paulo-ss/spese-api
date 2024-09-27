import { ExternalSignInDto } from 'src/auth/dto/external-sign-in.dto';
import { ExternalOauthService } from '../external-oauth.abstract.service';
import { Injectable } from '@nestjs/common';
import { AvailableExternalOauthProviders } from 'src/auth/types/available-external-oauth-providers.type';

@Injectable()
export class FacebookOAuthService extends ExternalOauthService {
  public oauthProviderName: AvailableExternalOauthProviders = 'facebook';

  async validateExternalProviderToken(
    externalSignInDto: ExternalSignInDto,
  ): Promise<{ name: string; email: string }> {
    return await new Promise((resolve, reject) => {
      resolve({ name: 'Daniele', email: 'teste@teste.com' });
    });
  }
}
