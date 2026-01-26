import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ExternalOauthModule } from '../external-oauth/external-oauth.module';
import { BlacklistedToken } from './entities/blacklisted-token.entity';
import { MailerModule } from 'src/mailer/mailer.module';
import { BlacklistedTokenRepository } from './blacklisted-token.repository';

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
        MailerModule,
        forwardRef(() => ExternalOauthModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, BlacklistedTokenRepository],
    exports: [AuthService],
})
export class AuthModule {}
