import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateAndLogin(username: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });
    const valid = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !valid) {
      throw new UnauthorizedException('Usuária ou senha inválidos.');
    }

    const token = await this.jwt.signAsync({
      sub: admin.id,
      username: admin.username,
    });

    return {
      token,
      admin: { id: admin.id, username: admin.username, email: admin.email },
    };
  }

  async findById(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new UnauthorizedException();
    return { id: admin.id, username: admin.username, email: admin.email };
  }
}
