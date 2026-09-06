import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../User/user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiry } from './refresh-token.util.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async issueRefreshToken(userId: string) {
    const refreshToken = generateRefreshToken();
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshTokenExpiry(),
      },
    });
    return refreshToken;
  }

  async login(email: string, password: string, include?: string) {
    const user = await this.userService.findByEmail(email, include);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User account is locked or inactive. Please contact support.');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      refreshToken: await this.issueRefreshToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        mustChangePassword: user.mustChangePassword,
        ...('role' in user && user.role ? { role: user.role } : {}),
      }
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userService.findOne(stored.userId);
    if (!user.isActive) {
      throw new UnauthorizedException('User account is locked or inactive. Please contact support.');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      refreshToken: await this.issueRefreshToken(user.id),
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
