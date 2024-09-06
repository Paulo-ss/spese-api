import { Body, Controller, Post } from '@nestjs/common';
import { ExternalOauthService } from './external-oauth.service';
import { ExternalSignInDto } from '../dto/external-sign-in.dto';

@Controller('authorization/oauth2')
export class ExternalOauthController {
  constructor(private readonly externalOauthService: ExternalOauthService) {}

  @Post('/external/sign-in')
  public async externalOauthSignIn(
    @Body() externalSignInDto: ExternalSignInDto,
  ) {
    return this.externalOauthService.externalOauthSignIn(externalSignInDto);
  }
}
