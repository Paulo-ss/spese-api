import { IsNumber, Matches } from 'class-validator';
import { DATE_YYYY_MM_DD_REGEX } from 'src/common/utils/regex.const';

export class FilterIncomesDto {
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no padrão YYYY-MM-DD',
    })
    public fromDate: string;

    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no padrão YYYY-MM-DD',
    })
    public toDate: string;

    @IsNumber()
    public userId?: number;
}
