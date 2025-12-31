import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { AsyncWorkerService } from './async-worker.service';
import { ISubscriber } from './interfaces/subscriber.interface';
import { SubscribersModule } from './subscribers/subscribers.module';
import { DEPENDENCY_INJECTION_PROVIDERS } from 'src/common/constants/constants';
import { RedisConnection } from './connection/redis-connection';
import { RedisPublisher } from './publisher/redis.publisher';
import { RedisConsumer } from './consumer/redis.consumer';
import { IBaseMessage } from './types/messages';

@Module({
  imports: [SubscribersModule],
  providers: [AsyncWorkerService, RedisConnection, RedisPublisher],
  exports: [AsyncWorkerService, RedisPublisher],
})
export class AsyncWorkerModule implements OnModuleInit {
  constructor(
    @Inject()
    private readonly redisConnection: RedisConnection,
    @Inject(DEPENDENCY_INJECTION_PROVIDERS.ASYNC_WORKER_SUBSCRIBERS)
    private readonly subscribers: ISubscriber<IBaseMessage>[],
  ) {}

  async initializeSubscribers(
    subscribers: ISubscriber<IBaseMessage>[],
  ): Promise<void> {
    const redisConsumers: RedisConsumer<IBaseMessage>[] = [];

    for (const subscriber of subscribers) {
      for (let i = 0; i < subscriber.totalConsumers; i++) {
        redisConsumers.push(
          new RedisConsumer<IBaseMessage>(
            this.redisConnection,
            subscriber.getStreamName(),
            subscriber.groupName,
            `${subscriber.consumerName}-${i + 1}`,
            subscriber.onMessage.bind(subscriber),
            subscriber.getGroupConfig(),
          ),
        );
      }
    }

    redisConsumers.forEach((consumer) => consumer.start());
  }

  async onModuleInit(): Promise<void> {
    if (this.subscribers.length > 0) {
      await this.initializeSubscribers(this.subscribers);
    }
  }
}
