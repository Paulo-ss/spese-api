import { Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { WageEntity } from './entities/wage.entity';
import { WageService } from './wage.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity, WageEntity]), UsersModule],
  controllers: [IncomeController],
  providers: [IncomeService, WageService],
  exports: [IncomeService, WageService],
})
export class IncomeModule {}
