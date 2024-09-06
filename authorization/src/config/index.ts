import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', '..', 'keys/key.pub'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', '..', 'keys/private.key'),
    'utf-8',
  );

  return {
    jwt: {
      access: {
        privateKey,
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
  };
}
