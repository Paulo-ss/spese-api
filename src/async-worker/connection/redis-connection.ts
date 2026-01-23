import {
    Inject,
    Injectable,
    Logger,
    OnModuleDestroy,
    OnModuleInit,
    Scope,
} from '@nestjs/common';
import { IRedisConnection } from '../interfaces/redis-connection.interface';
import { createClient, RedisClientType } from '@redis/client';
import { ConfigService } from '@nestjs/config';
import { IRedisConfig } from 'src/config/interfaces/redis.interface';

@Injectable({ scope: Scope.TRANSIENT })
export class RedisConnection
    implements IRedisConnection, OnModuleInit, OnModuleDestroy
{
    private readonly logger: Logger = new Logger(RedisConnection.name);
    private readonly MAX_RETRY_ATTEMPTS: number = 5;
    private readonly client: RedisClientType;

    constructor(@Inject() private readonly configService: ConfigService) {
        const { host, port, password } =
            this.configService.get<IRedisConfig>('redisConfig');
        const isProduction = this.configService.get<boolean>('isProduction');

        this.client = createClient({
            password: isProduction ? password : undefined,
            socket: {
                host,
                port,
                tls: isProduction,
                reconnectStrategy: (retries, error) => {
                    this.logger.error('Failed to connect to Redis: ', error);
                    if (retries > this.MAX_RETRY_ATTEMPTS) {
                        this.logger.error(
                            'Max retry attempts reached. Redis connection completely failed.',
                        );
                        return false;
                    }

                    this.logger.log(
                        `Reconnecting to Redis... Attempt ${retries}`,
                    );

                    const jitter = Math.floor(Math.random() * 100);
                    const delay = Math.min(Math.pow(2, retries) * 50, 3000);

                    return delay + jitter;
                },
            },
        });
    }

    get redis(): RedisClientType {
        if (!this.client.isOpen) {
            throw new Error('Redis client is not connected');
        }

        return this.client;
    }

    async initRedisConnection(): Promise<RedisClientType> {
        try {
            const connection = await this.client.connect();

            this.logger.log('Redis connection initialized successfully.');

            return connection;
        } catch (error) {
            this.logger.error('Failed to connect to Redis: ', error);

            throw error;
        }
    }

    async onModuleInit() {
        await this.initRedisConnection();
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }
}
