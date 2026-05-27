import { IsIn, IsOptional, IsString, MaxLength } from "class-validator"

export const onboardingGoals = [
  "schedule_content_consistently",
  "use_mcp_server_with_ai_agents",
  "analyze_social_performance",
  "create_content_with_ai",
  "manage_multiple_clients_or_brands",
  "collaborate_with_team_members",
] as const

export type OnboardingGoal = (typeof onboardingGoals)[number]

export const onboardingPersonas = [
  "founder_indie_hacker",
  "creator_personal_brand",
  "startup_team",
  "marketing_team",
  "agency_freelancer",
  "social_media_manager",
  "other",
] as const

export type OnboardingPersona = (typeof onboardingPersonas)[number]

export class OnboardingGoalDto {
  @IsIn(onboardingGoals)
  goal!: OnboardingGoal

  @IsIn(onboardingPersonas)
  persona!: OnboardingPersona

  @IsOptional()
  @IsString()
  @MaxLength(120)
  personaOther?: string
}
