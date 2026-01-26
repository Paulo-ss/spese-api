import { Inject, Injectable } from '@nestjs/common';
import { Subscription } from './entities/subscription.entity';
import { CommonService } from 'src/common/common.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { CreditCardsService } from './credit-cards.service';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { SubscriptionRepository } from './subscription.repository';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly subscriptionRepository: SubscriptionRepository,
        @Inject() private readonly creditCardService: CreditCardsService,
        private readonly commonService: CommonService,
    ) {}

    public async findById(id: number): Promise<Subscription> {
        const subscription = await this.subscriptionRepository.findById(id);
        this.commonService.checkEntityExistence(subscription, 'Assinatura');

        return subscription;
    }

    public async findByUser(userId: number): Promise<Subscription[]> {
        return await this.subscriptionRepository.findByUser(userId);
    }

    public async findByCreditCard(
        creditCardId: number,
    ): Promise<Subscription[]> {
        return await this.subscriptionRepository.findByCreditCard(creditCardId);
    }

    public async create(
        subscription: CreateSubscriptionDto,
        userId: number,
    ): Promise<Subscription> {
        const creditCard = await this.creditCardService.findById(
            subscription.creditCardId,
            userId,
        );

        return await this.subscriptionRepository.upsert({
            ...subscription,
            creditCard,
            userId,
        });
    }

    public async update(
        id: number,
        dto: UpdateSubscriptionDto,
        userId: number,
    ): Promise<Subscription> {
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

        if (dto.billingDay) {
            subscription.billingDay = dto.billingDay;
        }

        return await this.subscriptionRepository.upsert(subscription);
    }

    public async delete(id: number): Promise<IGenericMessageResponse> {
        const subscription = await this.findById(id);

        await this.subscriptionRepository.delete(subscription);

        return this.commonService.generateGenericMessageResponse(
            'Assinatura removida com sucesso.',
        );
    }
}
