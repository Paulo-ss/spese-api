// common/services/request-context.service.ts
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class RequestContextService {
  constructor(private readonly cls: ClsService) {}

  getTimezone(): string {
    return this.cls.get<string>('timezone') || 'UTC';
  }
}
