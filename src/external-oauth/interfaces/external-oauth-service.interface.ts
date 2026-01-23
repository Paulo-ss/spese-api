import { ExternalSignInDto } from 'src/auth/dto/external-sign-in.dto';
import { AvailableExternalOauthProviders } from 'src/auth/types/available-external-oauth-providers.type';

export interface IExternalOauthResponse {
  name: string;
  email: string;
}

export interface IExternalOauthService {
  oauthProviderName: AvailableExternalOauthProviders;
  validateExternalProviderToken: (
    externalSignInDto: ExternalSignInDto,
  ) => Promise<IExternalOauthResponse>;
}
