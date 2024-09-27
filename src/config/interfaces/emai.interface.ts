export interface IEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: IEmailAuth;
}