import { Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FINANCIES',
        transport: Transport.TCP,
        options: { port: 8082, host: 'financies' },
      },
    ]),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
})
export class IncomeModule {}
