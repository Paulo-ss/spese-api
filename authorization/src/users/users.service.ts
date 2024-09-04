import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { isEmail } from 'class-validator';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly commonService: CommonService,
  ) {}

  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this.usersRepository.countBy({
      username: `${pointSlug}%`,
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }

  private async checkIfEmailAlreadyExists(email: string): Promise<void> {
    const count = await this.usersRepository.countBy({ email });

    if (count > 0) {
      throw new ConflictException('E-Mail já está em uso por outro usuário.');
    }
  }

  public async findAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  public async findOneById(userId: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    this.commonService.checkEntityExistence(user, 'Usuário');

    return user;
  }

  public async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ email });
    this.commonService.checkEntityExistence(user, 'Usuário');

    return user;
  }

  public async findOneByUsername(username: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ username });
    this.commonService.checkEntityExistence(user, 'Usuário');

    return user;
  }

  public async findOneByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<UserEntity> {
    if (isEmail(emailOrUsername)) {
      return this.findOneByEmail(emailOrUsername);
    }

    return this.findOneByUsername(emailOrUsername);
  }

  public async create(
    name: string,
    password: string,
    email: string,
  ): Promise<UserEntity> {
    await this.checkIfEmailAlreadyExists(email);

    const formattedName = this.commonService.formatName(name);
    const user = this.usersRepository.create({
      email,
      name: formattedName,
      username: await this.generateUsername(formattedName),
      password: await hash(password, 10),
      createdAt: new Date().toISOString(),
    });

    await this.commonService.saveEntity<UserEntity>(this.usersRepository, user);
    return user;
  }

  public async delete(userId: number): Promise<void> {
    const user = await this.findOneById(userId);

    await this.commonService.removeEntity<UserEntity>(
      this.usersRepository,
      user,
    );
  }

  public async resetPassword(
    userId: number,
    password: string,
  ): Promise<UserEntity> {
    const user = await this.findOneById(userId);
    user.password = await hash(password, 10);

    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async confirmUser(user: UserEntity): Promise<void> {
    user.confirmed = true;

    await this.commonService.saveEntity(this.usersRepository, user);
  }
}
