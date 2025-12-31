import { Inject, Injectable } from '@nestjs/common';
import { IPublisher } from '../interfaces/publisher.interface';
import { RedisConnection } from '../connection/redis-connection';
import { Logger } from '@nestjs/common';
import { StreamName } from '../types/redis';
import { IBaseMessage } from '../types/messages';

@Injectable()
export class RedisPublisher<TMessage extends IBaseMessage>
  implements IPublisher<TMessage>
{
  private readonly logger: Logger = new Logger(RedisPublisher.name);

  constructor(@Inject() private readonly redisConnection: RedisConnection) {}

  private async xAddWithTimeout(
    streamName: StreamName,
    message: string,
  ): Promise<string | unknown> {
    return await Promise.race([
      this.redisConnection.redis.xAdd(streamName, '*', {
        data: message,
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Redis xAdd command timeout.'));
        }, 10000);
      }),
    ]);
  }

  async publishToStream({
    streamName,
    message,
  }: {
    streamName: StreamName;
    message: TMessage;
  }): Promise<string | unknown> {
    try {
      const serializedMessage = JSON.stringify(message);

      this.logger.log(
        `Publishing message to stream ${streamName}: `,
        serializedMessage,
      );

      const entryId = await this.xAddWithTimeout(streamName, serializedMessage);

      return entryId;
    } catch (error) {
      this.logger.error(
        `Failed to publish to redis stream ${streamName} and message ${message}: `,
        error,
      );

      return null;
    }
  }
}
