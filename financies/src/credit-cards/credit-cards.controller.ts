import { Controller } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreditCardEntity } from './entities/credit-card.entity';
import { FindByIdAndUserIdDto } from 'src/common/dto/find-by-id-and-user-id.dto';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { SimplifiedCreditCardDto } from './dto/simplified-credit-card.dto';

@Controller()
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

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
}
