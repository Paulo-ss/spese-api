import { IsOptional, Matches } from 'class-validator';
import { DATE_YYYY_MM_DD_REGEX } from 'src/common/utils/regex.const';

export class ReportFiltersDto {
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no formato YYYY-MM-DD.',
    })
    public fromDate: string;

    @IsOptional()
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no formato YYYY-MM-DD.',
    })
    public toDate?: string;
}
