import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ExpensesModule } from './expenses/expenses.module';
import { IncomeModule } from './income/income.module';
import { CommonModule } from './common/common.module';
import { ExpenseEntity } from './expenses/entities/expense.entity';
import { IncomeEntity } from './income/entities/income.entity';
import { WageEntity } from './income/entities/wage.entity';
import { BankAccountEntity } from './bank-accounts/entities/bank.entity';
import { CreditCardEntity } from './credit-cards/entities/credit-card.entity';
import { InstallmentEntity } from './credit-cards/entities/installment.entity';
import { InvoiceEntity } from './credit-cards/entities/invoice.entity';
import { SubscriptionEntity } from './credit-cards/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        ExpenseEntity,
        IncomeEntity,
        WageEntity,
        BankAccountEntity,
        CreditCardEntity,
        InstallmentEntity,
        InvoiceEntity,
        SubscriptionEntity,
      ],
      synchronize: true,
    }),
    CreditCardsModule,
    BankAccountsModule,
    ExpensesModule,
    IncomeModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
