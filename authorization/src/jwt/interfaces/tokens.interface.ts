import {
  IAccessTokenPayload,
  IEmailTokenPayload,
  IRefreshTokenPayload,
  ITokenBase,
} from './token-payload.interface';

export interface IAccessToken extends IAccessTokenPayload, ITokenBase {}
export interface IRefreshToken extends IRefreshTokenPayload, ITokenBase {}
export interface IEmailToken extends IEmailTokenPayload, ITokenBase {}
