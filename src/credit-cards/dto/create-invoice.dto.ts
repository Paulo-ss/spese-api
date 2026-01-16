import { IsDate, IsInstance, IsOptional } from 'class-validator';
import { CreditCardEntity } from '../entities/credit-card.entity';

export class CreateInvoiceDto {
    @IsInstance(CreditCardEntity)
    public creditCard: CreditCardEntity;

    @IsDate()
    public invoiceDate: Date;

    @IsOptional()
    @IsDate()
    public dateToComputeStatus?: Date;
}
