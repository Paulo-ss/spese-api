import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 8080,
      host: 'authorization',
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
