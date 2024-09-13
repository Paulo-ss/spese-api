import { ExpenseCategory } from '../enums/expense-category.enum';
import { ExpenseType } from '../enums/expense-type.enum';

export class CreateExpenseDto {
  public bankAccountId?: number;
  public creditCardId?: number;
  public expenseType: ExpenseType;
  public installments?: number;
  public name: string;
  public price: number;
  public category?: ExpenseCategory;
  public expenseDate: Date;
}
