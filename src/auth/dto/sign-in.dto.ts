import { IsString } from 'class-validator';

export class SignInDto {
  @IsString({ message: 'E-Mail or nome de usuário devem ser um texto.' })
  public emailOrUsername: string;

  @IsString({ message: 'A senha deve ser um texto.' })
  public password: string;
}
