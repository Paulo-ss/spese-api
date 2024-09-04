import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { NAME_REGEX, PASSWORD_REGEX } from 'src/common/utils/regex.const';

export class SignUpDto {
  @IsString({ message: 'Nome do usuário deve ser um texto.' })
  @Length(3, 100, {
    message: 'Nome do usuário deve conter entre 3 a 100 caracteres.',
  })
  @Matches(NAME_REGEX, {
    message: 'O nome não pode conter caracteres especiais.',
  })
  public name: string;

  @IsString({ message: 'E-Mail deve ser um texto.' })
  @IsEmail({}, { message: 'Digite um e-mail válido.' })
  @Length(5, 255, { message: 'O E-Mail deve conter entre 5 a 255 caracteres.' })
  public email: string;

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
