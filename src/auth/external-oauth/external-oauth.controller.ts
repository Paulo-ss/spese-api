import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ExternalSignInDto } from '../dto/external-sign-in.dto';
import { IAuthResult } from '../interfaces/auth-result.interface';

@Controller('external-authorization')
export class ExternalOauthController {
  constructor(private readonly authService: AuthService) {}

  @Post('oauth2/sign-in')
  public async externalOauthSignIn(
    @Body() externalSignInDto: ExternalSignInDto,
  ): Promise<IAuthResult> {
    return this.authService.externalOauthSignIn(externalSignInDto);
  }
}
