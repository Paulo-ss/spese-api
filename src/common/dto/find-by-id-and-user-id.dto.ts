import { IsNumber } from 'class-validator';

export class FindByIdAndUserIdDto {
  @IsNumber()
  public id: number;

  @IsNumber()
  public userId: number;
}
