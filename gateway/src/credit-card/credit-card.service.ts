import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FindByIdAndUserIdDto } from 'src/dto/find-by-id-and-user-id.dto';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

@Injectable()
export class CreditCardService {
  constructor(
    @Inject('FINANCIES') private readonly financiesClient: ClientProxy,
  ) {}

  public async findCreditCardById(dto: FindByIdAndUserIdDto) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'credit-card-by-id' }, dto),
    );

    return response;
  }

  public async findCreditCardByUserId(userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send({ cmd: 'credit-card-by-user-id' }, userId),
    );

    return response;
  }

  public async createCreditCard(
    creditCard: CreateCreditCardDto,
    userId: number,
  ) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'create-credit-card' },
        { ...creditCard, userId },
      ),
    );

    return response;
  }

  public async updateCreditCard(
    creditCard: UpdateCreditCardDto,
    creditCardId: number,
    userId: number,
  ) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'update-credit-card' },
        { ...creditCard, creditCardId, userId },
      ),
    );

    return response;
  }

  public async deleteCreditCard(creditCardId: number, userId: number) {
    const response = await firstValueFrom(
      this.financiesClient.send(
        { cmd: 'delete-credit-card' },
        { id: creditCardId, userId },
      ),
    );

    return response;
  }
}
