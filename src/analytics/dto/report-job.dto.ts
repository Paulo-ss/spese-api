import { IsNumber, IsOptional, Matches } from 'class-validator';
import { DATE_MM_YYYY_REGEX } from 'src/common/utils/regex.const';

export class ReportJobDto {
  @IsOptional()
  @IsNumber()
  public reportId?: number;

  @Matches(DATE_MM_YYYY_REGEX, {
    message: 'A data deve estar no formado MM-yyyy.',
  })
  public month: string;

  @IsOptional()
  @IsNumber()
  public userId?: number;
}
