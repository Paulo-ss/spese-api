import { Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeEntity } from './entities/income.entity';
import { WageEntity } from './entities/wage.entity';
import { WageService } from './wage.service';

@Module({
  imports: [TypeOrmModule.forFeature([IncomeEntity, WageEntity])],
  controllers: [IncomeController],
  providers: [IncomeService, WageService],
})
export class IncomeModule {}
