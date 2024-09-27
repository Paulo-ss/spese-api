import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', 'keys/key.pub'),
    'utf-8',
  );

  return {
    jwt: {
      access: {
        privateKey: process.env.JWT_PRIVATE_KEY,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
    },
    db: {
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      dbName: process.env.POSTGRES_DB,
      port: process.env.POSTGRES_PORT,
    },
    googleoAuth2: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    },
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
    isProduction: JSON.parse(process.env.IS_PRODUCTION),
  };
}
