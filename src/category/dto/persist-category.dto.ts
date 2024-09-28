import { IsString } from 'class-validator';

export class PersistCategoryDto {
  @IsString()
  public name: string;
}
