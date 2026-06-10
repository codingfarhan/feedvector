import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class OnboardingGoalDto {
  @IsString()
  integrationId!: string;

  @IsString()
  @MaxLength(120)
  role!: string;

  @IsString()
  @MaxLength(120)
  audience!: string;

  @IsString()
  @MaxLength(160)
  goal!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i, {
    message: 'Please enter a valid website URL',
  })
  websiteUrl?: string;
}
