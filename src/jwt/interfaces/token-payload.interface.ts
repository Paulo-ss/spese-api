export interface ITokenBase {
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  sub: string;
}

export interface IAccessTokenPayload {
  userId: number;
  email: string;
  username: string;
  name: string;
}

export interface IRefreshTokenPayload {
  userId: number;
  tokenId: string;
}

export interface IEmailTokenPayload {
  userId: number;
  tokenId: string;
}
