import type { AuthTokenPayload } from './guards/jwt-auth.guard';

declare global {
  namespace Express {
    interface Request {
      admin?: AuthTokenPayload;
    }
  }
}
