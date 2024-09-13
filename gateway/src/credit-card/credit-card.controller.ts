import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreditCardService } from './credit-card.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { IsAuthenticatedGuard } from 'src/guards/is-authenticated.guard';

@UseGuards(IsAuthenticatedGuard)
@Controller('credit-card')
export class CreditCardController {
  constructor(private readonly creditCardService: CreditCardService) {}

  @Get(':id')
  public async findCreditCardById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.creditCardService.findCreditCardById({ id, userId });
  }

  @Get('all/user')
  public async findCreditCardByUserId(@CurrentUser() userId: number) {
    return await this.creditCardService.findCreditCardByUserId(userId);
  }

  @Post()
  public async createCreditCard(
    @Body() creditCard: CreateCreditCardDto,
    @CurrentUser() userId: number,
  ) {
    return this.creditCardService.createCreditCard(creditCard, userId);
  }

  @Put(':id')
  public async updateCreditCard(
    @Body() creditCard: UpdateCreditCardDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.creditCardService.updateCreditCard(creditCard, id, userId);
  }

  @Delete(':id')
  public async deleteCreditCard(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number,
  ) {
    return this.creditCardService.deleteCreditCard(id, userId);
  }
}
