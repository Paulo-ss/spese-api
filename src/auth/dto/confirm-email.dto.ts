import { IsJWT } from 'class-validator';

export class ConfirmEmailDto {
  @IsJWT({ message: 'Envie um token válido.' })
  public confirmationToken: string;
}
