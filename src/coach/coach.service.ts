import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditLoggedInCoachDto } from './dto';

@Injectable()
export class CoachService {
  constructor(private prisma: PrismaService) {}

  async getCoachById(coachId: string) {
    const coach = await this.prisma.coach.findUnique({
      where: {
        id: coachId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!coach) {
      throw new HttpException('Coach Not Found', HttpStatus.NOT_FOUND);
    }

    return coach;
  }

  async editLoggedInCoach(coachId: string, dto: EditLoggedInCoachDto) {
    const coach = await this.prisma.coach.update({
      where: {
        id: coachId,
      },
      data: {
        ...dto,
      },
    });

    delete coach.hash;
    return coach;
  }
}
