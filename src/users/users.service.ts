import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { isEmail } from 'class-validator';
import { hash } from 'bcrypt';
import { getToday } from '../common/utils/dates.utils';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
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
            throw new ConflictException(
                'E-Mail já está em uso por outro usuário.',
            );
        }
    }

    public async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    public async findOneById(userId: number): Promise<User> {
        const user = await this.usersRepository.findOneBy({ id: userId });
        this.commonService.checkEntityExistence(user, 'Usuário');

        return user;
    }

    public async findOneByEmail(
        email: string,
        checkForExistence = true,
    ): Promise<User> {
        const user = await this.usersRepository.findOneBy({ email });

        if (checkForExistence) {
            this.commonService.checkEntityExistence(user, 'Usuário');
        }

        return user;
    }

    public async findOneByUsername(username: string): Promise<User> {
        const user = await this.usersRepository.findOneBy({ username });
        this.commonService.checkEntityExistence(user, 'Usuário');

        return user;
    }

    public async findOneByEmailOrUsername(
        emailOrUsername: string,
    ): Promise<User> {
        if (isEmail(emailOrUsername)) {
            return this.findOneByEmail(emailOrUsername);
        }

        return this.findOneByUsername(emailOrUsername);
    }

    public async create(
        name: string,
        password: string,
        email: string,
    ): Promise<User> {
        await this.checkIfEmailAlreadyExists(email);

        const formattedName = this.commonService.formatName(name);
        const user = this.usersRepository.create({
            email,
            name: formattedName,
            username: await this.generateUsername(formattedName),
            password: await hash(password, 10),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        await this.commonService.saveEntity<User>(this.usersRepository, user);
        return user;
    }

    public async externalOauthCreate(
        name: string,
        email: string,
    ): Promise<User> {
        await this.checkIfEmailAlreadyExists(email);

        const formattedName = this.commonService.formatName(name);
        const user = this.usersRepository.create({
            email,
            name: formattedName,
            username: await this.generateUsername(formattedName),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            confirmed: true,
        });

        await this.commonService.saveEntity<User>(this.usersRepository, user);
        return user;
    }

    public async delete(userId: number): Promise<void> {
        const user = await this.findOneById(userId);

        await this.commonService.removeEntity<User>(this.usersRepository, user);
    }

    public async resetPassword(
        userId: number,
        password: string,
    ): Promise<User> {
        const user = await this.findOneById(userId);
        user.password = await hash(password, 10);
        user.updatedAt = getToday().toDate();

        await this.commonService.saveEntity(this.usersRepository, user);
        return user;
    }

    public async confirmUser(user: User): Promise<void> {
        user.confirmed = true;
        user.updatedAt = getToday().toDate();

        await this.commonService.saveEntity(this.usersRepository, user);
    }

    public async finishAccountSetup(userId: number): Promise<void> {
        const user = await this.findOneById(userId);
        user.accountSetup = true;

        await this.commonService.saveEntity(this.usersRepository, user);
    }
}
