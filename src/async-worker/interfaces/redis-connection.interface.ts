import { RedisClientType } from '@redis/client';

export interface IRedisConnection {
  redis: RedisClientType;
  initRedisConnection: (attempt: number) => Promise<RedisClientType>;
}
