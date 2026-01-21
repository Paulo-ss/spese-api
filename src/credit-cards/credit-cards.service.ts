import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCardEntity } from './entities/credit-card.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import {
    isEmpty,
    isNull,
    isNullOrUndefined,
    isUndefined,
} from 'src/common/utils/validation.utils';
import { IGenericMessageResponse } from 'src/common/interfaces/generic-message-response.interface';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { BankAccountsService } from 'src/bank-accounts/bank-accounts.service';
import { getFirstDayOfMonth } from '../common/utils/dates.utils';
import dayjs from 'dayjs';

@Injectable()
export class CreditCardsService {
    constructor(
        @InjectRepository(CreditCardEntity)
        private readonly creditCardRepository: Repository<CreditCardEntity>,
        private readonly commonService: CommonService,
        private readonly bankAccountService: BankAccountsService,
    ) {}

    public async findById(
        creditCardId: number,
        userId: number,
    ): Promise<CreditCardEntity> {
        const creditCard = await this.creditCardRepository.findOne({
            where: { id: creditCardId },
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
        this.commonService.checkEntityExistence(
            creditCard,
            'Cartão de crédito',
        );

        if (creditCard.userId !== userId) {
            throw new UnauthorizedException(
                'Esse cartão de crédito não pertence ao usuário logado.',
            );
        }

        return creditCard;
    }

    public async getUserMonthCreditCardTotal(
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

        if (isNullOrUndefined(creditCards) || isEmpty(creditCards)) {
            return { paidInvoicesTotal: 0, invoicesTotal: 0 };
        }

        let invoicesTotal = 0;
        let paidInvoicesTotal = 0;

        for (const creditCard of creditCards) {
            if (!isEmpty(creditCard.invoices)) {
                const closingDay = getFirstDayOfMonth(selectedMonth).date(
                    creditCard.closingDay,
                );
                const monthInvoice = creditCard.invoices.find((invoice) =>
                    closingDay.isSame(dayjs(invoice.closingDate), 'day'),
                );
                if (!monthInvoice) {
                    continue;
                }

                if (monthInvoice.status === InvoiceStatus.PAID) {
                    paidInvoicesTotal += monthInvoice.currentPrice;
                }

                invoicesTotal += monthInvoice.currentPrice;
            }
        }

        return { paidInvoicesTotal, invoicesTotal };
    }

    public async findByUserId(userId: number): Promise<CreditCardEntity[]> {
        return await this.creditCardRepository
            .createQueryBuilder('cc')
            .leftJoinAndSelect('cc.invoices', 'invoice')
            .leftJoinAndSelect('cc.subscriptions', 'subscriptions')
            .where('cc.user_id = :userId', { userId })
            .getMany();
    }

    public async create(
        creditCard: CreateCreditCardDto,
        userId: number,
    ): Promise<CreditCardEntity> {
        const newCreditCard = this.creditCardRepository.create({
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
            newCreditCard,
        );

        return newCreditCard;
    }

    public async createMultiple(
        creditCards: CreateCreditCardDto[],
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const newCreditCards: CreditCardEntity[] = [];

        for (const cc of creditCards) {
            newCreditCards.push(
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
            newCreditCards,
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

        await this.commonService.saveEntity(
            this.creditCardRepository,
            creditCard,
        );

        return creditCard;
    }

    public async delete(
        creditCardId: number,
        userId: number,
    ): Promise<IGenericMessageResponse> {
        const creditCard = await this.findById(creditCardId, userId);

        await this.commonService.removeEntity(
            this.creditCardRepository,
            creditCard,
        );

        return this.commonService.generateGenericMessageResponse(
            'Cartão de crédito deletado com sucesso.',
        );
    }
}
