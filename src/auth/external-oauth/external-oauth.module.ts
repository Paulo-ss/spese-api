import { Module, forwardRef } from '@nestjs/common';
import { GoogleOauthService } from './services/implementations/google-oauth.service';
import { ExternalOauthController } from './external-oauth.controller';
import { ExternalOauthService } from './services/external-oauth.abstract.service';
import { AuthModule } from '../auth.module';
import { FacebookOAuthService } from './services/implementations/facebook-oauth.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ExternalOauthController],
  providers: [
    GoogleOauthService,
    FacebookOAuthService,
    {
      provide: 'EXTERNAL_OAUTH_PROVIDERS',
      useFactory: (...externalOauthProviders: ExternalOauthService[]) =>
        externalOauthProviders,
      inject: [GoogleOauthService, FacebookOAuthService],
    },
  ],
  exports: [
    GoogleOauthService,
    FacebookOAuthService,
    {
      provide: 'EXTERNAL_OAUTH_PROVIDERS',
      useFactory: (...externalOauthProviders: ExternalOauthService[]) =>
        externalOauthProviders,
      inject: [GoogleOauthService, FacebookOAuthService],
    },
  ],
})
export class ExternalOauthModule {}
