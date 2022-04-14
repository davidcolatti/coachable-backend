import { IsOptional, IsString } from 'class-validator';

export class EditLoggedInCoachDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
