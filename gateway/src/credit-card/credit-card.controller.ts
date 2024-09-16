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
import { InvoiceService } from './invoice.service';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@UseGuards(IsAuthenticatedGuard)
@Controller('credit-card')
export class CreditCardController {
  constructor(
    private readonly creditCardService: CreditCardService,
    private readonly invoiceService: InvoiceService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

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

  @Get('invoice/:id')
  public async getInvoiceById(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.findById(id);
  }

  @Put('invoice/pay/:id')
  public async payInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.invoiceService.payInvoice(id);
  }

  @Get('subscription/:id')
  public async getSubscriptionById(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findById(id);
  }

  @Post('subscription')
  public async createSubscription(
    @Body() subscription: CreateSubscriptionDto,
    @CurrentUser() userId: number,
  ) {
    return this.subscriptionService.create(subscription, userId);
  }

  @Put('subscription/:id')
  public async updateSubscription(
    @Param('id', ParseIntPipe) id: number,
    @Body() subscription: UpdateSubscriptionDto,
    @CurrentUser() userId: number,
  ) {
    return this.subscriptionService.update(id, subscription, userId);
  }

  @Delete('subscription/:id')
  public async deleteSubscription(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.delete(id);
  }
}
