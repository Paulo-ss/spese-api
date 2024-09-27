import { IsJWT, IsString } from 'class-validator';

export class ExternalSignInDto {
  @IsJWT({ message: 'Envie um token válido.' })
  public idToken: string;

  @IsString()
  public provider: string;
}
