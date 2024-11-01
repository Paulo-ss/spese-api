import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WageEntity } from './entities/wage.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { PersistWageDto } from './dto/persist-wage.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WageService {
  constructor(
    @InjectRepository(WageEntity)
    private readonly wageRepository: Repository<WageEntity>,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) {}

  public async findByUserId(userId: number): Promise<WageEntity> {
    const wage = await this.wageRepository.findOneBy({ userId });
    this.commonService.checkEntityExistence(wage, 'Salário');

    return wage;
  }

  public async create(
    wage: PersistWageDto,
    userId: number,
  ): Promise<WageEntity> {
    const newWage = this.wageRepository.create({ ...wage, userId });

    await this.commonService.saveEntity(this.wageRepository, newWage);
    await this.usersService.finishAccountSetup(userId);

    return newWage;
  }

  public async update(
    { wage }: PersistWageDto,
    userId: number,
  ): Promise<WageEntity> {
    const wageToBeUpdated = await this.findByUserId(userId);
    wageToBeUpdated.wage = wage;

    const updatedAge = await this.commonService.saveEntity(
      this.wageRepository,
      wageToBeUpdated,
    );

    return updatedAge;
  }
}
