import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { isNull, isUndefined } from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { isEmpty } from 'class-validator';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCardEntity)
    private readonly creditCardRepository: Repository<CreditCardEntity>,
    private readonly commonService: CommonService,
    private readonly bankAccountService: BankAccountsService,
  ) {}

  public async findById(
    credtiCardId: number,
    userId: number,
  ): Promise<CreditCardEntity> {
    const credtiCard = await this.creditCardRepository.findOne({
      where: { id: credtiCardId },
      relations: {
        invoices: {
          expenses: false,
          creditCard: false,
        },
        subscriptions: { expenses: false },
        bankAccount: { expenses: false },
      },
      order: {
        invoices: {
          closingDate: 'asc',
        },
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

  public async getUsersMonthCreditCardTotal(
    userId: number,
    selectedMonth: string,
  ): Promise<{
    paidInvoicesTotal: number;
    invoicesTotal: number;
  }> {
    const creditCards = await this.creditCardRepository
      .createQueryBuilder('cc')
      .leftJoinAndSelect('cc.invoices', 'in')
      .andWhere('cc.user_id = :userId', { userId })
      .getMany();

    if (
      isNull(creditCards) ||
      isUndefined(creditCards) ||
      isEmpty(creditCards)
    ) {
      return { paidInvoicesTotal: 0, invoicesTotal: 0 };
    }

    const [month, year] = selectedMonth.split('-').map(Number);
    const firstDayOfTheMonth = new Date(year, month - 1);

    let invoicesTotal = 0;
    let paidInvoicesTotal = 0;
    for (const creditCard of creditCards) {
      if (
        !isNull(creditCard.invoices) &&
        !isUndefined(creditCard.invoices) &&
        creditCard.invoices.length > 0
      ) {
        firstDayOfTheMonth.setDate(creditCard.closingDay);
        const monthInvoice = creditCard.invoices.find((invoice) => {
          if (
            firstDayOfTheMonth.toISOString().split('T')[0] ===
            String(invoice.closingDate)
          ) {
            return invoice;
          }
        });

        if (monthInvoice?.status === InvoiceStatus.PAID) {
          paidInvoicesTotal += Number(monthInvoice.currentPrice);
          invoicesTotal += Number(monthInvoice.currentPrice);
          continue;
        }

        invoicesTotal += monthInvoice?.currentPrice
          ? Number(monthInvoice.currentPrice)
          : 0;
      }
    }

    return { paidInvoicesTotal, invoicesTotal };
  }

  public async findByUserId(userId: number): Promise<CreditCardEntity[]> {
    const creditCards = await this.creditCardRepository
      .createQueryBuilder('cc')
      .leftJoinAndSelect('cc.invoices', 'invoice')
      .leftJoinAndSelect('cc.subscriptions', 'subscriptions')
      .where('cc.user_id = :userId', { userId })
      .getMany();

    return creditCards;
  }

  public async create(
    creditCard: CreateCreditCardDto,
    userId: number,
  ): Promise<CreditCardEntity> {
    const newCredtiCard = this.creditCardRepository.create({
      ...creditCard,
      bankAccount: creditCard.bankAccountId
        ? await this.bankAccountService.findById(
            creditCard.bankAccountId,
            userId,
            false,
          )
        : undefined,
      userId,
    });

    await this.commonService.saveEntity(
      this.creditCardRepository,
      newCredtiCard,
    );

    return newCredtiCard;
  }

  public async createMultiple(
    creditCards: CreateCreditCardDto[],
    userId: number,
  ): Promise<IGenericMessageResponse> {
    const newCredtiCards: CreditCardEntity[] = [];

    for (const cc of creditCards) {
      newCredtiCards.push(
        this.creditCardRepository.create({
          ...cc,
          bankAccount: cc.bankAccountId
            ? await this.bankAccountService.findById(
                cc.bankAccountId,
                userId,
                false,
              )
            : undefined,
          userId,
        }),
      );
    }

    await this.commonService.saveMultipleEntities(
      this.creditCardRepository,
      newCredtiCards,
    );

    return this.commonService.generateGenericMessageResponse(
      'Cartões de Crédito registrados com sucesso.',
    );
  }

  public async update(
    updateCreditCardDto: UpdateCreditCardDto,
    creditCardId: number,
    userId: number,
  ): Promise<CreditCardEntity> {
    const creditCard = await this.findById(creditCardId, userId);

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
