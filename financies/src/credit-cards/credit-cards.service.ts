import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { BankAccountEntity } from 'src/bank-accounts/entities/bank.entity';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly creditCardRepository: Repository<CreditCardEntity>,
    private readonly commonService: CommonService,
  ) {}

  public async findById(
    credtiCardId: number,
    userId: number,
  ): Promise<CreditCardEntity> {
    const credtiCard = await this.creditCardRepository.findOne({
      where: { id: credtiCardId },
      relations: {
        installments: true,
        invoices: true,
        subscriptions: true,
      },
    });
    this.commonService.checkEntityExistence(credtiCard, 'Cartão de crédito');

    if (credtiCard.userId !== userId) {
      throw new UnauthorizedException(
        'Esse cartão de crédito não pertence ao usuário logado.',
      );
    }

    return credtiCard;
  }

  public async findByUserIdAndMonth(
    userId: number,
    invoiceDate: string,
  ): Promise<CreditCardEntity[]> {
    new Date(9, 2024);
    const [month, year] = invoiceDate.split('-').map(Number);

    const creditCards = await this.creditCardRepository
      .createQueryBuilder('cc')
      .leftJoinAndSelect('cc.invoices', 'invoice')
      .where('cc.user_id = :userId', { userId })
      .andWhere('invoice.invoice_date === :invoiceDate', {
        invoiceDate: new Date(year, month),
      })
      .getMany();

    return creditCards;
  }

  public async create(
    creditCard: CreateCreditCardDto,
  ): Promise<CreditCardEntity> {
    const newCredtiCard = this.creditCardRepository.create({
      ...creditCard,
    });

    await this.commonService.saveEntity(
      this.creditCardRepository,
      newCredtiCard,
    );

    return newCredtiCard;
  }

  public async update(
    updateCreditCardDto: UpdateCreditCardDto,
  ): Promise<CreditCardEntity> {
    const { credtiCardId, userId } = updateCreditCardDto;

    const creditCard = await this.findById(credtiCardId, userId);

    Object.keys(updateCreditCardDto).forEach((key) => {
      if (
        !isNull(updateCreditCardDto[key]) &&
        !isUndefined(updateCreditCardDto[key])
      ) {
        creditCard[key] = updateCreditCardDto[key];
      }
    });

    await this.commonService.saveEntity(this.creditCardRepository, creditCard);

    return creditCard;
  }

  public async delete(
    credtiCardId: number,
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const credtiCard = await this.findById(credtiCardId, userId);

    await this.commonService.removeEntity(
      this.creditCardRepository,
      credtiCard,
    );

    return this.commonService.generateGenericMessageResponse(
      'Cartão de crédito deletado com sucesso.',
    );
  }
}
