import type { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';

export function authCookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}
