import { IsInstance } from 'class-validator';
import { Expense } from 'src/expenses/entities/expense.entity';
import { CreditCard } from '../entities/credit-card.entity';
import { Invoice } from '../entities/invoice.entity';

export class CreateInstallmentDto {
  @IsInstance(Expense)
  public expense: Expense;

  @IsInstance(CreditCard)
  public creditCard: CreditCard;

  @IsInstance(Invoice)
  public invoice: Invoice;
}
