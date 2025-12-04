import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ISubscriber } from './interfaces/subscriber.interface';
import { RedisConsumer } from './consumer/redis.consumer';
import { RedisConnection } from './connection/redis-connection';

@Injectable()
export class AsyncWorkerService implements OnModuleDestroy {
  private readonly logger = new Logger(AsyncWorkerService.name);

  constructor(@Inject() private readonly redisConnection: RedisConnection) {}

  async initializeSubscribers(subscribers: ISubscriber[]): Promise<void> {
    const redisConsumers = subscribers.map((subscriber) => {
      return new RedisConsumer(
        this.redisConnection,
        subscriber.getStreamName(),
        subscriber.groupName,
        subscriber.consumerName,
        subscriber.onMessage,
        subscriber.getGroupConfig(),
      );
    });

    await Promise.all(redisConsumers.map((consumer) => consumer.start()));
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing Redis connections...');
  }
}
