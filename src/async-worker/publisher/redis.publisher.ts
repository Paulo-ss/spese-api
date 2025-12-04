import { Inject, Injectable } from '@nestjs/common';
import { IPublisher } from '../interfaces/publisher.interface';
import { RedisConnection } from '../connection/redis-connection';
import { Logger } from '@nestjs/common';
import { RedisMessage, StreamName } from '../types/messages-definition';

@Injectable()
export class RedisPublisher implements IPublisher {
  private readonly logger: Logger = new Logger(RedisPublisher.name);

  constructor(@Inject() private readonly redisConnection: RedisConnection) {}

  async publishToStream<T extends StreamName>({
    streamName,
    message,
  }: {
    streamName: StreamName;
    message: RedisMessage<T>;
  }): Promise<string> {
    try {
      const serializedMessage = JSON.stringify(message);

      const entryId = await this.redisConnection.redis.xAdd(streamName, '*', {
        data: serializedMessage,
      });

      return entryId;
    } catch (error) {
      this.logger.error(
        `Failed to publish to redis stream ${streamName}:`,
        error,
      );

      return null;
    }
  }
}
