import { IsInstance } from 'class-validator';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { CreditCardEntity } from '../entities/credit-card.entity';
import { InvoiceEntity } from '../entities/invoice.entity';

export class CreateInstallmentDto {
  @IsInstance(ExpenseEntity)
  public expense: ExpenseEntity;

  @IsInstance(CreditCardEntity)
  public creditCard: CreditCardEntity;

  @IsInstance(InvoiceEntity)
  public invoice: InvoiceEntity;
}
