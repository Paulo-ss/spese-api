import { IsNumber, IsOptional, IsString, Matches } from 'class-validator';
import { DATE_YYYY_MM_DD_REGEX } from 'src/common/utils/regex.const';

export class UpdateIncomeDto {
    @IsOptional()
    @IsString()
    public name?: string;

    @IsOptional()
    @IsNumber(
        { maxDecimalPlaces: 2 },
        { message: 'Digite um valor de R$ válido. Ex: 11.99' },
    )
    public value?: number;

    @IsOptional()
    @Matches(DATE_YYYY_MM_DD_REGEX, {
        message: 'A data deve estar no padrão YYYY-MM-DD',
    })
    public incomeMonth?: string;
}
