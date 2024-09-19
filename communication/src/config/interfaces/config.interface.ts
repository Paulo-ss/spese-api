interface IEmailAuth {
  user: string;
  pass: string;
}

export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: IEmailAuth;
}

export interface IDBConfig {
  user: string;
  password: string;
  host: string;
  dbName: string;
  port: string;
}

export interface IConfig {
  emailConfig: IEmailConfig;
  domain: string;
  db: IDBConfig;
}
