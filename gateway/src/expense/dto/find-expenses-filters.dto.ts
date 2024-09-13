import { ExpenseCategory } from '../enums/expense-category.enum';

export class FindExpensesFiltersDto {
  public fromMonth: string;
  public toMonth?: string;
  public category?: ExpenseCategory;
  public name?: string;
  public priceRange?: number[];
  public creditCardId?: number;
}
