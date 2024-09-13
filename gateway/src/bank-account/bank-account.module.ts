import { Module } from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { BankAccountController } from './bank-account.controller';
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
  controllers: [BankAccountController],
  providers: [BankAccountService],
})
export class BankAccountModule {}
