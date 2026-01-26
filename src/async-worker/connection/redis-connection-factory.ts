import { RedisConnection } from './redis-connection';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisConnectionFactory {
    constructor(private readonly configService: ConfigService) {}

    public create(): RedisConnection {
        const redisConnection = new RedisConnection(this.configService);
        void redisConnection.initRedisConnection();

        return redisConnection;
    }
}
