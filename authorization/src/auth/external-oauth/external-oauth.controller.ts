import { Controller } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ExternalSignInDto } from '../dto/external-sign-in.dto';
import { MessagePattern } from '@nestjs/microservices';
import { IAuthResult } from '../interfaces/auth-result.interface';

@Controller()
export class ExternalOauthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'external-oauth-sign-in' })
  public async externalOauthSignIn(
    externalSignInDto: ExternalSignInDto,
  ): Promise<IAuthResult> {
    return this.authService.externalOauthSignIn(externalSignInDto);
  }
}
