import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ExternalOauthService } from './external-oauth.service';
import { Request } from 'express-serve-static-core';
import { Response } from 'express';
import { ExternalSignInDto } from '../dto/external-sign-in.dto';

@Controller('authorization/oauth2')
export class ExternalOauthController {
  constructor(private readonly externalOauthService: ExternalOauthService) {}

  @Get('google/authorize')
  public async googleAuthorize(@Res() response: Response) {
    return response.redirect(
      `https://accounts.google.com/o/oauth2/auth?client_id=1072218160166-fbjnaashvb4gnf0k40t8crgqsaitrv2c.apps.googleusercontent.com&response_type=code&redirect_uri=http://localhost:8082/authorization/oauth2/google/redirect&scope=profile email`,
    );
  }

  @Get('google/redirect')
  public async googleRedirect(@Req() request: Request) {
    const code = request.query.code;

    const response = await fetch(`https://oauth2.googleapis.com/token`, {
      method: 'POST',
      body: new URLSearchParams({
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri:
          'http://localhost:8082/authorization/oauth2/google/redirect',
        client_id:
          '1072218160166-fbjnaashvb4gnf0k40t8crgqsaitrv2c.apps.googleusercontent.com',
        client_secret: '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',
      }),
    });
    const data = (await response.json()) as { id_token: string };

    return { id_token: data.id_token };
  }

  @Post('/external/sign-in')
  public async externalOauthSignIn(
    @Body() externalSignInDto: ExternalSignInDto,
  ) {
    return this.externalOauthService.externalOauthSignIn(externalSignInDto);
  }
}
