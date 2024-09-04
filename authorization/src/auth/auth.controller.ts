import {
  Controller,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';
import { MessagePattern } from '@nestjs/microservices';
import { SignUpDto } from './dto/sign-up.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { SignInDto } from './dto/sign-in.dto';
import { IAuthResult } from './interfaces/auth-result.interface';
import { ResetPasswordEmailDto } from './dto/reset-password-emai.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@UseFilters(new RcpExceptionFilter())
@UsePipes(new ValidationPipe())
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'sign-up' })
  public async signUp(signUpDto: SignUpDto): Promise<IGenericMessageResponse> {
    return this.authService.signUp(signUpDto);
  }

  @MessagePattern({ cmd: 'sign-in' })
  public async signIn(signInDto: SignInDto): Promise<IAuthResult> {
    return this.authService.signIn(signInDto);
  }

  @MessagePattern({ cmd: 'refresh-access-token' })
  public async refreshAccessToken(refreshToken: string): Promise<IAuthResult> {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @MessagePattern({ cmd: 'confirm-email' })
  public async confirmEmail(
    confirmationToken: string,
  ): Promise<IGenericMessageResponse> {
    console.log({ confirmationToken });

    return this.authService.confirmEmail(confirmationToken);
  }

  @MessagePattern({ cmd: 'reset-password-email' })
  public async sendResetPasswordEmail(
    resetPasswordEmailDto: ResetPasswordEmailDto,
  ): Promise<IGenericMessageResponse> {
    return this.authService.sendResetPasswordEmail(resetPasswordEmailDto);
  }

  @MessagePattern({ cmd: 'reset-password' })
  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<IGenericMessageResponse> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @MessagePattern({ cmd: 'logout' })
  public async logout(refreshToken: string): Promise<IGenericMessageResponse> {
    return this.authService.logout(refreshToken);
  }
}
