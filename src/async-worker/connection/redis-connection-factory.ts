import { RedisConnection } from './redis-connection';
import { ConfigService } from '@nestjs/config';

export class RedisConnectionFactory {
    constructor(private readonly configService: ConfigService) {}

    public create(): RedisConnection {
        return new RedisConnection(this.configService);
    }
}
