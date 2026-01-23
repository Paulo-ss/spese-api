import { IsNumber, IsOptional, Matches } from 'class-validator';
import { DATE_YYYY_MM_REGEX } from 'src/common/utils/regex.const';

export class ReportJobDto {
    @IsOptional()
    @IsNumber()
    public reportId?: number;

    @Matches(DATE_YYYY_MM_REGEX, {
        message: 'A data deve estar no formado YYYY-MM.',
    })
    public month: string;

    @IsOptional()
    @IsNumber()
    public userId?: number;
}
