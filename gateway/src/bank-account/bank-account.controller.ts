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
import { BankAccountService } from './bank-account.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('bank-account')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Get(':id')
  public async getById(
    @CurrentUser() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.bankAccountService.findById({ id, userId });
  }

  @Get('all/user')
  public async getByUserId(@CurrentUser() userId: number) {
    return await this.bankAccountService.findByUserId(userId);
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @Body() bankAccount: CreateBankAccountDto,
  ) {
    return await this.bankAccountService.create(bankAccount, userId);
  }

  @Put()
  public async update(
    @CurrentUser() userId: number,
    @Body() bankAccount: UpdateBankAccountDto,
  ) {
    return await this.bankAccountService.update(bankAccount, userId);
  }
}
