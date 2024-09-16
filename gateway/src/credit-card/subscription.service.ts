import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async findById(subscriptionId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'subscription-by-id' }, subscriptionId),
    );

    return response;
  }

  public async create(subscription: CreateSubscriptionDto, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-subscription' },
        { ...subscription, userId },
      ),
    );

    return response;
  }

  public async update(
    id: number,
    subscription: UpdateSubscriptionDto,
    userId: number,
  ) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'update-subscription' },
        { ...subscription, userId, id },
      ),
    );

    return response;
  }

  public async delete(subscriptionId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'delete-subscription' }, subscriptionId),
    );

    return response;
  }
}
