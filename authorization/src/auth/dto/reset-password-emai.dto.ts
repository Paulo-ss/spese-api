import { IsEmail, IsString, Length } from 'class-validator';

export class ResetPasswordEmailDto {
  @IsString({ message: 'E-Mail é obrigatório e deve ser um texto.' })
  @Length(5, 255, { message: 'E-Mail deve conter entre 5 a 255 caracteres.' })
  @IsEmail({}, { message: 'Digite um e-mail válido.' })
  public email: string;
}
