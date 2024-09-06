import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import {
  BCRYPT_HASH,
  NAME_REGEX,
  SLUG_REGEX,
} from 'src/common/utils/regex.const';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ name: 'name' })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'O nome não pode conter caracteres especiais.',
  })
  public name: string;

  @Column({ name: 'username' })
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username inválido.',
  })
  public username: string;

  @Column({ name: 'email' })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;

  @Column({ name: 'password', nullable: true })
  @IsOptional()
  @IsString()
  @Length(59, 60)
  @Matches(BCRYPT_HASH)
  public password: string;

  @Column({ name: 'confirmed', default: false })
  @IsBoolean()
  public confirmed: boolean;

  @Column({ name: 'created_at' })
  public createdAt: string;

  @Column({ name: 'updated_at', default: new Date().toISOString() })
  public updatedAt: string;
}
