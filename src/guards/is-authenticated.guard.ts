import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { Request } from 'express-serve-static-core';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor(private readonly cls: ClsService) {}

  private async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.VerifyOptions,
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

  private async validateAccessToken(
    accessToken: string,
    request: Request,
  ): Promise<boolean> {
    let isAuthenticated = false;

    const publicKey = readFileSync(
      join(__dirname, '..', '..', 'keys/key.pub'),
      'utf-8',
    );

    try {
      const { userId, timezone } = await this.verifyTokenAsync<{
        userId: number;
        timezone: string;
      }>(accessToken, publicKey, {
        algorithms: ['RS256'],
      });

      request.user = userId;

      this.cls.set('timezone', timezone);

      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    } finally {
      return isAuthenticated;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authorizationHeader: string = request.headers['authorization'];
    if (!authorizationHeader) {
      return false;
    }

    const accessToken = authorizationHeader.split(' ')[1];
    return await this.validateAccessToken(accessToken, request);
  }
}
