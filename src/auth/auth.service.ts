import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { ClientProxy } from '@nestjs/microservices';
import { SignUpDto } from './dto/sign-up.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { TokenType } from 'src/jwt/enums/token-type.enum';
import { SignInDto } from './dto/sign-in.dto';
import { IAuthResult } from './interfaces/auth-result.interface';
import { compare } from 'bcrypt';
import { UserDto } from 'src/users/dto/user.dto';
import {
  IEmailToken,
  IRefreshToken,
} from 'src/jwt/interfaces/tokens.interface';
import { ResetPasswordEmailDto } from './dto/reset-password-email.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { ExternalSignInDto } from './dto/external-sign-in.dto';
import { ExternalOauthService } from './external-oauth/services/external-oauth.abstract.service';
import { BlacklistedTokenEntity } from './entities/blacklisted-token.entity';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(BlacklistedTokenEntity)
    private readonly blacklistedTokenRepository: Repository<BlacklistedTokenEntity>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @Inject('EXTERNAL_OAUTH_PROVIDERS')
    private readonly externalOauthServices: ExternalOauthService[],
  ) {}

  private comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException('As senhas não são iguais.');
    }
  }

  private async blacklistToken(userId: number, tokenId: string): Promise<void> {
    const user = await this.usersService.findOneById(userId);

    const blacklistedToken = this.blacklistedTokenRepository.create({
      user,
      tokenId,
      createdAt: new Date().toISOString(),
    });

    await this.commonService.saveEntity(
      this.blacklistedTokenRepository,
      blacklistedToken,
    );
  }

  private async checkIfTokenIsBlacklisted(
    userId: number,
    tokenId: string,
  ): Promise<void> {
    const user = await this.usersService.findOneById(userId);

    const count = await this.blacklistedTokenRepository.countBy({
      user,
      tokenId,
    });

    if (count > 0) {
      throw new UnauthorizedException('Esse token já foi utilizado.');
    }
  }

  public async signUp(signUpDto: SignUpDto): Promise<IGenericMessageResponse> {
    const { name, email, password, passwordConfirmation } = signUpDto;

    this.comparePasswords(password, passwordConfirmation);

    const user = await this.usersService.create(name, password, email);

    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenType.CONFIRMATION_TOKEN,
    );

    this.mailerService.sendConfirmationEmail(
      user.email,
      user.name,
      confirmationToken,
    );

    return this.commonService.generateGenericMessageResponse(
      `Conta criada com sucesso! Por favor, confirme seu e-mail.`,
    );
  }

  public async signIn(signInDto: SignInDto): Promise<IAuthResult> {
    const { emailOrUsername, password } = signInDto;

    const user =
      await this.usersService.findOneByEmailOrUsername(emailOrUsername);

    if (
      isUndefined(user.password) ||
      isNull(user.password) ||
      !(await compare(password, user.password))
    ) {
      throw new BadRequestException('Credenciais incorretas.');
    }

    if (!user.confirmed) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenType.CONFIRMATION_TOKEN,
      );

      this.mailerService.sendConfirmationEmail(
        user.email,
        user.name,
        confirmationToken,
      );

      throw new UnauthorizedException(
        'Por favor, antes de entrar, confirme o seu e-mail.',
      );
    }

    const accessToken = await this.jwtService.generateToken(
      user,
      TokenType.ACCESS_TOKEN,
    );
    const refreshToken = await this.jwtService.generateToken(
      user,
      TokenType.REFRESH_TOKEN,
    );

    return { accessToken, refreshToken, user: UserDto.entityToDto(user) };
  }

  public async externalOauthSignIn(
    externalOauthSignIn: ExternalSignInDto,
  ): Promise<IAuthResult> {
    const { provider } = externalOauthSignIn;

    const externalOauthService = this.externalOauthServices.find(
      (service) => service.oauthProviderName === provider,
    );
    const { email, name } =
      await externalOauthService.validateExternalProviderToken(
        externalOauthSignIn,
      );
    let user = await this.usersService.findOneByEmail(email);

    if (isUndefined(user) || isNull(user)) {
      user = await this.usersService.externalOauthCreate(name, email);
    }

    const accessToken = await this.jwtService.generateToken(
      user,
      TokenType.ACCESS_TOKEN,
    );
    const refreshToken = await this.jwtService.generateToken(
      user,
      TokenType.REFRESH_TOKEN,
    );

    return {
      accessToken,
      refreshToken,
      user: UserDto.entityToDto(user),
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<IAuthResult> {
    const { userId, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH_TOKEN,
      );

    await this.checkIfTokenIsBlacklisted(userId, tokenId);

    const user = await this.usersService.findOneById(userId);
    const accessToken = await this.jwtService.generateToken(
      user,
      TokenType.ACCESS_TOKEN,
    );
    const newRefreshToken = await this.jwtService.generateToken(
      user,
      TokenType.REFRESH_TOKEN,
    );

    await this.blacklistToken(user.id, tokenId);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: UserDto.entityToDto(user),
    };
  }

  public async confirmEmail(
    confirmationToken: string,
  ): Promise<IGenericMessageResponse> {
    const { userId, tokenId } = await this.jwtService.verifyToken<IEmailToken>(
      confirmationToken,
      TokenType.CONFIRMATION_TOKEN,
    );

    await this.checkIfTokenIsBlacklisted(userId, tokenId);

    const user = await this.usersService.findOneById(userId);
    user.confirmed = true;

    await this.usersService.confirmUser(user);

    await this.blacklistToken(user.id, tokenId);

    return this.commonService.generateGenericMessageResponse(
      'E-Mail verificado com sucesso.',
    );
  }

  public async sendResetPasswordEmail(
    resetPasswordEmailDto: ResetPasswordEmailDto,
  ): Promise<IGenericMessageResponse> {
    const user = await this.usersService.findOneByEmail(
      resetPasswordEmailDto.email,
    );

    const resetPasswordToken = await this.jwtService.generateToken(
      user,
      TokenType.RESET_PASSWORD,
    );

    this.mailerService.sendResetPasswordEmail(
      user.email,
      user.name,
      resetPasswordToken,
    );

    return this.commonService.generateGenericMessageResponse(
      'E-Mail para redefinição de senha enviado.',
    );
  }

  public async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<IGenericMessageResponse> {
    const { resetToken, password, passwordConfirmation } = resetPasswordDto;

    const { userId, tokenId } = await this.jwtService.verifyToken<IEmailToken>(
      resetToken,
      TokenType.RESET_PASSWORD,
    );

    this.comparePasswords(password, passwordConfirmation);

    await this.usersService.resetPassword(userId, password);
    await this.blacklistToken(userId, tokenId);

    return this.commonService.generateGenericMessageResponse(
      'Senha redefinida com sucesso.',
    );
  }

  public async logout(refreshToken: string): Promise<IGenericMessageResponse> {
    const { userId, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenType.REFRESH_TOKEN,
      );

    await this.blacklistToken(userId, tokenId);
    return this.commonService.generateGenericMessageResponse(
      'Sessão encerrada com sucesso.',
    );
  }
}
