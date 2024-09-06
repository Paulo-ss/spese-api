import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ExternalSignInDto } from '../dto/external-sign-in.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalOauthService {
  constructor(
    @Inject('AUTHORIZATION') private readonly authorizationClient: ClientProxy,
  ) {}

  public async externalOauthSignIn(externalOauthSignInDto: ExternalSignInDto) {
    const response = await firstValueFrom(
      this.authorizationClient.send(
        { cmd: 'external-oauth-sign-in' },
        externalOauthSignInDto,
      ),
    );

    return response;
  }
}
