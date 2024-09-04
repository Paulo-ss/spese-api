import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from './mailer/mailer.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/schema/validation.schema';
import { config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema, load: [config] }),
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
