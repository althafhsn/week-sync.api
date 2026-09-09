import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserService } from '../User/user.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateRefreshToken, hashRefreshToken, refreshTokenExpiry } from './refresh-token.util.js';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  jobTitle?: string;
}

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

  async signup(input: SignupInput) {
    const memberRole = await this.prisma.role.findUnique({ where: { name: 'Team Member' } });
    if (!memberRole) {
      throw new NotFoundException('Default role is not configured');
    }
    const pendingStatus = await this.prisma.userStatus.findUnique({ where: { name: 'Pending Approval' } });
    if (!pendingStatus) {
      throw new NotFoundException('User status is not configured');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
      return await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
          roleId: memberRole.id,
          userStatusId: pendingStatus.id,
          jobTitle: input.jobTitle,
          mustChangePassword: false,
          isActive: true,
        },
        select: { id: true, name: true, email: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email is already registered');
      }
      throw error;
    }
  }

  async login(email: string, password: string, include?: string) {
    const user = await this.userService.findByEmail(email, include);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.userStatus?.name === 'Pending Approval') {
      throw new UnauthorizedException('Your account is awaiting manager approval.');
    }
    if (user.userStatus?.name === 'Rejected') {
      throw new UnauthorizedException('Your signup request was not approved. Contact your manager.');
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
        jobTitle: user.jobTitle,
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

    const user = await this.userService.findOne(stored.userId, 'userStatus');
    if (user.userStatus?.name === 'Pending Approval' || user.userStatus?.name === 'Rejected') {
      throw new UnauthorizedException('Your account is no longer able to sign in. Contact your manager.');
    }
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

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
      select: {
        id: true,
        name: true,
        email: true,
        roleId: true,
        jobTitle: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });
  }
}
