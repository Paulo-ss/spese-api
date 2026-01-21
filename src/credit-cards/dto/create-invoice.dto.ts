import { IsDate, IsInstance, IsOptional } from 'class-validator';
import { CreditCard } from '../entities/credit-card.entity';

export class CreateInvoiceDto {
    @IsInstance(CreditCard)
    public creditCard: CreditCard;

    @IsDate()
    public invoiceDate: Date;

    @IsOptional()
    @IsDate()
    public dateToComputeStatus?: Date;
}
