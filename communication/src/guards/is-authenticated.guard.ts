import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as jwt from 'jsonwebtoken';
import { join } from 'path';
import { Request } from 'express-serve-static-core';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
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
      join(__dirname, '..', '..', '..', 'keys/key.pub'),
      'utf-8',
    );

    try {
      const { userId } = await this.verifyTokenAsync<{ userId: number }>(
        accessToken,
        publicKey,
        {
          algorithms: ['RS256'],
        },
      );

      request.user = userId;
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

    const [_, accessToken] = authorizationHeader.split(' ');
    return await this.validateAccessToken(accessToken, request);
  }
}
