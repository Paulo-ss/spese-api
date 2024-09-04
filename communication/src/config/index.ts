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
  };
}
