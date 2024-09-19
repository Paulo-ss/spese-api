import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreditCardsModule } from 'src/credit-cards/credit-cards.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'COMMUNICATIONS',
        transport: Transport.TCP,
        options: { port: 8081, host: 'communication' },
      },
    ]),
    CreditCardsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
