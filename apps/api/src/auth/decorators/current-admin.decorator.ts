import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthTokenPayload } from '../guards/jwt-auth.guard';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthTokenPayload => {
    const req = ctx.switchToHttp().getRequest<Request>();
    // Garantido pelo JwtAuthGuard, que deve sempre acompanhar este decorator.
    return req.admin!;
  },
);
