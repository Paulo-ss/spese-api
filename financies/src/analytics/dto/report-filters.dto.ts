import { IsNumber, IsOptional, Matches } from 'class-validator';
import { DATE_MM_YYYY_REGEX } from 'src/common/utils/validation.utils';

export class ReportFiltersDto {
  @IsNumber()
  public userId: number;

  @Matches(DATE_MM_YYYY_REGEX, {
    message: 'A data deve estar no formado MM-yyyy.',
  })
  public fromDate: string;

  @IsOptional()
  @Matches(DATE_MM_YYYY_REGEX, {
    message: 'A data deve estar no formado MM-yyyy.',
  })
  public toDate?: string;
}
