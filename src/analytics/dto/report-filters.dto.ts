import { IsOptional, Matches } from 'class-validator';
import { DATE_MM_YYYY_REGEX } from 'src/common/utils/regex.const';

export class ReportFiltersDto {
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
