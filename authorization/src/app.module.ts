import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/schema/config.schema';
import { config } from './config';
import { UsersModule } from './users/users.module';
import { CommonService } from './common/common.service';
import { CommonModule } from './common/common.module';
import { UserEntity } from './users/entities/user.entity';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { BlacklistedToken } from './auth/entities/blacklisted-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [UserEntity, BlacklistedToken],
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true, validationSchema, load: [config] }),
    UsersModule,
    CommonModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [AppService, CommonService],
})
export class AppModule {}
