import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { RcpExceptionFilter } from './filters/rcp-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    { transport: Transport.TCP, options: { port: 8082, host: 'financies' } },
  );

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new RcpExceptionFilter());

  await app.listen();
}
bootstrap();
