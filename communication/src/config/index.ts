import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  return {
    domain: process.env.DOMAIN,
    emailConfig: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    db: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      dbName: process.env.POSTGRES_DB,
      port: process.env.POSTGRES_PORT,
    },
  };
}
