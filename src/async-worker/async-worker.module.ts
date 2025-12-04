import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AsyncWorkerService } from './async-worker.service';
import { ISubscriber } from './interfaces/subscriber.interface';
import { SubscribersModule } from './subscribers/subscribers.module';
import { DEPENDENCY_INJECTION_PROVIDERS } from 'src/common/constants/constants';
import { RedisConnection } from './connection/redis-connection';
import { RedisPublisher } from './publisher/redis.publisher';

@Module({
  imports: [SubscribersModule],
  providers: [AsyncWorkerService, RedisConnection, RedisPublisher],
  exports: [AsyncWorkerService, RedisPublisher],
})
export class AsyncWorkerModule implements OnModuleInit {
  constructor(
    private readonly asyncWorkerService: AsyncWorkerService,
    @Inject(DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS)
    private readonly subscribers: ISubscriber[],
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.subscribers.length > 0) {
      await this.asyncWorkerService.initializeSubscribers(this.subscribers);
    }
  }
}
