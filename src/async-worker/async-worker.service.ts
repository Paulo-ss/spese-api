import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AsyncWorkerService {
  private readonly logger = new Logger(AsyncWorkerService.name);

  constructor() {}
}
