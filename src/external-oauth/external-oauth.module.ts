import { Module, forwardRef } from '@nestjs/common';
import { GoogleOauthService } from './services/implementations/google-oauth.service';
import { ExternalOauthController } from './external-oauth.controller';
import { ExternalOauthService } from './services/external-oauth.abstract.service';
import { AuthModule } from '../auth/auth.module';
import { DEPENDENCY_INJECTION_PROVIDERS } from 'src/common/constants/constants';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ExternalOauthController],
  providers: [
    GoogleOauthService,
    {
      provide: DEPENDENCY_INJECTION_PROVIDERS.EXTERNAL_OAUTH_PROVIDERS,
      useFactory: (...externalOauthProviders: ExternalOauthService[]) =>
        externalOauthProviders,
      inject: [GoogleOauthService],
    },
  ],
  exports: [
    {
      provide: DEPENDENCY_INJECTION_PROVIDERS.EXTERNAL_OAUTH_PROVIDERS,
      useFactory: (...externalOauthProviders: ExternalOauthService[]) =>
        externalOauthProviders,
      inject: [GoogleOauthService],
    },
  ],
})
export class ExternalOauthModule {}
