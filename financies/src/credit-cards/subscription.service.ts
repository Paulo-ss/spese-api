import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreditCardsService } from './credit-cards.service';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @Inject() private readonly creditCardService: CreditCardsService,
    private readonly commonService: CommonService,
  ) {}

  private async findById(id: number): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOneBy({ id });
    this.commonService.checkEntityExistence(subscription, 'Assinatura');

    return subscription;
  }

  public async findByCreditCard(
    creditCardId: number,
  ): Promise<SubscriptionEntity[]> {
    const subscriptions = await this.subscriptionRepository.findBy({
      creditCard: { id: creditCardId },
    });

    return subscriptions;
  }

  public async create(
    subscription: CreateSubscriptionDto,
  ): Promise<SubscriptionEntity> {
    const creditCard = await this.creditCardService.findById(
      subscription.creditCardId,
      subscription.userId,
    );

    const newSubscription = this.subscriptionRepository.create({
      ...subscription,
      creditCard,
    });

    await this.commonService.saveEntity(
      this.subscriptionRepository,
      newSubscription,
    );

    return newSubscription;
  }

  public async update(dto: UpdateSubscriptionDto): Promise<SubscriptionEntity> {
    const subscription = await this.findById(dto.id);

    const creditCard = dto.creditCardId
      ? await this.creditCardService.findById(dto.creditCardId, dto.userId)
      : null;
    if (creditCard) {
      subscription.creditCard = creditCard;
    }

    if (dto.name) {
      subscription.name = dto.name;
    }

    if (dto.price) {
      subscription.price = dto.price;
    }

    await this.commonService.saveEntity(
      this.subscriptionRepository,
      subscription,
    );

    return subscription;
  }

  public async delete(id: number): Promise<IGenericMessageResponse> {
    const subscription = await this.findById(id);

    await this.commonService.removeEntity(
      this.subscriptionRepository,
      subscription,
    );

    return this.commonService.generateGenericMessageResponse(
      'Assinatura removida com sucesso.',
    );
  }
}
