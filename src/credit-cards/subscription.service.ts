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

  public async findById(id: number): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: { creditCard: true },
    });
    this.commonService.checkEntityExistence(subscription, 'Assinatura');

    return subscription;
  }

  public async findByUser(userId: number): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepository.find({
      where: { userId },
      relations: { creditCard: true },
    });
  }

  public async findByCreditCard(
    creditCardId: number,
  ): Promise<SubscriptionEntity[]> {
    return await this.subscriptionRepository.find({
      where: { creditCard: { id: creditCardId } },
      relations: { creditCard: true },
    });
  }

  public async create(
    subscription: CreateSubscriptionDto,
    userId: number,
  ): Promise<SubscriptionEntity> {
    const creditCard = await this.creditCardService.findById(
      subscription.creditCardId,
      userId,
    );

    const newSubscription = this.subscriptionRepository.create({
      ...subscription,
      creditCard,
      userId,
    });

    await this.commonService.saveEntity(
      this.subscriptionRepository,
      newSubscription,
    );

    return newSubscription;
  }

  public async update(
    id: number,
    dto: UpdateSubscriptionDto,
    userId: number,
  ): Promise<SubscriptionEntity> {
    const subscription = await this.findById(id);

    const creditCard = dto.creditCardId
      ? await this.creditCardService.findById(dto.creditCardId, userId)
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
