import { IsJWT, IsString, Length, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/utils/regex.const';

export class ResetPasswordDto {
  @IsString()
  @IsJWT({ message: 'Token de redefinião inválido.' })
  public resetToken: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @Length(8, 35, { message: 'A senha deve contem entre 8 a 35 caracteres.' })
  @Matches(PASSWORD_REGEX, {
    message:
      'A senha precisa de uma letra minúscula, maiúscula, e um número ou caracter especial.',
  })
  public password: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  @Length(8, 35, { message: 'A senha deve contem entre 8 a 35 caracteres.' })
  @Matches(PASSWORD_REGEX, {
    message:
      'A senha precisa de uma letra minúscula, maiúscula, e um número ou caracter especial.',
  })
  public passwordConfirmation: string;
}
