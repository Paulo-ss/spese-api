import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstallmentEntity } from './entities/installment.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { CreditCardsService } from './credit-cards.service';
import { CreateInstallmentDto } from './dto/create-installment.dto';

@Injectable()
export class InstallmentService {
  constructor(
    @InjectRepository(InstallmentEntity)
    private readonly installmentRepository: Repository<InstallmentEntity>,
    private readonly commonService: CommonService,
    private readonly creditCardService: CreditCardsService,
  ) {}

  public async findById(id: number): Promise<InstallmentEntity> {
    const installment = await this.installmentRepository.findOneBy({ id });
    this.commonService.checkEntityExistence(installment, 'Parcela');

    return installment;
  }

  public async create(installmentsDto: CreateInstallmentDto[]) {
    const installments: InstallmentEntity[] = [];

    installmentsDto.forEach((installment, index) => {
      const newInstallment = this.installmentRepository.create({
        ...installment,
        installmentNumber: index + 1,
      });

      installments.push(newInstallment);
    });

    await this.commonService.saveMultipleEntities(
      this.installmentRepository,
      installments,
    );
  }
}
