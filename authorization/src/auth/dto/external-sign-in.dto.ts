import { IsIn, IsJWT, IsString } from 'class-validator';
import { AvailableExternalOauthProviders } from '../types/available-external-oauth-providers.type';

export class ExternalSignInDto {
  @IsString({ message: 'Token deve ser um texto.' })
  @IsJWT({ message: 'Token inválido.' })
  public idToken: string;

  @IsIn(['google', 'facebook'], {
    message: 'O provider selecionado não está registrado.',
  })
  public provider: AvailableExternalOauthProviders;
}
