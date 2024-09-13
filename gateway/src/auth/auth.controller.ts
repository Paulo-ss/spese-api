import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfirmEmailDto } from './dto/confirm-email.dto';
import { ResetPasswordEmailDto } from './dto/reset-password-emai.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@Controller('authorization')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  public async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(IsAuthenticatedGuard)
  @Post('refresh-token')
  public async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('confirm-email')
  public async confirmEmail(@Body() confirmEmailDto: ConfirmEmailDto) {
    return this.authService.confirmEmail(confirmEmailDto.confirmationToken);
  }

  @Post('reset-password-email')
  public async sendPasswordResetEmail(
    @Body() resetPasswordEmailDto: ResetPasswordEmailDto,
  ) {
    return this.authService.sendResetPasswordEmail(resetPasswordEmailDto);
  }

  @Post('reset-password')
  public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(IsAuthenticatedGuard)
  @Post('logout')
  public async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
