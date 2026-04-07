import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.users.findFirst({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email is already in use!');
    }

    const username = dto.email.split('@')[0].toLowerCase();
    const slug = dto.fullname
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return this.prisma.users.create({
      data: {
        fullname: dto.fullname,
        username,
        slug,
        email: dto.email,
        phone: dto.phone,
        roles: {
          connect: {
            id: dto.roleId,
          },
        },
      },
      include: {
        roles: true,
      },
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.users.findFirst({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const storedPassword = (user as { password?: string }).password;
    if (!storedPassword) {
      throw new UnauthorizedException('This account is not configured with a password');
    }

    const isMatch = await bcrypt.compare(dto.password, storedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const primaryRole = user.roles[0]?.name ?? 'USER';
    const payload = { sub: user.id, email: user.email, role: primaryRole };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: primaryRole,
      },
    };
  }
}
