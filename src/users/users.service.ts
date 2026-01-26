import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CommonService } from 'src/common/common.service';
import { isEmail } from 'class-validator';
import { hash } from 'bcrypt';
import { getToday } from '../common/utils/dates.utils';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly commonService: CommonService,
    ) {}

    private async generateUsername(name: string): Promise<string> {
        const pointSlug = this.commonService.generatePointSlug(name);
        const count = await this.userRepository.countByUsername(pointSlug);

        if (count > 0) {
            return `${pointSlug}${count}`;
        }

        return pointSlug;
    }

    private async checkIfEmailAlreadyExists(email: string): Promise<void> {
        const count = await this.userRepository.countByEmail(email);

        if (count > 0) {
            throw new ConflictException(
                'E-Mail já está em uso por outro usuário.',
            );
        }
    }

    public async findOneById(userId: number): Promise<User> {
        const user = await this.userRepository.findById(userId);
        this.commonService.checkEntityExistence(user, 'Usuário');

        return user;
    }

    public async findOneByEmail(
        email: string,
        checkForExistence = true,
    ): Promise<User> {
        const user = await this.userRepository.findByEmail(email);

        if (checkForExistence) {
            this.commonService.checkEntityExistence(user, 'Usuário');
        }

        return user;
    }

    public async findOneByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findByUsername(username);
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
        return await this.userRepository.upsert({
            email,
            name: formattedName,
            username: await this.generateUsername(formattedName),
            password: await hash(password, 10),
        });
    }

    public async externalOauthCreate(
        name: string,
        email: string,
    ): Promise<User> {
        await this.checkIfEmailAlreadyExists(email);

        const formattedName = this.commonService.formatName(name);
        return await this.userRepository.upsert({
            email,
            name: formattedName,
            username: await this.generateUsername(formattedName),
            confirmed: true,
        });
    }

    public async delete(userId: number): Promise<void> {
        const user = await this.findOneById(userId);

        await this.userRepository.delete(user);
    }

    public async resetPassword(
        userId: number,
        password: string,
    ): Promise<User> {
        const user = await this.findOneById(userId);
        user.password = await hash(password, 10);
        user.updatedAt = getToday().toDate();

        return await this.userRepository.upsert(user);
    }

    public async confirmUser(user: User): Promise<void> {
        user.confirmed = true;
        user.updatedAt = getToday().toDate();

        await this.userRepository.upsert(user);
    }

    public async finishAccountSetup(userId: number): Promise<User> {
        const user = await this.findOneById(userId);
        user.accountSetup = true;

        return await this.userRepository.upsert(user);
    }
}
