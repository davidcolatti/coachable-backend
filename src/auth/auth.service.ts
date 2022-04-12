import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const coach = await this.prisma.coach.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      return this.signToken(coach.id, coach.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException('Credentials Taken', HttpStatus.FORBIDDEN);
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const coach = await this.prisma.coach.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!coach) {
      throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN);
    }

    const passwordMatches = await argon.verify(coach.hash, dto.password);

    if (!passwordMatches) {
      throw new HttpException('Invalid Credentials', HttpStatus.FORBIDDEN);
    }

    return this.signToken(coach.id, coach.email);
  }

  async signToken(
    coachId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: coachId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
