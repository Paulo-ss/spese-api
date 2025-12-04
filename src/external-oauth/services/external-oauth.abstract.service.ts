import { Injectable } from '@nestjs/common';
import { ExternalSignInDto } from '../../auth/dto/external-sign-in.dto';
import { AvailableExternalOauthProviders } from 'src/auth/types/available-external-oauth-providers.type';
import {
  IExternalOauthService,
  IExternalOauthResponse,
} from '../interfaces/external-oauth-service.interface';

@Injectable()
export abstract class ExternalOauthService implements IExternalOauthService {
  abstract oauthProviderName: AvailableExternalOauthProviders;

  abstract validateExternalProviderToken(
    externalSignInDto: ExternalSignInDto,
  ): Promise<IExternalOauthResponse>;
}
