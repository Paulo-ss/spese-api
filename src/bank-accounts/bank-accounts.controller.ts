import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { MessagePattern } from '@nestjs/microservices';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { BankAccountEntity } from './entities/bank.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@UseGuards(IsAuthenticatedGuard)
@Controller('bank-account')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get(':id')
  public async getById(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.bankAccountsService.findById(id, userId);
  }

  @Get('all/user')
  public async getByUserId(@CurrentUser() userId: number) {
    return await this.bankAccountsService.findByUserId(userId);
  }

  @Post()
  public async create(
    @Body() bankAccount: CreateBankAccountDto,
    @CurrentUser() userId: number,
  ) {
    return await this.bankAccountsService.create(bankAccount, userId);
  }

  @Put()
  public async update(
    @Body() bankAccount: UpdateBankAccountDto,
    @CurrentUser() userId: number,
  ) {
    return await this.bankAccountsService.update(bankAccount, userId);
  }
}
