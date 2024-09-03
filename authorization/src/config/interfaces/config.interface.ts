import { IDBConfig } from './db.interface';
import { IJwt } from './jwt.interface';

export interface IConfig {
  jwt: IJwt;
  db: IDBConfig;
}
