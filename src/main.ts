import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = JSON.parse(process.env.IS_PRODUCTION) as boolean;

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({ origin: isProduction ? process.env.DOMAIN : '*' });

  await app.listen(Number(process.env.API_PORT));
}

bootstrap().then(() => console.log('Spese API is running...'));
