import { IsOptional, IsString, MaxLength } from "class-validator"

export class OnboardingGoalDto {
  @IsString()
  integrationId!: string

  @IsString()
  @MaxLength(120)
  role!: string

  @IsString()
  @MaxLength(120)
  audience!: string

  @IsString()
  @MaxLength(160)
  goal!: string

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  websiteUrl?: string
}
