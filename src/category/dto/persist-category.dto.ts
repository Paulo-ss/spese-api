import { IsString } from 'class-validator';

export class PersistCategoryDto {
  @IsString()
  public name: string;

  @IsString()
  public color: string;
}
