import { IsEmail, IsJWT, IsString, Length } from 'class-validator';

export class SendEmailDto {
  @IsString({ message: 'Digite um nome.' })
  @Length(5, 255, {
    message: 'O e-mail deve conter entre a 5 a 255 caracteres.',
  })
  @IsEmail({}, { message: 'Digite um e-mail válido.' })
  public email: string;

  @IsString({ message: 'Digite um nome.' })
  public name: string;

  @IsString()
  @IsJWT({ message: 'Token inválido' })
  public token: string;
}
