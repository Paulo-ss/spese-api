import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwt } from 'src/config/interfaces/jwt.interface';
import * as jwt from 'jsonwebtoken';
import { IUser } from 'src/users/interfaces/user.interface';
import { TokenType } from './enums/token-type.enum';
import { CommonService } from 'src/common/common.service';
import {
  IAccessToken,
  IEmailToken,
  IRefreshToken,
} from './interfaces/tokens.interface';
import {
  IAccessTokenPayload,
  IEmailTokenPayload,
  IRefreshTokenPayload,
} from './interfaces/token-payload.interface';
import { v4 } from 'uuid';

@Injectable()
export class JwtService {
  private readonly jwtConfig: IJwt;

  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.jwtConfig = this.configService.get<IJwt>('jwt');
  }

  private static async throwBadRequest<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException('Token expirado.');
      }

      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException('Token inválido.');
      }

      throw new InternalServerErrorException(error);
    }
  }

  private static generateTokenAsync(
    payload: IAccessTokenPayload | IRefreshTokenPayload | IEmailTokenPayload,
    secret: string,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(payload, secret, options, (error, token) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(token);
      });
    });
  }

  private static verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.SignOptions,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, options, (error, payload: T) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(payload);
      });
    });
  }

  public async generateToken(
    user: IUser,
    tokenType: TokenType,
    tokenId?: string,
  ): Promise<string> {
    switch (tokenType) {
      case TokenType.ACCESS_TOKEN:
        const { privateKey, time: accessTime } = this.jwtConfig.access;

        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            {
              userId: user.id,
              username: user.username,
              name: user.name,
              email: user.email,
            },
            privateKey,
            {
              expiresIn: accessTime,
              algorithm: 'RS256',
            },
          ),
        );
      case TokenType.REFRESH_TOKEN:
      case TokenType.CONFIRMATION_TOKEN:
      case TokenType.RESET_PASSWORD:
        const tokenCorrespondingConfig = {
          CONFIRMATION_TOKEN: 'confirmation',
          RESET_PASSWORD: 'resetPassword',
          REFRESH_TOKEN: 'refresh',
        };
        const { secret, time } =
          this.jwtConfig[tokenCorrespondingConfig[tokenType]];

        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            { userId: user.id, tokenId: tokenId ?? v4() },
            secret,
            {
              expiresIn: time,
            },
          ),
        );
    }
  }

  public async verifyToken<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(token: string, tokenType: TokenType): Promise<T> {
    switch (tokenType) {
      case TokenType.ACCESS_TOKEN:
        const { publicKey } = this.jwtConfig.access;

        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, publicKey, {
            algorithm: 'RS256',
          }),
        );
      case TokenType.REFRESH_TOKEN:
      case TokenType.CONFIRMATION_TOKEN:
      case TokenType.RESET_PASSWORD:
        const tokenCorrespondingConfig = {
          CONFIRMATION_TOKEN: 'confirmation',
          RESET_PASSWORD: 'resetPassword',
          REFRESH_TOKEN: 'refresh',
        };
        const { secret } = this.jwtConfig[tokenCorrespondingConfig[tokenType]];

        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, secret, {
            algorithm: 'HS256',
          }),
        );
    }
  }
}
