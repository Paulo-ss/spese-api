import {
  Controller,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreditCardEntity } from './entities/credit-card.entity';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { SimplifiedCreditCardDto } from './dto/simplified-credit-card.dto';
import { InvoiceService } from './invoice.service';
import { SubscriptionService } from './subscription.service';
import { InvoiceEntity } from './entities/invoice.entity';
import { SubscriptionEntity } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { RcpExceptionFilter } from 'src/filters/rcp-exception.filter';

@UsePipes(new ValidationPipe())
@UseFilters(new RcpExceptionFilter())
@Controller()
export class CreditCardsController {
  constructor(
    private readonly creditCardsService: CreditCardsService,
    private readonly invoiceService: InvoiceService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  @MessagePattern({ cmd: 'credit-card-by-id' })
  public async findCreditCardById(
    dto: FindByIdAndUserIdDto,
  ): Promise<CreditCardEntity> {
    return this.creditCardsService.findById(dto.id, dto.userId);
  }

  @MessagePattern({ cmd: 'credit-card-by-user-id' })
  public async findCreditCardByUserId(
    userId: number,
  ): Promise<SimplifiedCreditCardDto[]> {
    const creditCards = await this.creditCardsService.findByUserId(userId);

    return creditCards.map(SimplifiedCreditCardDto.entityToDto);
  }

  @MessagePattern({ cmd: 'create-credit-card' })
  public async createCreditCard(
    creditCard: CreateCreditCardDto,
  ): Promise<CreditCardEntity> {
    return this.creditCardsService.create(creditCard);
  }

  @MessagePattern({ cmd: 'update-credit-card' })
  public async updateCreditCard(
    creditCard: UpdateCreditCardDto,
  ): Promise<CreditCardEntity> {
    return this.creditCardsService.update(creditCard);
  }

  @MessagePattern({ cmd: 'delete-credit-card' })
  public async deleteCreditCard(
    dto: FindByIdAndUserIdDto,
  ): Promise<IGenericMessageResponse> {
    return this.creditCardsService.delete(dto.id, dto.userId);
  }

  @MessagePattern({ cmd: 'invoice-by-id' })
  public async getInvoiceById(invoiceId: number): Promise<InvoiceEntity> {
    return this.invoiceService.findById(invoiceId);
  }

  @MessagePattern({ cmd: 'pay-invoice' })
  public async payInvoice(invoiceId: number): Promise<IGenericMessageResponse> {
    return this.invoiceService.payInvoice(invoiceId);
  }

  @MessagePattern({ cmd: 'subscription-by-id' })
  public async getSubscriptionById(id: number): Promise<SubscriptionEntity> {
    return this.subscriptionService.findById(id);
  }

  @MessagePattern({ cmd: 'create-subscription' })
  public async createSubscription(
    subscription: CreateSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionService.create(subscription);
  }

  @MessagePattern({ cmd: 'update-subscription' })
  public async updateSubscription(
    subscription: UpdateSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    return this.subscriptionService.update(subscription);
  }

  @MessagePattern({ cmd: 'delete-subscription' })
  public async deleteSubscription(
    id: number,
  ): Promise<IGenericMessageResponse> {
    return this.subscriptionService.delete(id);
  }
}
