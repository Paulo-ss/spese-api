import { Matches } from 'class-validator';
import { DATE_MM_DD_YYYY_REGEX } from 'src/common/utils/regex.const';

export class FilterIncomesDto {
  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no padrão MM-dd-yyyy',
  })
  public fromDate: string;

  @Matches(DATE_MM_DD_YYYY_REGEX, {
    message: 'A data deve estar no padrão MM-dd-yyyy',
  })
  public toDate: string;
}
