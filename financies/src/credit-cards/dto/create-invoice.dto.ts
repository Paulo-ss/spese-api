import {
  IsDate,
  IsDecimal,
  IsEnum,
  IsInstance,
  IsNumber,
} from 'class-validator';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export class CreateInvoiceDto {
  @IsNumber()
  @IsDecimal()
  public currentPrice: number;

  @IsInstance(CreditCardEntity)
  public creditCard: CreditCardEntity;

  @IsEnum(InvoiceStatus)
  public status: InvoiceStatus;

  @IsDate()
  public invoiceDate: Date;
}