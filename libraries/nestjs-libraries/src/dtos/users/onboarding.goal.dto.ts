import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
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

export class OnboardingWorkspaceSetupDto {
  @IsString()
  integrationId!: string;

  @IsOptional()
  @IsBoolean()
  refreshLinkedin?: boolean;

  @IsOptional()
  @IsBoolean()
  refreshWebsite?: boolean;
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

export class RepurposeSelectedPostDto {
  @IsString()
  @MaxLength(500)
  label!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  date?: string;

  @IsOptional()
  @IsNumber()
  total?: number;
}

export class RepurposePostDto {
  @IsString()
  integrationId!: string;

  @IsIn(['website', 'past_posts', 'profile'])
  sourceType!: 'website' | 'past_posts' | 'profile';

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
  @IsArray()
  @IsString({ each: true })
  pillars?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i, {
    message: 'Please enter a valid website URL',
  })
  websiteUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepurposeSelectedPostDto)
  selectedPosts?: RepurposeSelectedPostDto[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  profileFocus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  additionalContext?: string;

  @IsOptional()
  @IsString()
  @MaxLength(800)
  visualContext?: string;
}
