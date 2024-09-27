import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsJWT({ message: 'Envie um token válido.' })
  public refreshToken: string;
}
