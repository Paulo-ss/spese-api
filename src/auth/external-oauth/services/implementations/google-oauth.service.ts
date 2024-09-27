import { OAuth2Client } from 'google-auth-library';
import { ExternalSignInDto } from '../../../dto/external-sign-in.dto';
import { ExternalOauthService } from '../external-oauth.abstract.service';
import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/common.service';
import { ConfigService } from '@nestjs/config';
import { IGoogleoAuth2 } from 'src/config/interfaces/google-oauth2.interface';
import { AvailableExternalOauthProviders } from 'src/auth/types/available-external-oauth-providers.type';

@Injectable()
export class GoogleOauthService extends ExternalOauthService {
  public oauthProviderName: AvailableExternalOauthProviders = 'google';

  private readonly googleOauthConfig: IGoogleoAuth2;

  constructor(
    private readonly commonService: CommonService,
    private readonly configService: ConfigService,
  ) {
    super();

    this.googleOauthConfig =
      this.configService.get<IGoogleoAuth2>('googleoAuth2');
  }

  public async validateExternalProviderToken(
    externalSignInDto: ExternalSignInDto,
  ): Promise<{ name: string; email: string }> {
    const client = new OAuth2Client();
    const ticket = await this.commonService.throwInternalError(
      client.verifyIdToken({
        idToken: externalSignInDto.idToken,
        audience: this.googleOauthConfig.clientId,
      }),
    );

    return { email: ticket.getPayload().email, name: ticket.getPayload().name };
  }
}
