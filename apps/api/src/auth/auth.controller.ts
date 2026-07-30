import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { ACCESS_TOKEN_COOKIE, authCookieOptions } from './constants';
import { CurrentAdmin } from './decorators/current-admin.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthTokenPayload } from './guards/jwt-auth.guard';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, admin } = await this.auth.validateAndLogin(
      dto.username,
      dto.password,
    );
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...authCookieOptions(),
      maxAge: SEVEN_DAYS_MS,
    });
    return { admin };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, authCookieOptions());
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentAdmin() admin: AuthTokenPayload) {
    return this.auth.findById(admin.sub);
  }
}
