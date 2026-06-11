import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class OnboardingSuggestionDto {
  @IsString()
  integrationId!: string;

  @IsString()
  role!: string;

  @IsString()
  audience!: string;

  @IsString()
  goal!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i, {
    message: 'Please enter a valid website URL',
  })
  websiteUrl?: string;
}

export class OnboardingReviewedSuggestionDto {
  @IsString()
  templateId!: string;

  @IsString()
  pillar!: string;

  @IsString()
  content!: string;

  @IsIn(['ignored', 'draft', 'schedule', 'now'])
  action!: 'ignored' | 'draft' | 'schedule' | 'now';
}

export class OnboardingCompleteDto {
  @IsString()
  integrationId!: string;

  @IsString()
  role!: string;

  @IsString()
  audience!: string;

  @IsString()
  goal!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingReviewedSuggestionDto)
  reviewedSuggestions!: OnboardingReviewedSuggestionDto[];
}
