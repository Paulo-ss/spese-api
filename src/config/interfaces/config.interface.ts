import { IDBConfig } from './db.interface';
import { IEmailConfig } from './emai.interface';
import { IGoogleoAuth2 } from './google-oauth2.interface';
import { IJwt } from './jwt.interface';
import { IRedisConfig } from './redis.interface';

export interface IConfig {
  jwt: IJwt;
  db: IDBConfig;
  googleoAuth2: IGoogleoAuth2;
  emailConfig: IEmailConfig;
  redisConfig: IRedisConfig;
  domain: string;
  isProduction: boolean;
  apiPort: number;
}
