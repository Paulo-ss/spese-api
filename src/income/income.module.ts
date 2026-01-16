import { forwardRef, Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { UsersModule } from 'src/users/users.module';
import { BankAccountsModule } from 'src/bank-accounts/bank-accounts.module';
import { AsyncWorkerModule } from '../async-worker/async-worker.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([IncomeEntity]),
        UsersModule,
        forwardRef(() => BankAccountsModule),
        AsyncWorkerModule,
    ],
    controllers: [IncomeController],
    providers: [IncomeService],
    exports: [IncomeService],
})
export class IncomeModule {}
