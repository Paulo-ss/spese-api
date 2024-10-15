import { IsJWT, IsString } from 'class-validator';

export class ExternalSignInDto {
  @IsJWT({ message: 'Envie um token válido.' })
  public idToken: string;

  @IsString({ message: 'Informe um provider.' })
  public provider: string;
}
