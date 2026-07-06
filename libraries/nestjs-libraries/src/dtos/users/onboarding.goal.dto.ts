import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsObject,
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
  @IsString()
  @MaxLength(120)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  audience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  goal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Matches(/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i, {
    message: 'Please enter a valid website URL',
  })
  websiteUrl?: string;

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

export class OnboardingPlanSubscribeDto {
  @IsIn(['ESSENTIAL', 'GROWTH'])
  billing!: 'ESSENTIAL' | 'GROWTH';
}

export class OnboardingPlanVerifyDto extends OnboardingCompleteDto {
  @IsIn(['ESSENTIAL', 'GROWTH'])
  billing!: 'ESSENTIAL' | 'GROWTH';

  @IsString()
  paymentId!: string;

  @IsString()
  subscriptionId!: string;

  @IsString()
  signature!: string;
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

export class WeeklyCampaignRecommendationDto {
  @IsString()
  integrationId!: string;

  @IsString()
  role!: string;

  @IsString()
  audience!: string;

  @IsString()
  goal!: string;

  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsString()
  pillar?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedTemplateIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedTemplateIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  missingFields?: string[];

  @IsOptional()
  @IsBoolean()
  avoidRequiredProof?: boolean;

  @IsOptional()
  @IsObject()
  analyticsHints?: Record<string, any>;
}

export class WeeklyCampaignAnswerDto {
  @IsString()
  question!: string;

  @IsArray()
  @IsString({ each: true })
  fills!: string[];

  @IsString()
  answer!: string;
}

export class WeeklyCampaignGenerateTemplateDto {
  @IsString()
  templateId!: string;

  @IsString()
  pillar!: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsNumber()
  slot?: number;

  @IsOptional()
  @IsBoolean()
  analyticsRecommended?: boolean;

  @IsOptional()
  @IsBoolean()
  useContextFromProfileAndWebsite?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyCampaignAnswerDto)
  answers!: WeeklyCampaignAnswerDto[];
}

export class WeeklyCampaignGenerateDto {
  @IsString()
  integrationId!: string;

  @IsString()
  role!: string;

  @IsString()
  audience!: string;

  @IsString()
  goal!: string;

  @IsOptional()
  @IsObject()
  analyticsHints?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyCampaignGenerateTemplateDto)
  templates!: WeeklyCampaignGenerateTemplateDto[];
}

export class LinkedinProfileOptimizerDto {
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
}
