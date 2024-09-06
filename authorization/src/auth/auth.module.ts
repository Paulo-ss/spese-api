import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ExternalOauthController } from './external-oauth/external-oauth.controller';
import { ExternalOauthModule } from './external-oauth/external-oauth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlacklistedToken]),
    ClientsModule.register([
      {
        name: 'COMMUNICATION',
        transport: Transport.TCP,
        options: { port: 8081, host: 'communication' },
      },
    ]),
    UsersModule,
    JwtModule,
    forwardRef(() => ExternalOauthModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
