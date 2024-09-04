import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SignUpDto } from './dto/sign-up.dto';
import { firstValueFrom } from 'rxjs';
import { SignInDto } from './dto/sign-in.dto';
import { ResetPasswordEmailDto } from './dto/reset-password-emai.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTHORIZATION') private readonly authorizationClient: ClientProxy,
  ) {}

  public async signUp(signUpDto: SignUpDto) {
    const response = await firstValueFrom(
      this.authorizationClient.send({ cmd: 'sign-up' }, signUpDto),
    );

    return response;
  }

  public async signIn(signInDto: SignInDto) {
    const response = await firstValueFrom(
      this.authorizationClient.send({ cmd: 'sign-in' }, signInDto),
    );

    return response;
  }

  public async refreshAccessToken(refreshAccessToken: string) {
    const response = await firstValueFrom(
      this.authorizationClient.send(
        { cmd: 'refresh-access-token' },
        refreshAccessToken,
      ),
    );

    return response;
  }

  public async confirmEmail(confirmationToken: string) {
    const response = await firstValueFrom(
      this.authorizationClient.send(
        { cmd: 'confirm-email' },
        confirmationToken,
      ),
    );

    return response;
  }

  public async sendResetPasswordEmail(
    resetPasswordEmailDto: ResetPasswordEmailDto,
  ) {
    const response = await firstValueFrom(
      this.authorizationClient.send(
        { cmd: 'reset-password-email' },
        resetPasswordEmailDto,
      ),
    );

    return response;
  }

  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const response = await firstValueFrom(
      this.authorizationClient.send(
        { cmd: 'reset-password' },
        resetPasswordDto,
      ),
    );

    return response;
  }

  public async logout(refreshAccessToken: string) {
    const response = await firstValueFrom(
      this.authorizationClient.send({ cmd: 'logout' }, refreshAccessToken),
    );

    return response;
  }
}
