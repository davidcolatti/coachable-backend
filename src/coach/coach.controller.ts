import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { Coach } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { GetCoach } from '../auth/decorator';
import { CoachService } from './coach.service';
import { EditLoggedInCoachDto } from './dto';

@Controller('coach')
export class CoachController {
  constructor(private coachService: CoachService) {}

  @UseGuards(JwtGuard)
  @Get()
  loggedInCoach(@GetCoach() coach: Coach) {
    return coach;
  }

  @UseGuards(JwtGuard)
  @Patch()
  editLoggedInCoach(
    @GetCoach('id') coachId: string,
    @Body() dto: EditLoggedInCoachDto,
  ) {
    return this.coachService.editLoggedInCoach(coachId, dto);
  }

  @Get(':id')
  getCoachById(@Param('id') coachId: string) {
    return this.coachService.getCoachById(coachId);
  }
}
