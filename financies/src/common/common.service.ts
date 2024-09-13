import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { isNull, isUndefined } from './utils/validation.utils';
import { Repository } from 'typeorm';
import { IGenericMessageResponse } from './interfaces/generic-message-response.interface';
import { v4 } from 'uuid';

@Injectable()
export class CommonService {
  private readonly loggerService: LoggerService;

  constructor() {
    this.loggerService = new Logger(CommonService.name);
  }

  public generateGenericMessageResponse(
    message: string,
  ): IGenericMessageResponse {
    return { id: v4(), message };
  }

  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);

      if (error.code === '23505') {
        throw new ConflictException(message ?? 'Duplicated value in database');
      }

      throw new BadRequestException(error.message);
    }
  }

  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public checkEntityExistence<T>(
    entity: T | null | undefined,
    name: string,
  ): void {
    if (isNull(entity) || isUndefined(entity)) {
      throw new NotFoundException(`${name} não encontrado.`);
    }
  }

  public async saveEntity<T>(repo: Repository<T>, entity: T) {
    return await this.throwDuplicateError(repo.save(entity));
  }

  public async saveMultipleEntities<T>(repo: Repository<T>, entities: T[]) {
    return await this.throwDuplicateError(repo.save(entities));
  }

  public async removeEntity<T>(repo: Repository<T>, entity: T) {
    await this.throwInternalError(repo.remove(entity));
  }
}
