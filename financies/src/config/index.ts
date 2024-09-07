import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  return {
    db: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      dbName: process.env.POSTGRES_DB,
      port: process.env.POSTGRES_PORT,
    },
  };
}
