import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPublisher } from '../interfaces/publisher.interface';
import { RedisConnection } from '../connection/redis-connection';
import { StreamName } from '../types/redis';
import { IBaseMessage } from '../types/messages';
import { RedisClientType } from '@redis/client';

@Injectable()
export class RedisPublisher<TMessage extends IBaseMessage>
    implements IPublisher<TMessage>
{
    private readonly logger: Logger = new Logger(RedisPublisher.name);

    constructor(@Inject() private readonly redisConnection: RedisConnection) {}

    private async xAdd({
        streamName,
        message,
        pipeline,
    }: {
        streamName: StreamName;
        message: string;
        pipeline?: ReturnType<RedisClientType['multi']>;
    }): Promise<string | string[] | unknown> {
        const client = pipeline ?? this.redisConnection.redis;

        return client.xAdd(
            streamName,
            '*',
            {
                data: message,
            },
            {
                TRIM: {
                    strategy: 'MAXLEN',
                    threshold: 100,
                    strategyModifier: '~',
                },
            },
        );
    }

    private async xAddWithTimeout(
        streamName: StreamName,
        message: string,
    ): Promise<string | unknown> {
        return await Promise.race([
            this.xAdd({ streamName, message }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('Redis xAdd command timeout.'));
                }, 10000);
            }),
        ]);
    }

    public async publishToStream({
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

            return await this.xAddWithTimeout(streamName, serializedMessage);
        } catch (error) {
            this.logger.error(
                `Failed to publish to redis stream ${streamName} and message ${message}: `,
                error,
            );

            return null;
        }
    }

    public async batchPublishToStream({
        streamName,
        messages,
    }: {
        streamName: StreamName;
        messages: TMessage[];
    }): Promise<string[] | unknown> {
        try {
            const pipeline = this.redisConnection.redis.multi();

            messages.forEach((message) => {
                const serializedMessage = JSON.stringify(message);

                this.xAdd({ streamName, message: serializedMessage, pipeline });
            });

            return await pipeline.exec();
        } catch (error) {
            this.logger.error(
                `Failed to batch processing publish to redis stream ${streamName}: `,
                error,
            );

            return null;
        }
    }
}
