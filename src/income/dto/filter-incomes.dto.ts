import { IsNumber, IsOptional, Matches } from 'class-validator';
import { DATE_YYYY_MM_DD_REGEX } from 'src/common/utils/regex.const';

export class FilterIncomesDto {
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no padrão MM-dd-yyyy',
    })
    public fromDate: string;

    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no padrão MM-dd-yyyy',
    })
    public toDate: string;

    @IsOptional()
    @IsNumber()
    public userId?: number;
}
