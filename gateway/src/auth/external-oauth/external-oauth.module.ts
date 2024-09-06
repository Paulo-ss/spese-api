import { Module } from '@nestjs/common';
import { ExternalOauthService } from './external-oauth.service';
import { ExternalOauthController } from './external-oauth.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTHORIZATION',
        transport: Transport.TCP,
        options: { port: 8080, host: 'authorization' },
      },
    ]),
  ],
  controllers: [ExternalOauthController],
  providers: [ExternalOauthService],
})
export class ExternalOauthModule {}
