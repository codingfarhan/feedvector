// linkedinPostTemplates.ts

export type Role = "Founder" | "Agency owner" | "Consultant" | "Freelancer" | "Coach" | "Creator" | "Marketer" | "Job seeker / career professional"

export type Goal =
  | "Get inbound leads"
  | "Build authority"
  | "Grow my audience"
  | "Promote my product/service"
  | "Get job opportunities"
  | "Build network"
  | "Recruit / hire talent"

export const GOAL_ELIGIBILITY_BY_ROLE: Record<Role, Goal[]> = {
  Founder: ["Get inbound leads", "Build authority", "Grow my audience", "Promote my product/service", "Build network", "Recruit / hire talent"],
  "Agency owner": [
    "Get inbound leads",
    "Build authority",
    "Grow my audience",
    "Promote my product/service",
    "Build network",
    "Recruit / hire talent",
  ],
  Consultant: ["Get inbound leads", "Build authority", "Grow my audience", "Promote my product/service", "Build network"],
  Freelancer: ["Get inbound leads", "Build authority", "Grow my audience", "Promote my product/service", "Get job opportunities", "Build network"],
  Coach: ["Get inbound leads", "Build authority", "Grow my audience", "Promote my product/service", "Build network"],
  Creator: ["Build authority", "Grow my audience", "Promote my product/service", "Build network"],
  Marketer: ["Get inbound leads", "Build authority", "Grow my audience", "Promote my product/service", "Get job opportunities", "Build network"],
  "Job seeker / career professional": ["Build authority", "Grow my audience", "Get job opportunities", "Build network"],
}

export type PillarCategory =
  | "Point of view"
  | "Problem education"
  | "Mistakes and misconceptions"
  | "Process / how-I-work"
  | "Proof / case study"
  | "Personal story"
  | "Behind the scenes"
  | "Market / industry observation"
  | "Product / service education"
  | "Objection handling"
  | "Audience belief shift"
  | "Community / network conversation"
  | "Values / philosophy"
  | "Hiring / culture"
  | "Career / credibility proof"

export type CTAStyle =
  | "soft_lead"
  | "dm_problem"
  | "diagnostic"
  | "authority_reframe"
  | "belief_statement"
  | "industry_prompt"
  | "conversation"
  | "agree_disagree"
  | "relatable"
  | "specific_peer_question"
  | "example_request"
  | "operator_invite"
  | "offer_bridge"
  | "use_case"
  | "problem_solution"
  | "fit_check"
  | "resource_offer"
  | "demo_invite"
  | "product_walkthrough"
  | "career_signal"
  | "work_style"
  | "open_to_conversation"
  | "peer_question"
  | "shared_learning"
  | "collaboration"
  | "hiring_signal"
  | "culture_invite"
  | "role_invite"
  | "apply_invite"
  | "talent_network"

export type ProofRequirement = "none" | "optional" | "recommended" | "required"

export type PostArchetype =
  | "pain_diagnosis"
  | "checklist"
  | "contrarian_take"
  | "mini_case_study"
  | "before_after"
  | "mistake_lesson"
  | "process_breakdown"
  | "myth_buster"
  | "impossible_vs_possible"
  | "long_form_promotion"
  | "deeper_desire_contrast"
  | "transformation_story"
  | "villain_story"
  | "problem_solution"
  | "dont_do_this_do_this"
  | "launch_story"
  | "failure_to_recovery"
  | "beginner_to_expert"
  | "rule_or_wisdom"
  | "consistency_journey"
  | "unexpected_connection"
  | "no_secret_daily_action"
  | "expectation_reset"
  | "goal_to_daily_system"
  | "misconception_to_framework"
  | "research_led_explanation"
  | "brand_case_study"

export type HookStyle =
  | "question_led"
  | "contrarian_statement"
  | "problem_diagnosis"
  | "process_breakdown"
  | "before_after"
  | "personal_observation"
  | "direct_statement"
  | "story_led"
  | "result_led"
  | "list_led"
  | "data_led"
  | "mistake_confession"
  | "prediction_trend"
  | "borrowed_insight"

export type PostIntent =
  | "educate"
  | "build_authority"
  | "share_proof"
  | "start_conversation"
  | "build_trust"
  | "promote_offer"
  | "recruit"
  | "nurture"

export type TensionPattern =
  | "expectation_vs_reality"
  | "surface_vs_root"
  | "before_vs_after"
  | "common_advice_vs_better_advice"
  | "goal_vs_daily_action"
  | "success_vs_hidden_cost"
  | "failure_vs_recovery"
  | "old_belief_vs_new_belief"
  | "visible_result_vs_invisible_work"
  | "problem_vs_solution"
  | "status_quo_vs_change"
  | "none"

export type CTARequirement = "none" | "optional" | "recommended" | "required"

export interface TargetLength {
  min: number
  ideal: number
  max: number
}

export type TemplateBlockType = "hook" | "context" | "tension" | "example" | "proof" | "list" | "reframe" | "lesson" | "cta"

export interface TemplateBlock {
  id: string
  type: TemplateBlockType
  required: boolean
}

export type RoleGoalFit = "native" | "usable" | "avoid"

export type CTAAction = "comment" | "dm" | "connect" | "follow" | "apply" | "view_product" | "request_resource" | "share_example" | "reflect"

export type CTAIntensity = "soft" | "medium" | "direct"

export interface ClarifyingQuestion {
  question: string
  fills: string[]
}

export interface PostTemplate {
  id: string
  name: string
  archetype: PostArchetype
  variant: string
  bestForRoles: Role[]
  bestForGoals: Goal[]
  roleGoalFit?: Partial<Record<Role, Partial<Record<Goal, RoleGoalFit>>>>
  bestForPillars: PillarCategory[]
  hookStyles: HookStyle[]
  intents: PostIntent[]
  tensionPattern: TensionPattern
  template: string
  variables: string[]
  clarifyingQuestions: ClarifyingQuestion[]
  blocks: TemplateBlock[]
  targetLength: TargetLength
  generationInstructions: string[]
  ctaRequirement: CTARequirement
  ctaStyles: CTAStyle[]
  proofRequirement: ProofRequirement
  antiPatterns: string[]
}

export interface CTAOption {
  id: CTAStyle
  goals: Goal[]
  roles?: Role[]
  action: CTAAction
  intensity: CTAIntensity
  text: string
}

export const CTA_LIBRARY: CTAOption[] = [
  {
    id: "soft_lead",
    goals: ["Get inbound leads"],
    action: "dm",
    intensity: "soft",
    text: "If this is showing up in your world, send me a note with what you’re trying to untangle.",
  },
  {
    id: "dm_problem",
    goals: ["Get inbound leads"],
    action: "dm",
    intensity: "direct",
    text: "DM me “problem” if you want help finding where this is actually breaking down.",
  },
  {
    id: "diagnostic",
    goals: ["Get inbound leads", "Build authority"],
    action: "reflect",
    intensity: "medium",
    text: "Usually, the first step is not doing more. It’s diagnosing the right problem.",
  },
  {
    id: "authority_reframe",
    goals: ["Build authority"],
    action: "comment",
    intensity: "soft",
    text: "That’s the shift I think more people in this space need to talk about.",
  },
  {
    id: "belief_statement",
    goals: ["Build authority"],
    action: "reflect",
    intensity: "soft",
    text: "The people who understand this earlier tend to make better decisions later.",
  },
  {
    id: "industry_prompt",
    goals: ["Build authority", "Build network"],
    action: "comment",
    intensity: "medium",
    text: "If you work in this space, I’d be curious what you’re seeing from your side.",
  },
  {
    id: "conversation",
    goals: ["Grow my audience", "Build network"],
    action: "comment",
    intensity: "soft",
    text: "Curious if others have noticed this too.",
  },
  {
    id: "agree_disagree",
    goals: ["Grow my audience"],
    action: "comment",
    intensity: "medium",
    text: "Which of these do you agree or disagree with?",
  },
  {
    id: "relatable",
    goals: ["Grow my audience"],
    action: "reflect",
    intensity: "soft",
    text: "I don’t think I’m the only one who has had to learn this the hard way.",
  },
  {
    id: "specific_peer_question",
    goals: ["Get inbound leads", "Build authority", "Build network"],
    action: "comment",
    intensity: "medium",
    text: "If you’ve run into this, what was the first signal that made the problem obvious?",
  },
  {
    id: "example_request",
    goals: ["Grow my audience", "Build network"],
    action: "share_example",
    intensity: "medium",
    text: "If you’ve seen a strong example of this, share it. I’m collecting better references.",
  },
  {
    id: "operator_invite",
    goals: ["Build authority", "Build network"],
    roles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Marketer"],
    action: "connect",
    intensity: "medium",
    text: "If you’re actively working through this as an operator, I’d be glad to connect.",
  },
  {
    id: "offer_bridge",
    goals: ["Promote my product/service"],
    action: "view_product",
    intensity: "medium",
    text: "That’s exactly why we built this around [specific problem], not just [surface feature].",
  },
  {
    id: "use_case",
    goals: ["Promote my product/service"],
    action: "view_product",
    intensity: "medium",
    text: "This is one of the situations where [product/service] is designed to help.",
  },
  {
    id: "problem_solution",
    goals: ["Promote my product/service", "Get inbound leads"],
    action: "dm",
    intensity: "medium",
    text: "If [problem] is showing up repeatedly, the solution usually starts with [approach].",
  },
  {
    id: "fit_check",
    goals: ["Promote my product/service", "Get inbound leads"],
    action: "dm",
    intensity: "direct",
    text: "If you want to pressure-test whether this is the right fit, send me the situation and I’ll point you in the right direction.",
  },
  {
    id: "resource_offer",
    goals: ["Get inbound leads", "Build authority", "Grow my audience"],
    action: "request_resource",
    intensity: "medium",
    text: "Comment “resource” if you want the checklist I use to think through this.",
  },
  {
    id: "demo_invite",
    goals: ["Promote my product/service"],
    roles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Marketer"],
    action: "view_product",
    intensity: "direct",
    text: "If this is a problem you’re trying to solve now, book a walkthrough and we’ll show how it works in practice.",
  },
  {
    id: "product_walkthrough",
    goals: ["Promote my product/service"],
    action: "view_product",
    intensity: "medium",
    text: "I can share a quick walkthrough of how this works if you want to see the mechanics.",
  },
  {
    id: "career_signal",
    goals: ["Get job opportunities"],
    action: "connect",
    intensity: "medium",
    text: "This is the kind of work I’d love to do more of.",
  },
  {
    id: "work_style",
    goals: ["Get job opportunities"],
    action: "reflect",
    intensity: "soft",
    text: "It’s also the kind of problem where I tend to do my best work.",
  },
  {
    id: "open_to_conversation",
    goals: ["Get job opportunities", "Build network"],
    action: "connect",
    intensity: "medium",
    text: "If you’re building around this kind of work, I’d be glad to connect.",
  },
  {
    id: "peer_question",
    goals: ["Build network"],
    action: "comment",
    intensity: "soft",
    text: "Would love to hear how others are thinking about this.",
  },
  {
    id: "shared_learning",
    goals: ["Build network"],
    action: "comment",
    intensity: "soft",
    text: "I’m still shaping my view on this, so I’d value other perspectives.",
  },
  {
    id: "collaboration",
    goals: ["Build network"],
    action: "connect",
    intensity: "medium",
    text: "Always interested in meeting people working on this from a different angle.",
  },
  {
    id: "hiring_signal",
    goals: ["Recruit / hire talent"],
    action: "apply",
    intensity: "direct",
    text: "If that sounds like the kind of environment where you’d do your best work, we should talk.",
  },
  {
    id: "culture_invite",
    goals: ["Recruit / hire talent"],
    action: "follow",
    intensity: "soft",
    text: "This is the kind of culture we’re trying to build, one decision at a time.",
  },
  {
    id: "role_invite",
    goals: ["Recruit / hire talent"],
    action: "follow",
    intensity: "medium",
    text: "If this way of working resonates, keep an eye on what we’re building.",
  },
  {
    id: "apply_invite",
    goals: ["Recruit / hire talent"],
    action: "apply",
    intensity: "direct",
    text: "If this sounds like the kind of role where you would do strong work, apply or send me a note.",
  },
  {
    id: "talent_network",
    goals: ["Recruit / hire talent", "Build network"],
    action: "connect",
    intensity: "medium",
    text: "If this describes how you like to work, connect with me. I’d like to know more people with this mindset.",
  },
]

const DEFAULT_ANTI_PATTERNS = [
  "Do not add a generic motivational intro.",
  "Do not use phrases like 'game-changer', 'unlock success', or 'in today’s fast-paced world'.",
  "Do not invent metrics, clients, revenue, company names, or results.",
  "Do not add hashtags unless explicitly requested.",
  "Do not add filler paragraphs outside the template structure.",
  "Do not make the CTA more salesy than the selected goal allows.",
  "Do not use stock LinkedIn closing phrases.",
]

type LegacyPostArchetype =
  | PostArchetype
  | "Pain Diagnosis"
  | "Checklist"
  | "Contrarian Take"
  | "Mini Case Study"
  | "Before / After"
  | "Mistake Lesson"
  | "Process Breakdown"
  | "Myth-Buster"
  | "Strong Opinion List"
  | "Objection Handling"
  | "Use Case Story"
  | "Honest Question"
  | "Hiring Philosophy"
  | "Career Proof"
  | "Trend Reframe"
  | "Customer / Client Pattern"
  | "Origin Story"
  | "Lessons Learned"

type PostTemplateInput = Omit<
  PostTemplate,
  "archetype" | "hookStyles" | "intents" | "tensionPattern" | "blocks" | "targetLength" | "generationInstructions" | "ctaRequirement"
> & {
  archetype: LegacyPostArchetype
  hookStyles?: HookStyle[]
  intents?: PostIntent[]
  tensionPattern?: TensionPattern
  blocks?: TemplateBlock[]
  targetLength?: TargetLength
  generationInstructions?: string[]
  ctaRequirement?: CTARequirement
}

const archetypeMap: Record<LegacyPostArchetype, PostArchetype> = {
  pain_diagnosis: "pain_diagnosis",
  checklist: "checklist",
  contrarian_take: "contrarian_take",
  mini_case_study: "mini_case_study",
  before_after: "before_after",
  mistake_lesson: "mistake_lesson",
  process_breakdown: "process_breakdown",
  myth_buster: "myth_buster",
  impossible_vs_possible: "impossible_vs_possible",
  long_form_promotion: "long_form_promotion",
  deeper_desire_contrast: "deeper_desire_contrast",
  transformation_story: "transformation_story",
  villain_story: "villain_story",
  problem_solution: "problem_solution",
  dont_do_this_do_this: "dont_do_this_do_this",
  launch_story: "launch_story",
  failure_to_recovery: "failure_to_recovery",
  beginner_to_expert: "beginner_to_expert",
  rule_or_wisdom: "rule_or_wisdom",
  consistency_journey: "consistency_journey",
  unexpected_connection: "unexpected_connection",
  no_secret_daily_action: "no_secret_daily_action",
  expectation_reset: "expectation_reset",
  goal_to_daily_system: "goal_to_daily_system",
  misconception_to_framework: "misconception_to_framework",
  research_led_explanation: "research_led_explanation",
  brand_case_study: "brand_case_study",
  "Pain Diagnosis": "pain_diagnosis",
  Checklist: "checklist",
  "Contrarian Take": "contrarian_take",
  "Mini Case Study": "mini_case_study",
  "Before / After": "before_after",
  "Mistake Lesson": "mistake_lesson",
  "Process Breakdown": "process_breakdown",
  "Myth-Buster": "myth_buster",
  "Strong Opinion List": "contrarian_take",
  "Objection Handling": "expectation_reset",
  "Use Case Story": "problem_solution",
  "Honest Question": "unexpected_connection",
  "Hiring Philosophy": "rule_or_wisdom",
  "Career Proof": "beginner_to_expert",
  "Trend Reframe": "research_led_explanation",
  "Customer / Client Pattern": "brand_case_study",
  "Origin Story": "transformation_story",
  "Lessons Learned": "rule_or_wisdom",
}

const targetLengthByArchetype: Record<PostArchetype, TargetLength> = {
  pain_diagnosis: { min: 500, ideal: 800, max: 1200 },
  checklist: { min: 500, ideal: 800, max: 1200 },
  contrarian_take: { min: 400, ideal: 700, max: 1000 },
  mini_case_study: { min: 700, ideal: 1100, max: 1600 },
  before_after: { min: 700, ideal: 1100, max: 1600 },
  mistake_lesson: { min: 700, ideal: 1200, max: 1800 },
  process_breakdown: { min: 600, ideal: 900, max: 1400 },
  myth_buster: { min: 500, ideal: 800, max: 1200 },
  impossible_vs_possible: { min: 500, ideal: 800, max: 1200 },
  long_form_promotion: { min: 600, ideal: 1000, max: 1500 },
  deeper_desire_contrast: { min: 400, ideal: 700, max: 1000 },
  transformation_story: { min: 700, ideal: 1200, max: 1800 },
  villain_story: { min: 700, ideal: 1200, max: 1800 },
  problem_solution: { min: 600, ideal: 900, max: 1400 },
  dont_do_this_do_this: { min: 500, ideal: 800, max: 1200 },
  launch_story: { min: 600, ideal: 1000, max: 1500 },
  failure_to_recovery: { min: 700, ideal: 1200, max: 1800 },
  beginner_to_expert: { min: 600, ideal: 900, max: 1400 },
  rule_or_wisdom: { min: 500, ideal: 800, max: 1200 },
  consistency_journey: { min: 700, ideal: 1200, max: 1800 },
  unexpected_connection: { min: 700, ideal: 1200, max: 1800 },
  no_secret_daily_action: { min: 600, ideal: 900, max: 1400 },
  expectation_reset: { min: 500, ideal: 800, max: 1200 },
  goal_to_daily_system: { min: 600, ideal: 900, max: 1400 },
  misconception_to_framework: { min: 600, ideal: 900, max: 1400 },
  research_led_explanation: { min: 800, ideal: 1300, max: 1800 },
  brand_case_study: { min: 700, ideal: 1100, max: 1600 },
}

const hookStylesByArchetype: Record<PostArchetype, HookStyle[]> = {
  pain_diagnosis: ["problem_diagnosis", "direct_statement"],
  checklist: ["list_led", "direct_statement"],
  contrarian_take: ["contrarian_statement", "direct_statement"],
  mini_case_study: ["story_led", "result_led"],
  before_after: ["before_after", "result_led"],
  mistake_lesson: ["mistake_confession", "personal_observation"],
  process_breakdown: ["process_breakdown", "direct_statement"],
  myth_buster: ["contrarian_statement", "problem_diagnosis"],
  impossible_vs_possible: ["contrarian_statement", "direct_statement"],
  long_form_promotion: ["borrowed_insight", "list_led"],
  deeper_desire_contrast: ["personal_observation", "question_led"],
  transformation_story: ["story_led", "before_after"],
  villain_story: ["story_led", "personal_observation"],
  problem_solution: ["problem_diagnosis", "process_breakdown"],
  dont_do_this_do_this: ["list_led", "process_breakdown"],
  launch_story: ["story_led", "direct_statement"],
  failure_to_recovery: ["story_led", "mistake_confession"],
  beginner_to_expert: ["process_breakdown", "list_led"],
  rule_or_wisdom: ["direct_statement", "personal_observation"],
  consistency_journey: ["story_led", "personal_observation"],
  unexpected_connection: ["story_led", "personal_observation"],
  no_secret_daily_action: ["direct_statement", "process_breakdown"],
  expectation_reset: ["contrarian_statement", "problem_diagnosis"],
  goal_to_daily_system: ["process_breakdown", "direct_statement"],
  misconception_to_framework: ["problem_diagnosis", "process_breakdown"],
  research_led_explanation: ["data_led", "question_led"],
  brand_case_study: ["result_led", "story_led"],
}

const tensionByArchetype: Record<PostArchetype, TensionPattern> = {
  pain_diagnosis: "surface_vs_root",
  checklist: "problem_vs_solution",
  contrarian_take: "common_advice_vs_better_advice",
  mini_case_study: "visible_result_vs_invisible_work",
  before_after: "before_vs_after",
  mistake_lesson: "old_belief_vs_new_belief",
  process_breakdown: "problem_vs_solution",
  myth_buster: "common_advice_vs_better_advice",
  impossible_vs_possible: "expectation_vs_reality",
  long_form_promotion: "none",
  deeper_desire_contrast: "expectation_vs_reality",
  transformation_story: "before_vs_after",
  villain_story: "status_quo_vs_change",
  problem_solution: "problem_vs_solution",
  dont_do_this_do_this: "common_advice_vs_better_advice",
  launch_story: "status_quo_vs_change",
  failure_to_recovery: "failure_vs_recovery",
  beginner_to_expert: "before_vs_after",
  rule_or_wisdom: "none",
  consistency_journey: "goal_vs_daily_action",
  unexpected_connection: "none",
  no_secret_daily_action: "goal_vs_daily_action",
  expectation_reset: "expectation_vs_reality",
  goal_to_daily_system: "goal_vs_daily_action",
  misconception_to_framework: "common_advice_vs_better_advice",
  research_led_explanation: "expectation_vs_reality",
  brand_case_study: "status_quo_vs_change",
}

const defaultBlocks = (ctaRequirement: CTARequirement): TemplateBlock[] => [
  { id: "hook", type: "hook", required: true },
  { id: "context", type: "context", required: true },
  { id: "tension", type: "tension", required: false },
  { id: "example", type: "example", required: false },
  { id: "lesson", type: "lesson", required: true },
  { id: "cta", type: "cta", required: ctaRequirement === "required" },
]

const deriveIntents = (template: PostTemplateInput, archetype: PostArchetype): PostIntent[] => {
  const intents = new Set<PostIntent>()

  if (["Product / service education", "Objection handling"].some((pillar) => template.bestForPillars.includes(pillar as PillarCategory))) {
    intents.add("promote_offer")
  }

  if (["Proof / case study", "Career / credibility proof"].some((pillar) => template.bestForPillars.includes(pillar as PillarCategory))) {
    intents.add("share_proof")
    intents.add("build_trust")
  }

  if (["Community / network conversation"].some((pillar) => template.bestForPillars.includes(pillar as PillarCategory))) {
    intents.add("start_conversation")
  }

  if (template.bestForPillars.includes("Hiring / culture")) {
    intents.add("recruit")
  }

  if (["contrarian_take", "myth_buster", "research_led_explanation", "rule_or_wisdom"].includes(archetype)) {
    intents.add("build_authority")
  }

  intents.add("educate")

  return [...intents].slice(0, 3)
}

const deriveCTARequirement = (template: PostTemplateInput, archetype: PostArchetype): CTARequirement => {
  if (template.ctaRequirement) {
    return template.ctaRequirement
  }

  if (
    ["launch_story"].includes(archetype) ||
    template.bestForPillars.includes("Product / service education") ||
    template.bestForPillars.includes("Hiring / culture")
  ) {
    return "required"
  }

  if (
    ["process_breakdown", "pain_diagnosis", "mini_case_study", "brand_case_study"].includes(archetype) ||
    template.bestForPillars.some((pillar) => ["Problem education", "Proof / case study", "Process / how-I-work"].includes(pillar))
  ) {
    return "recommended"
  }

  return "optional"
}

const normalizeCTAToken = (template: string, ctaRequirement: CTARequirement) => {
  if (ctaRequirement === "optional") {
    return template.replace(/\[cta\]/g, "[optional cta]")
  }

  if (ctaRequirement === "none") {
    return template
      .replace(/\n?\[cta\]\n?/g, "\n")
      .replace(/\n?\[optional cta\]\n?/g, "\n")
      .trim()
  }

  return template.replace(/\[optional cta\]/g, ctaRequirement === "required" ? "[required cta]" : "[cta]")
}

const removeCannedClosings = (template: string) =>
  template
    .replace(/That’s the shift\./g, "[concise reframe]")
    .replace(/Start there\./g, "[practical takeaway]")
    .replace(/That changes the whole conversation\./g, "[closing observation]")
    .replace(/Simple lesson\.\n\nExpensive to ignore\./g, "[grounded lesson]")
    .replace(/That’s the part people usually miss\./g, "[closing observation]")

const defaultGenerationInstructions = (archetype: PostArchetype): string[] => {
  const base = [
    "Use the template as structure, not as exact copy.",
    "Write the ending in the user's natural voice.",
    "Do not use stock LinkedIn closing phrases.",
    "Do not repeat the hook in the conclusion.",
    "Keep paragraphs short.",
  ]

  if (["mini_case_study", "brand_case_study", "transformation_story", "failure_to_recovery"].includes(archetype)) {
    return [...base, "Use proof only when it is present in the supplied context.", "Do not invent results or numbers."]
  }

  if (["process_breakdown", "goal_to_daily_system", "beginner_to_expert"].includes(archetype)) {
    return [...base, "Make the sequence practical and easy to follow."]
  }

  return base
}

const t = (template: PostTemplateInput): PostTemplate => {
  const archetype = archetypeMap[template.archetype]
  const ctaRequirement = deriveCTARequirement(template, archetype)

  return {
    ...template,
    archetype,
    hookStyles: template.hookStyles || hookStylesByArchetype[archetype],
    intents: template.intents || deriveIntents(template, archetype),
    tensionPattern: template.tensionPattern || tensionByArchetype[archetype],
    template: normalizeCTAToken(removeCannedClosings(template.template), ctaRequirement),
    variables: template.variables.filter((variable) => ctaRequirement !== "optional" || variable !== "cta"),
    blocks: template.blocks || defaultBlocks(ctaRequirement),
    targetLength: template.targetLength || targetLengthByArchetype[archetype],
    generationInstructions: template.generationInstructions || defaultGenerationInstructions(archetype),
    ctaRequirement,
    antiPatterns: [...DEFAULT_ANTI_PATTERNS, ...template.antiPatterns],
  }
}

const ALL_ROLES: Role[] = ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer", "Job seeker / career professional"]

const BUSINESS_ROLES: Role[] = ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"]

const ARCHETYPE_PILLARS: Record<string, PillarCategory[]> = {
  impossible_vs_possible: ["Audience belief shift", "Point of view"],
  long_form_promotion: ["Market / industry observation"],
  deeper_desire_contrast: ["Point of view", "Audience belief shift"],
  transformation_story: ["Personal story", "Career / credibility proof", "Values / philosophy"],
  villain_story: ["Personal story", "Values / philosophy"],
  problem_solution: ["Problem education", "Product / service education", "Process / how-I-work"],
  dont_do_this_do_this: ["Mistakes and misconceptions", "Process / how-I-work", "Problem education"],
  launch_story: ["Product / service education", "Behind the scenes"],
  failure_to_recovery: ["Personal story", "Career / credibility proof", "Values / philosophy"],
  beginner_to_expert: ["Process / how-I-work", "Career / credibility proof"],
  common_mistake: ["Mistakes and misconceptions", "Audience belief shift"],
  rule_or_wisdom: ["Values / philosophy"],
  consistency_journey: ["Personal story", "Career / credibility proof"],
  unexpected_connection: ["Personal story", "Community / network conversation"],
  no_secret_daily_action: ["Process / how-I-work", "Audience belief shift"],
  expectation_reset: ["Objection handling", "Audience belief shift"],
  goal_to_daily_system: ["Process / how-I-work", "Audience belief shift"],
  misconception_to_framework: ["Audience belief shift", "Problem education", "Process / how-I-work"],
  research_led_explanation: ["Market / industry observation", "Problem education", "Audience belief shift"],
  brand_case_study: ["Proof / case study"],
}

const IMPORTED_LINKEDIN_POST_TEMPLATES: PostTemplate[] = [
  t({
    id: "impossible_vs_possible",
    name: "Impossible vs Possible",
    archetype: "impossible_vs_possible",
    variant: "Short-term expectation reset",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Build network", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.impossible_vs_possible,
    template: `[common goal] is not realistic in [short timeframe].
  
  What is realistic:
  
  - [specific action 1]
  - [specific action 2]
  - [specific action 3]
  
  Each action moves you toward [specific outcome].
  
  In [longer timeframe], that can create:
  
  - [desirable outcome 1]
  - [desirable outcome 2]
  - [desirable outcome 3]
  
  Stop measuring today by [large outcome].
  
  Measure it by [small repeatable action].
  
  [optional cta]`,
    variables: [
      "common goal",
      "short timeframe",
      "specific action 1",
      "specific action 2",
      "specific action 3",
      "specific outcome",
      "longer timeframe",
      "desirable outcome 1",
      "desirable outcome 2",
      "desirable outcome 3",
      "large outcome",
      "small repeatable action",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What major result does your audience want, and what short timeframe makes that expectation unrealistic?",
        fills: ["common goal", "short timeframe"],
      },
      {
        question: "What three specific actions can they realistically take during that timeframe?",
        fills: ["specific action 1", "specific action 2", "specific action 3"],
      },
      {
        question: "What meaningful intermediate outcome do those actions move them toward?",
        fills: ["specific outcome"],
      },
      {
        question: "What longer timeframe would make substantial progress more realistic?",
        fills: ["longer timeframe"],
      },
      {
        question: "What three realistic outcomes could consistent action create over that longer timeframe?",
        fills: ["desirable outcome 1", "desirable outcome 2", "desirable outcome 3"],
      },
      {
        question: "What large outcome should they stop using to judge daily progress?",
        fills: ["large outcome"],
      },
      {
        question: "What small repeatable action should they measure instead?",
        fills: ["small repeatable action"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["conversation", "authority_reframe", "diagnostic"],
    ctaRequirement: "optional",
    proofRequirement: "none",
    antiPatterns: [
      "Do not declare a goal unrealistic without considering the audience's starting point, resources, or experience.",
      "Do not use arbitrary timeframes solely to create contrast.",
      "Do not promise that completing the actions guarantees the longer-term outcomes.",
      "Do not make the short-term actions vague or impossible to measure.",
      "Do not dismiss ambition or imply that large goals are inherently unrealistic.",
      "Do not invent timelines, milestones, or expected outcomes.",
      "Do not make all three actions versions of the same behavior.",
    ],
  }),

  t({
    id: "long_form_promotion",
    name: "Long-Form Promotion",
    archetype: "long_form_promotion",
    variant: "Useful resource breakdown",
    bestForRoles: BUSINESS_ROLES,
    bestForGoals: ["Promote my product/service", "Build authority", "Build network"],
    bestForPillars: ARCHETYPE_PILLARS.long_form_promotion,
    template: `[person or source] shared a useful idea about [topic].
  
  Here are the parts worth paying attention to:
  
  1. [insight 1]
  2. [insight 2]
  3. [insight 3]
  4. [insight 4]
  
  The common thread:
  
  [summary lesson]
  
  [optional resource link]
  
  [optional cta]`,
    variables: [
      "person or source",
      "topic",
      "insight 1",
      "insight 2",
      "insight 3",
      "insight 4",
      "summary lesson",
      "optional resource link",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "Who created or shared the resource?",
        fills: ["person or source"],
      },
      {
        question: "What specific topic does the resource cover?",
        fills: ["topic"],
      },
      {
        question: "What are the four most useful and distinct insights from the resource?",
        fills: ["insight 1", "insight 2", "insight 3", "insight 4"],
      },
      {
        question: "What single lesson connects the four insights?",
        fills: ["summary lesson"],
      },
      {
        question: "What link should readers use to access the original resource?",
        fills: ["optional resource link"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["resource_offer", "industry_prompt", "conversation"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not make the resource sound more important than it is.",
      "Do not summarize a resource you have not reviewed.",
      "Do not misrepresent the creator's argument or remove important context.",
      "Do not present your interpretation as a direct quote.",
      "Do not invent insights, examples, data, or claims.",
      "Do not copy large sections of the source.",
      "Do not omit attribution when the original creator is known.",
      "Do not use four insights that repeat the same point.",
    ],
  }),

  t({
    id: "deeper_desire_contrast",
    name: "Deeper Desire Contrast",
    archetype: "deeper_desire_contrast",
    variant: "Surface desire vs real desire",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ARCHETYPE_PILLARS.deeper_desire_contrast,
    template: `[surface desire] gives you [surface outcome].
  
  [deeper desire] gives you [deeper outcome].
  
  Most people say they want [surface desire].
  
  What they usually want is [deeper desire].
  
  But [common behavior] keeps them focused on the surface.
  
  The better question:
  
  What would [desirable state] actually look like?
  
  [personal observation or example]
  
  [optional cta]`,
    variables: [
      "surface desire",
      "surface outcome",
      "deeper desire",
      "deeper outcome",
      "common behavior",
      "desirable state",
      "personal observation or example",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What does the audience commonly say they want?",
        fills: ["surface desire"],
      },
      {
        question: "What visible or immediate outcome does that surface desire provide?",
        fills: ["surface outcome"],
      },
      {
        question: "What deeper result or experience may sit underneath the stated desire?",
        fills: ["deeper desire"],
      },
      {
        question: "What meaningful outcome does the deeper desire provide?",
        fills: ["deeper outcome"],
      },
      {
        question: "What repeated behavior keeps the audience focused on the surface-level result?",
        fills: ["common behavior"],
      },
      {
        question: "What would the deeper desired state look like in observable terms?",
        fills: ["desirable state"],
      },
      {
        question: "What real personal observation, client pattern, or example supports this contrast?",
        fills: ["personal observation or example"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["belief_statement", "conversation", "relatable"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not claim to know what people secretly want without evidence or context.",
      "Do not dismiss the surface desire as shallow or unimportant.",
      "Do not use a deeper desire that is vague, universal, or impossible to observe.",
      "Do not create a false conflict when both desires can matter.",
      "Do not invent personal observations, customer patterns, or examples.",
      "Do not use psychological language to diagnose the audience.",
      "Do not assume every member of the audience shares the same motivation.",
    ],
  }),

  t({
    id: "transformation_story",
    name: "Transformation Story",
    archetype: "transformation_story",
    variant: "Starting point to change",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Get job opportunities", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.transformation_story,
    template: `I started from [starting point].
  
  At the time:
  
  - [constraint 1]
  - [constraint 2]
  - [constraint 3]
  
  Then I decided to [goal or change].
  
  I began by [specific action].
  
  Over time, that led to [result].
  
  The part people usually miss:
  
  [deeper lesson]
  
  You may not control [starting condition].
  
  You can still control [next action].
  
  [optional cta]`,
    variables: [
      "starting point",
      "constraint 1",
      "constraint 2",
      "constraint 3",
      "goal or change",
      "specific action",
      "result",
      "deeper lesson",
      "starting condition",
      "next action",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What real starting point did the transformation begin from?",
        fills: ["starting point"],
      },
      {
        question: "What three constraints made progress difficult at the time?",
        fills: ["constraint 1", "constraint 2", "constraint 3"],
      },
      {
        question: "What change or result did you decide to pursue?",
        fills: ["goal or change"],
      },
      {
        question: "What specific first action began the change?",
        fills: ["specific action"],
      },
      {
        question: "What honest and observable result followed over time?",
        fills: ["result"],
      },
      {
        question: "What deeper lesson did the experience reveal?",
        fills: ["deeper lesson"],
      },
      {
        question: "What part of the starting condition was outside your control?",
        fills: ["starting condition"],
      },
      {
        question: "What next action remained within your control?",
        fills: ["next action"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["relatable", "career_signal", "soft_lead"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not turn the story into a motivational speech.",
      "Do not invent a starting point, constraint, action, or result.",
      "Do not compress a gradual transformation into an unrealistic overnight change.",
      "Do not exaggerate the starting conditions to make the result more impressive.",
      "Do not claim the specific action alone caused the full result when other factors mattered.",
      "Do not describe a team result as an individual transformation without context.",
      "Do not imply that everyone can reproduce the same result by taking the same action.",
      "Do not reveal confidential or identifying information.",
    ],
  }),

  t({
    id: "villain_story",
    name: "Villain Story",
    archetype: "villain_story",
    variant: "Naming a harmful pattern",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Recruit / hire talent", "Build network"],
    bestForPillars: ARCHETYPE_PILLARS.villain_story,
    template: `I once experienced [difficult situation].
  
  What made it difficult was not only [surface problem].
  
  It was:
  
  - [behavior or issue 1]
  - [behavior or issue 2]
  - [behavior or issue 3]
  
  Some friction is normal in [context].
  
  But [specific harmful behavior] should not be.
  
  The real problem was [deeper issue].
  
  [lesson or standard]
  
  [optional cta]`,
    variables: [
      "difficult situation",
      "surface problem",
      "behavior or issue 1",
      "behavior or issue 2",
      "behavior or issue 3",
      "context",
      "specific harmful behavior",
      "deeper issue",
      "lesson or standard",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What difficult situation or harmful pattern can you discuss responsibly?",
        fills: ["difficult situation"],
      },
      {
        question: "What surface-level problem made the situation difficult?",
        fills: ["surface problem"],
      },
      {
        question: "What three specific behaviors or issues made the situation unacceptable?",
        fills: ["behavior or issue 1", "behavior or issue 2", "behavior or issue 3"],
      },
      {
        question: "In what professional, team, client, or workplace context did this happen?",
        fills: ["context"],
      },
      {
        question: "What specific harmful behavior crossed the line from normal friction into something unacceptable?",
        fills: ["specific harmful behavior"],
      },
      {
        question: "What deeper issue allowed or reinforced the harmful behavior?",
        fills: ["deeper issue"],
      },
      {
        question: "What lesson, boundary, or standard should readers take from the story?",
        fills: ["lesson or standard"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["relatable", "belief_statement", "culture_invite"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not attack or identify a specific person.",
      "Do not include details that make an unnamed person easy to identify.",
      "Do not exaggerate ordinary disagreement into abuse, toxicity, or misconduct.",
      "Do not invent behaviors, events, motives, or consequences.",
      "Do not diagnose another person's personality or mental state.",
      "Do not use the story to encourage harassment or retaliation.",
      "Do not present one event as proof that an entire company, profession, or group behaves the same way.",
      "Do not reveal confidential, legally sensitive, or private information.",
    ],
  }),
  //
  t({
    id: "problem_solution",
    name: "Problem and Solution",
    archetype: "problem_solution",
    variant: "Observation to practical steps",
    bestForRoles: BUSINESS_ROLES,
    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],
    bestForPillars: ARCHETYPE_PILLARS.problem_solution,
    template: `[relevant fact or observation].
  
  [second fact or supporting observation].
  
  Together, they explain why [problem] keeps happening.
  
  The consequence is [negative outcome].
  
  The better approach is [solution].
  
  Start with:
  
  1. [step 1]
  2. [step 2]
  3. [step 3]
  4. [step 4]
  
  The goal is not [surface fix].
  
  It is [real outcome].
  
  [optional cta]`,
    variables: [
      "relevant fact or observation",
      "second fact or supporting observation",
      "problem",
      "negative outcome",
      "solution",
      "step 1",
      "step 2",
      "step 3",
      "step 4",
      "surface fix",
      "real outcome",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What relevant fact, observation, or pattern first points to the problem?",
        fills: ["relevant fact or observation"],
      },
      {
        question: "What second fact or observation supports the same conclusion?",
        fills: ["second fact or supporting observation"],
      },
      {
        question: "What recurring problem do those observations help explain?",
        fills: ["problem"],
      },
      {
        question: "What specific negative outcome does the problem create?",
        fills: ["negative outcome"],
      },
      {
        question: "What better approach addresses the underlying problem?",
        fills: ["solution"],
      },
      {
        question: "What four practical steps should the audience take first?",
        fills: ["step 1", "step 2", "step 3", "step 4"],
      },
      {
        question: "What surface-level fix should they avoid focusing on?",
        fills: ["surface fix"],
      },
      {
        question: "What deeper result should the solution create?",
        fills: ["real outcome"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["problem_solution", "diagnostic", "soft_lead"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not invent facts, observations, patterns, or outcomes.",
      "Do not use two observations that make the same point.",
      "Do not claim the observations fully explain the problem without sufficient evidence.",
      "Do not present correlation as proven causation.",
      "Do not offer a solution that is disconnected from the stated cause.",
      "Do not make the four steps vague, repetitive, or impossible to act on.",
      "Do not dismiss a useful surface fix when it may still be necessary.",
      "Do not imply that following the steps guarantees the real outcome.",
    ],
  }),

  t({
    id: "dont_do_this_do_this",
    name: "Don't Do This, Do This Instead",
    archetype: "dont_do_this_do_this",
    variant: "Bad approach vs better approach",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],
    bestForPillars: ARCHETYPE_PILLARS.dont_do_this_do_this,
    template: `A few ways not to [goal]:
  
  1. [bad approach 1]
     [why it fails]
  
  2. [bad approach 2]
     [why it fails]
  
  3. [bad approach 3]
     [why it fails]
  
  A better approach:
  
  1. [better action 1]
  2. [better action 2]
  3. [better action 3]
  
  The difference is [core principle].
  
  [optional cta]`,
    variables: [
      "goal",
      "bad approach 1",
      "bad approach 2",
      "bad approach 3",
      "why it fails",
      "better action 1",
      "better action 2",
      "better action 3",
      "core principle",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What goal does your audience commonly approach in the wrong way?",
        fills: ["goal"],
      },
      {
        question: "What three ineffective approaches do people commonly use?",
        fills: ["bad approach 1", "bad approach 2", "bad approach 3"],
      },
      {
        question: "Why do those approaches fail or underperform?",
        fills: ["why it fails"],
      },
      {
        question: "What three better actions should replace them?",
        fills: ["better action 1", "better action 2", "better action 3"],
      },
      {
        question: "What principle explains the difference between the weak and strong approaches?",
        fills: ["core principle"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["agree_disagree", "diagnostic", "conversation"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not shame the audience.",
      "Do not describe a reasonable alternative as obviously wrong.",
      "Do not invent common mistakes or failure patterns.",
      "Do not make the bad approaches unrealistic strawmen.",
      "Do not use one explanation for failure when the approaches fail for different reasons.",
      "Do not make the better actions vague or unrelated to the bad approaches.",
      "Do not present the core principle as a universal rule.",
      "Do not imply that the better approach guarantees the goal.",
    ],
  }),

  t({
    id: "launch_story",
    name: "Launch Story",
    archetype: "launch_story",
    variant: "Behind the launch",
    bestForRoles: BUSINESS_ROLES,
    bestForGoals: ["Promote my product/service", "Get inbound leads", "Build authority"],
    bestForPillars: ARCHETYPE_PILLARS.launch_story,
    template: `We are launching [product or service] on [date].
  
  Getting here was not straightforward.
  
  We had to work through:
  
  - [challenge 1]
  - [challenge 2]
  - [challenge 3]
  
  The reason we kept going:
  
  [problem the product solves]
  
  It is designed to help [audience] achieve:
  
  - [benefit 1]
  - [benefit 2]
  - [benefit 3]
  
  [launch details]
  
  [required cta]`,
    variables: [
      "product or service",
      "date",
      "challenge 1",
      "challenge 2",
      "challenge 3",
      "problem the product solves",
      "audience",
      "benefit 1",
      "benefit 2",
      "benefit 3",
      "launch details",
      "required cta",
    ],
    clarifyingQuestions: [
      {
        question: "What product or service are you launching, and on what date?",
        fills: ["product or service", "date"],
      },
      {
        question: "What three real challenges did you work through before launch?",
        fills: ["challenge 1", "challenge 2", "challenge 3"],
      },
      {
        question: "What specific problem is the product or service designed to solve?",
        fills: ["problem the product solves"],
      },
      {
        question: "Who is the intended audience?",
        fills: ["audience"],
      },
      {
        question: "What three realistic benefits can the audience expect?",
        fills: ["benefit 1", "benefit 2", "benefit 3"],
      },
      {
        question: "What practical launch details should readers know, such as availability, pricing, access, timing, or next steps?",
        fills: ["launch details"],
      },
      {
        question: "What required CTA should readers take after seeing the post?",
        fills: ["required cta"],
      },
    ],
    ctaStyles: ["demo_invite", "product_walkthrough", "offer_bridge"],
    ctaRequirement: "required",
    proofRequirement: "required",
    antiPatterns: [
      "Do not overstate launch demand or traction.",
      "Do not invent launch challenges, customer interest, waitlists, sales, or usage.",
      "Do not describe ordinary development work as an extraordinary struggle.",
      "Do not promise benefits the product or service cannot reliably provide.",
      "Do not hide material limitations, eligibility requirements, pricing, or availability.",
      "Do not use false scarcity or artificial urgency.",
      "Do not make the CTA unclear or disconnected from the launch details.",
      "Do not imply that launching the product proves that it works.",
    ],
  }),

  t({
    id: "failure_to_recovery",
    name: "Failure to Recovery",
    archetype: "failure_to_recovery",
    variant: "Setback to grounded lesson",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities", "Build network"],
    bestForPillars: ARCHETYPE_PILLARS.failure_to_recovery,
    template: `[timeframe] ago, [attempt or venture] failed.
  
  Before that, I had [effort or sacrifice].
  
  The failure led to [consequence].
  
  For a while, I dealt with:
  
  - [difficulty 1]
  - [difficulty 2]
  - [difficulty 3]
  
  Then [turning point].
  
  What changed was [specific change].
  
  Visible success rarely shows the full path.
  
  If you are dealing with [related hardship], remember:
  
  [grounded lesson]
  
  [optional cta]`,
    variables: [
      "timeframe",
      "attempt or venture",
      "effort or sacrifice",
      "consequence",
      "difficulty 1",
      "difficulty 2",
      "difficulty 3",
      "turning point",
      "specific change",
      "related hardship",
      "grounded lesson",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "When did the setback happen, and what attempt, project, role, or venture failed?",
        fills: ["timeframe", "attempt or venture"],
      },
      {
        question: "What real effort, time, money, trust, or opportunity had you invested before the failure?",
        fills: ["effort or sacrifice"],
      },
      {
        question: "What specific consequence followed?",
        fills: ["consequence"],
      },
      {
        question: "What three difficulties did you deal with afterward?",
        fills: ["difficulty 1", "difficulty 2", "difficulty 3"],
      },
      {
        question: "What event, decision, support, or realization became the turning point?",
        fills: ["turning point"],
      },
      {
        question: "What concrete behavior, system, or circumstance changed after that point?",
        fills: ["specific change"],
      },
      {
        question: "What related hardship might the audience currently be dealing with?",
        fills: ["related hardship"],
      },
      {
        question: "What grounded lesson can you offer without promising that recovery will be easy or identical?",
        fills: ["grounded lesson"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["relatable", "shared_learning", "career_signal"],
    ctaRequirement: "optional",
    proofRequirement: "required",
    antiPatterns: [
      "Do not romanticize failure.",
      "Do not invent the setback, sacrifice, consequences, difficulties, or recovery.",
      "Do not exaggerate the failure to make the recovery look more impressive.",
      "Do not imply that hardship was necessary or ultimately beneficial.",
      "Do not present recovery as a simple result of mindset or persistence.",
      "Do not use another person's pain or private experience without permission.",
      "Do not imply that the same turning point will work for everyone.",
      "Do not claim complete recovery if the situation is still unresolved.",
      "Do not reveal confidential, legally sensitive, or identifying information.",
    ],
  }),

  t({
    id: "beginner_to_expert",
    name: "Beginner to Expert",
    archetype: "beginner_to_expert",
    variant: "Maturity ladder",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Get job opportunities", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.beginner_to_expert,
    template: `Beginner:
  
  [basic behavior]
  
  Intermediate:
  
  [basic behavior plus improvement]
  
  Advanced:
  
  [more complete behavior]
  
  Expert:
  
  [full system or deeper practice]
  
  The point:
  
  [goal] requires more than [basic activity].
  
  It requires [deeper principle].
  
  [optional cta]`,
    variables: [
      "basic behavior",
      "basic behavior plus improvement",
      "more complete behavior",
      "full system or deeper practice",
      "goal",
      "basic activity",
      "deeper principle",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What skill, process, system, or area of performance should the maturity ladder explain?",
        fills: ["goal"],
      },
      {
        question: "What observable behavior is typical at the beginner stage?",
        fills: ["basic behavior"],
      },
      {
        question: "What improvement distinguishes the intermediate stage?",
        fills: ["basic behavior plus improvement"],
      },
      {
        question: "What more complete behavior distinguishes the advanced stage?",
        fills: ["more complete behavior"],
      },
      {
        question: "What full system, judgment, or deeper practice distinguishes the expert stage?",
        fills: ["full system or deeper practice"],
      },
      {
        question: "What basic activity do people often mistake for full mastery?",
        fills: ["basic activity"],
      },
      {
        question: "What deeper principle is required to reach a stronger level of performance?",
        fills: ["deeper principle"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["belief_statement", "work_style", "diagnostic"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not treat expertise as a fixed identity or title.",
      "Do not make the stages depend only on years of experience.",
      "Do not use vague behaviors that cannot be observed.",
      "Do not make the beginner stage sound foolish or incompetent.",
      "Do not imply that every person develops through the same linear sequence.",
      "Do not confuse complexity with expertise.",
      "Do not present the expert stage as flawless performance.",
      "Do not invent maturity levels that are unsupported by experience or evidence.",
    ],
  }),
  //
  t({
    id: "common_mistake",
    name: "Common Mistake",
    archetype: "mistake_lesson",
    variant: "Mistake to reframe",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.common_mistake,
    template: `A common mistake in [topic]:
  
  [mistake]
  
  It seems reasonable because [why it seems reasonable].
  
  But it creates [negative outcome].
  
  A better way to think about it:
  
  - [reframe 1]
  - [reframe 2]
  - [reframe 3]
  
  The goal is [desired outcome], not [wrong outcome].
  
  [optional cta]`,
    variables: [
      "topic",
      "mistake",
      "why it seems reasonable",
      "negative outcome",
      "reframe 1",
      "reframe 2",
      "reframe 3",
      "desired outcome",
      "wrong outcome",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What topic or area does the mistake relate to?",
        fills: ["topic"],
      },
      {
        question: "What specific mistake does your audience commonly make?",
        fills: ["mistake"],
      },
      {
        question: "Why does that mistake seem reasonable at first?",
        fills: ["why it seems reasonable"],
      },
      {
        question: "What specific negative outcome can it create?",
        fills: ["negative outcome"],
      },
      {
        question: "What three distinct reframes would help the audience think more clearly?",
        fills: ["reframe 1", "reframe 2", "reframe 3"],
      },
      {
        question: "What outcome should the audience actually pursue?",
        fills: ["desired outcome"],
      },
      {
        question: "What misleading or surface-level outcome should they stop prioritizing?",
        fills: ["wrong outcome"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["diagnostic", "conversation", "belief_statement"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not make the audience feel stupid.",
      "Do not invent a mistake that is not genuinely common.",
      "Do not use a strawman version of a reasonable approach.",
      "Do not claim the mistake always causes the same outcome.",
      "Do not use three reframes that repeat the same idea.",
      "Do not replace one oversimplification with another.",
      "Do not shame people for following advice that once seemed reasonable.",
      "Do not imply that the reframe guarantees the desired outcome.",
    ],
  }),

  t({
    id: "rule_or_wisdom",
    name: "Rule or Wisdom",
    archetype: "rule_or_wisdom",
    variant: "Principle under pressure",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ARCHETYPE_PILLARS.rule_or_wisdom,
    template: `[rule or principle]:
  
  [setback or difficulty] will happen.
  
  The next move should still align with [goal].
  
  - If [setback 1], [constructive response 1]
  - If [setback 2], [constructive response 2]
  - If [setback 3], [constructive response 3]
  
  The principle is simple:
  
  [practical interpretation]
  
  [optional cta]`,
    variables: [
      "rule or principle",
      "setback or difficulty",
      "goal",
      "setback 1",
      "constructive response 1",
      "setback 2",
      "constructive response 2",
      "setback 3",
      "constructive response 3",
      "practical interpretation",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What rule or principle do you want to share?",
        fills: ["rule or principle"],
      },
      {
        question: "What general setback or difficulty makes the principle important?",
        fills: ["setback or difficulty"],
      },
      {
        question: "What goal should the next move continue to support?",
        fills: ["goal"],
      },
      {
        question: "What are three realistic setbacks that test the principle?",
        fills: ["setback 1", "setback 2", "setback 3"],
      },
      {
        question: "What constructive response should follow each setback?",
        fills: ["constructive response 1", "constructive response 2", "constructive response 3"],
      },
      {
        question: "How should someone apply the principle in practical terms?",
        fills: ["practical interpretation"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["belief_statement", "relatable", "shared_learning"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not present the principle as a universal law.",
      "Do not use setbacks that are extreme, vague, or unrelated to the goal.",
      "Do not make the constructive responses unrealistic or overly simplistic.",
      "Do not imply that maintaining alignment removes the emotional or practical cost of a setback.",
      "Do not use a principle that conflicts with safety, ethics, or legal obligations.",
      "Do not invent personal experience or evidence to support the rule.",
      "Do not make all three responses versions of persistence.",
      "Do not use wisdom language to avoid acknowledging necessary changes in direction.",
    ],
  }),

  t({
    id: "consistency_journey",
    name: "Consistency Journey",
    archetype: "consistency_journey",
    variant: "Repeated action over time",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities"],
    bestForPillars: ARCHETYPE_PILLARS.consistency_journey,
    template: `I started [activity] in [timeframe].
  
  At first:
  
  - [early struggle 1]
  - [early struggle 2]
  - [early struggle 3]
  
  Since then, I have [consistent action].
  
  That has led to:
  
  - [result 1]
  - [result 2]
  - [result 3]
  
  The biggest lesson:
  
  [lesson about consistency]
  
  For anyone starting now:
  
  [practical advice]
  
  [optional cta]`,
    variables: [
      "activity",
      "timeframe",
      "early struggle 1",
      "early struggle 2",
      "early struggle 3",
      "consistent action",
      "result 1",
      "result 2",
      "result 3",
      "lesson about consistency",
      "practical advice",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What activity did you begin practicing consistently, and when did you start?",
        fills: ["activity", "timeframe"],
      },
      {
        question: "What three real struggles did you experience early on?",
        fills: ["early struggle 1", "early struggle 2", "early struggle 3"],
      },
      {
        question: "What specific action or routine did you repeat over time?",
        fills: ["consistent action"],
      },
      {
        question: "What three honest and observable results followed?",
        fills: ["result 1", "result 2", "result 3"],
      },
      {
        question: "What did the experience teach you about consistency?",
        fills: ["lesson about consistency"],
      },
      {
        question: "What practical advice would help someone begin without overcommitting?",
        fills: ["practical advice"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["relatable", "career_signal", "conversation"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not invent streaks, timeframes, routines, or results.",
      "Do not imply that consistency alone caused every result.",
      "Do not glorify rigid routines, overwork, or never taking breaks.",
      "Do not exaggerate early struggles to make the journey more impressive.",
      "Do not use three results that repeat the same outcome.",
      "Do not present one routine as suitable for everyone.",
      "Do not confuse consistency with repeating an ineffective approach.",
      "Do not promise that following the same advice will produce identical results.",
    ],
  }),

  t({
    id: "unexpected_connection",
    name: "Unexpected Connection",
    archetype: "unexpected_connection",
    variant: "Small connection to larger outcome",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build network", "Grow my audience", "Build authority"],
    bestForPillars: ARCHETYPE_PILLARS.unexpected_connection,
    template: `[unexpected result] started with [small event or connection].
  
  At the time, [context].
  
  Later, I reached out because:
  
  - [reason 1]
  - [reason 2]
  - [reason 3]
  
  That led to:
  
  - [outcome 1]
  - [outcome 2]
  - [outcome 3]
  
  And eventually, [larger outcome].
  
  The lesson:
  
  [connection or network insight]
  
  [optional cta]`,
    variables: [
      "unexpected result",
      "small event or connection",
      "context",
      "reason 1",
      "reason 2",
      "reason 3",
      "outcome 1",
      "outcome 2",
      "outcome 3",
      "larger outcome",
      "connection or network insight",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What unexpected result or opportunity eventually occurred?",
        fills: ["unexpected result"],
      },
      {
        question: "What small event, introduction, message, or connection started the chain?",
        fills: ["small event or connection"],
      },
      {
        question: "What was happening at the time?",
        fills: ["context"],
      },
      {
        question: "What three genuine reasons led you to reach out or continue the connection?",
        fills: ["reason 1", "reason 2", "reason 3"],
      },
      {
        question: "What three concrete outcomes followed from the connection?",
        fills: ["outcome 1", "outcome 2", "outcome 3"],
      },
      {
        question: "What larger outcome eventually emerged?",
        fills: ["larger outcome"],
      },
      {
        question: "What grounded lesson about relationships, networking, or follow-up did the experience reveal?",
        fills: ["connection or network insight"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["open_to_conversation", "collaboration", "shared_learning"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not invent a relationship, introduction, opportunity, or result.",
      "Do not claim one connection caused the larger outcome when several factors contributed.",
      "Do not identify or quote another person without permission when the story is sensitive.",
      "Do not reduce networking to extracting value from people.",
      "Do not imply that every small interaction will produce a major opportunity.",
      "Do not exaggerate the importance of the original event in hindsight.",
      "Do not make the reasons for reaching out transactional if they were not.",
      "Do not reveal confidential or identifying details.",
    ],
  }),

  t({
    id: "no_secret_daily_action",
    name: "No Secret Daily Action",
    archetype: "no_secret_daily_action",
    variant: "Repeatable action beats shortcut",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Grow my audience", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.no_secret_daily_action,
    template: `People ask how I [outcome].
  
  My answer:
  
  [repeatable daily action].
  
  They ask how I [second outcome].
  
  Same answer:
  
  [repeatable daily action].
  
  There is no hidden shortcut.
  
  The real advantage is [core principle].
  
  Start with:
  
  1. [step 1]
  2. [step 2]
  3. [step 3]
  4. [step 4]
  
  Consistency makes the difference.
  
  [optional cta]`,
    variables: ["outcome", "repeatable daily action", "second outcome", "core principle", "step 1", "step 2", "step 3", "step 4", "optional cta"],
    clarifyingQuestions: [
      {
        question: "What first outcome do people ask you how to achieve?",
        fills: ["outcome"],
      },
      {
        question: "What second outcome is supported by the same repeated action?",
        fills: ["second outcome"],
      },
      {
        question: "What specific daily or repeatable action contributes to both outcomes?",
        fills: ["repeatable daily action"],
      },
      {
        question: "What principle explains why that action creates an advantage over time?",
        fills: ["core principle"],
      },
      {
        question: "What four practical steps would help someone begin the action consistently?",
        fills: ["step 1", "step 2", "step 3", "step 4"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["belief_statement", "conversation", "work_style"],
    ctaRequirement: "optional",
    proofRequirement: "recommended",
    antiPatterns: [
      "Do not imply that one daily action is solely responsible for complex outcomes.",
      "Do not invent routines, results, or questions people have asked you.",
      "Do not present consistency as a substitute for skill, strategy, resources, or adaptation.",
      "Do not make the repeatable action vague or impossible to measure.",
      "Do not use four steps that merely repeat the daily action.",
      "Do not glorify daily work when rest or a different frequency is more appropriate.",
      "Do not imply that there are no meaningful advantages, systems, or resources behind the outcome.",
      "Do not promise that repeating the action will guarantee either outcome.",
    ],
  }),
  //
  t({
    id: "expectation_reset",
    name: "Expectation Reset",
    archetype: "expectation_reset",
    variant: "What the work can and cannot fix",
    bestForRoles: BUSINESS_ROLES,
    bestForGoals: ["Promote my product/service", "Get inbound leads", "Build authority"],
    bestForPillars: ARCHETYPE_PILLARS.expectation_reset,
    template: `[role or industry] cannot fix everything.
  
  It cannot fix:
  
  1. [unrealistic expectation 1]
  2. [unrealistic expectation 2]
  3. [unrealistic expectation 3]
  
  It can help with [realistic outcome].
  
  But only when [condition].
  
  The point is not to lower expectations.
  
  It is to set the right ones.
  
  [optional cta]`,
    variables: [
      "role or industry",
      "unrealistic expectation 1",
      "unrealistic expectation 2",
      "unrealistic expectation 3",
      "realistic outcome",
      "condition",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What role, service, function, or industry does the audience expect too much from?",
        fills: ["role or industry"],
      },
      {
        question: "What three unrealistic outcomes do people expect it to create or fix?",
        fills: ["unrealistic expectation 1", "unrealistic expectation 2", "unrealistic expectation 3"],
      },
      {
        question: "What realistic outcome can it genuinely help produce?",
        fills: ["realistic outcome"],
      },
      {
        question: "What condition, input, support, or prerequisite must be present for that outcome to become possible?",
        fills: ["condition"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["fit_check", "offer_bridge", "diagnostic"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not make the offer sound weak or defensive.",
      "Do not invent unrealistic expectations that the audience does not genuinely hold.",
      "Do not use limitations to avoid taking responsibility for poor delivery.",
      "Do not understate what the role, service, or industry can realistically accomplish.",
      "Do not present one condition as a guarantee of success.",
      "Do not blame the customer, client, or audience for every poor outcome.",
      "Do not hide material dependencies, limitations, or prerequisites.",
      "Do not frame expectation-setting as a reason to lower quality standards.",
    ],
  }),

  t({
    id: "goal_to_daily_system",
    name: "Goal to Daily System",
    archetype: "goal_to_daily_system",
    variant: "Outcome to repeatable operating system",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Get inbound leads", "Get job opportunities"],
    bestForPillars: ARCHETYPE_PILLARS.goal_to_daily_system,
    template: `[small repeatable result] over [timeframe] leads to [larger result].
  
  That is the target.
  
  The daily system:
  
  - [daily action 1]
  - [daily action 2]
  - [daily action 3]
  
  In practice:
  
  1. [specific example 1]
  2. [specific example 2]
  3. [specific example 3]
  
  As the system matures, add:
  
  - [less frequent action 1]
  - [less frequent action 2]
  - [less frequent action 3]
  
  The goal is not intensity.
  
  It is repeatability.
  
  [optional cta]`,
    variables: [
      "small repeatable result",
      "timeframe",
      "larger result",
      "daily action 1",
      "daily action 2",
      "daily action 3",
      "specific example 1",
      "specific example 2",
      "specific example 3",
      "less frequent action 1",
      "less frequent action 2",
      "less frequent action 3",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What small result should the system produce repeatedly?",
        fills: ["small repeatable result"],
      },
      {
        question: "Over what realistic timeframe can those repeated results contribute to a larger outcome?",
        fills: ["timeframe"],
      },
      {
        question: "What larger result is the system designed to support?",
        fills: ["larger result"],
      },
      {
        question: "What three actions should happen daily or during every work cycle?",
        fills: ["daily action 1", "daily action 2", "daily action 3"],
      },
      {
        question: "What concrete example shows how each daily action is performed?",
        fills: ["specific example 1", "specific example 2", "specific example 3"],
      },
      {
        question: "What three weekly, monthly, or milestone-based actions should be added as the system matures?",
        fills: ["less frequent action 1", "less frequent action 2", "less frequent action 3"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["diagnostic", "work_style", "soft_lead"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not imply that repetition alone guarantees the larger result.",
      "Do not create daily actions that depend on outcomes outside the person's control.",
      "Do not make all three daily actions versions of the same task.",
      "Do not use examples that merely repeat the action labels.",
      "Do not add less frequent actions that should actually happen every day.",
      "Do not invent timelines or expected results.",
      "Do not create a system so demanding that it contradicts the goal of repeatability.",
      "Do not confuse consistency with rigidly repeating an ineffective process.",
    ],
  }),

  t({
    id: "misconception_to_framework",
    name: "Misconception to Framework",
    archetype: "misconception_to_framework",
    variant: "Belief correction with practical model",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],
    bestForPillars: ARCHETYPE_PILLARS.misconception_to_framework,
    template: `Why does [audience] struggle with [problem]?
  
  Because many believe [misconception].
  
  The reality:
  
  [reframe]
  
  A better approach is [framework or strategy].
  
  It works because:
  
  1. [benefit 1]
  2. [benefit 2]
  
  Think about it this way:
  
  - [mental model 1]
  - [mental model 2]
  - [mental model 3]
  
  Instead of [common approach], try:
  
  - [better action 1]
  - [better action 2]
  - [better action 3]
  
  [optional cta]`,
    variables: [
      "audience",
      "problem",
      "misconception",
      "reframe",
      "framework or strategy",
      "benefit 1",
      "benefit 2",
      "mental model 1",
      "mental model 2",
      "mental model 3",
      "common approach",
      "better action 1",
      "better action 2",
      "better action 3",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "Who is struggling, and what specific problem are they experiencing?",
        fills: ["audience", "problem"],
      },
      {
        question: "What mistaken or incomplete belief contributes to the problem?",
        fills: ["misconception"],
      },
      {
        question: "What more accurate belief should replace the misconception?",
        fills: ["reframe"],
      },
      {
        question: "What framework, model, or strategy puts the corrected belief into practice?",
        fills: ["framework or strategy"],
      },
      {
        question: "What two distinct benefits does the framework provide?",
        fills: ["benefit 1", "benefit 2"],
      },
      {
        question: "What three mental models make the framework easier to understand or remember?",
        fills: ["mental model 1", "mental model 2", "mental model 3"],
      },
      {
        question: "What common approach should the audience stop relying on?",
        fills: ["common approach"],
      },
      {
        question: "What three specific actions should they take instead?",
        fills: ["better action 1", "better action 2", "better action 3"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["authority_reframe", "diagnostic", "conversation"],
    ctaRequirement: "optional",
    proofRequirement: "optional",
    antiPatterns: [
      "Do not invent a misconception that the audience does not genuinely hold.",
      "Do not reduce a complex problem to one belief without sufficient basis.",
      "Do not replace the misconception with another unsupported absolute.",
      "Do not use a vague framework name without explaining how it works.",
      "Do not list benefits that are disconnected from the framework.",
      "Do not make the mental models duplicates of the better actions.",
      "Do not shame the audience for following the common approach.",
      "Do not imply that the framework guarantees the desired result.",
    ],
  }),

  t({
    id: "research_led_explanation",
    name: "Research-Led Explanation",
    archetype: "research_led_explanation",
    variant: "Evidence to practical explanation",
    bestForRoles: ALL_ROLES,
    bestForGoals: ["Build authority", "Build network", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.research_led_explanation,
    template: `[fact, data point, or observation].
  
  Why does this happen?
  
  [concept or phenomenon]
  
  Research or evidence suggests:
  
  [summary of findings]
  
  The practical reason is [plain-language explanation].
  
  A useful example:
  
  [relatable example]
  
  The response is not [wrong response].
  
  It is [better response].
  
  Next time [situation] happens, remember [key lesson].
  
  [optional cta]`,
    variables: [
      "fact, data point, or observation",
      "concept or phenomenon",
      "summary of findings",
      "plain-language explanation",
      "relatable example",
      "wrong response",
      "better response",
      "situation",
      "key lesson",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What verified fact, data point, or observation should open the post?",
        fills: ["fact, data point, or observation"],
      },
      {
        question: "What concept, mechanism, or phenomenon may explain why it happens?",
        fills: ["concept or phenomenon"],
      },
      {
        question: "What does the research or evidence actually suggest, including any important limits?",
        fills: ["summary of findings"],
      },
      {
        question: "How would you explain the finding in plain language without overstating it?",
        fills: ["plain-language explanation"],
      },
      {
        question: "What relatable example helps the audience understand the mechanism?",
        fills: ["relatable example"],
      },
      {
        question: "What common response is ineffective or based on the wrong interpretation?",
        fills: ["wrong response"],
      },
      {
        question: "What better response follows from the evidence?",
        fills: ["better response"],
      },
      {
        question: "In what recurring situation should the audience apply this lesson?",
        fills: ["situation"],
      },
      {
        question: "What concise lesson should they remember?",
        fills: ["key lesson"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["industry_prompt", "authority_reframe", "peer_question"],
    ctaRequirement: "optional",
    proofRequirement: "required",
    antiPatterns: [
      "Do not cite research unless source context is provided.",
      "Do not invent studies, statistics, findings, or observations.",
      "Do not present correlation as causation.",
      "Do not remove important limitations, uncertainty, sample context, or conflicting evidence.",
      "Do not imply that one study settles a broad question.",
      "Do not use a relatable example as proof that the research is correct.",
      "Do not translate a finding into advice that the evidence does not support.",
      "Do not use outdated evidence when the field or claim may have changed materially.",
      "Do not present your interpretation as the researchers' exact conclusion.",
    ],
  }),

  t({
    id: "brand_case_study",
    name: "Brand Case Study",
    archetype: "brand_case_study",
    variant: "Strategy shift case study",
    bestForRoles: BUSINESS_ROLES,
    bestForGoals: ["Build authority", "Promote my product/service", "Get inbound leads"],
    bestForPillars: ARCHETYPE_PILLARS.brand_case_study,
    template: `[brand or company] achieved [notable result].
  
  The important part is how the strategy changed over time.
  
  At first, the strategy was [original strategy].
  
  It worked until [market or industry shift].
  
  That created [negative outcome].
  
  The company responded by:
  
  1. [change 1]
  2. [change 2]
  3. [change 3]
  
  The result was [outcome].
  
  The larger lesson:
  
  [lesson for the audience]
  
  [optional cta]`,
    variables: [
      "brand or company",
      "notable result",
      "original strategy",
      "market or industry shift",
      "negative outcome",
      "change 1",
      "change 2",
      "change 3",
      "outcome",
      "lesson for the audience",
      "optional cta",
    ],
    clarifyingQuestions: [
      {
        question: "What brand or company case can you discuss using verified or supplied information?",
        fills: ["brand or company"],
      },
      {
        question: "What notable and verifiable result did the company achieve?",
        fills: ["notable result"],
      },
      {
        question: "What was the company's original strategy?",
        fills: ["original strategy"],
      },
      {
        question: "What market, customer, technology, or industry shift made that strategy less effective?",
        fills: ["market or industry shift"],
      },
      {
        question: "What negative outcome or pressure followed?",
        fills: ["negative outcome"],
      },
      {
        question: "What three distinct changes did the company make in response?",
        fills: ["change 1", "change 2", "change 3"],
      },
      {
        question: "What verified outcome followed the strategic changes?",
        fills: ["outcome"],
      },
      {
        question: "What useful lesson can the audience take without assuming the same strategy will work everywhere?",
        fills: ["lesson for the audience"],
      },
      {
        question: "What optional CTA should close the post?",
        fills: ["optional cta"],
      },
    ],
    ctaStyles: ["belief_statement", "offer_bridge", "industry_prompt"],
    ctaRequirement: "optional",
    proofRequirement: "required",
    antiPatterns: [
      "Do not invent brand results or strategy details.",
      "Do not claim the strategic changes caused the outcome unless the evidence supports that conclusion.",
      "Do not omit other important factors that contributed to the result.",
      "Do not rely on outdated, promotional, or unverified company claims without context.",
      "Do not portray a complex strategy shift as one simple decision.",
      "Do not use private or confidential company information.",
      "Do not assume another company can reproduce the same outcome by copying the strategy.",
      "Do not make the audience lesson broader than the case evidence supports.",
      "Do not present the company as an unquestioned success if the result involved meaningful trade-offs.",
    ],
  }),
]

export const LINKEDIN_POST_TEMPLATES: PostTemplate[] = [
  ...IMPORTED_LINKEDIN_POST_TEMPLATES,
  t({
    id: "pain_diagnosis_01",
    name: "Surface Problem vs Root Problem",
    archetype: "Pain Diagnosis",
    variant: "Contradiction-led root cause reveal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],

    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `[audience] keep fixing the part of [problem] that appears last.
  
  They see [surface problem] and immediately blame [common assumption].
  
  But [surface problem] is only the visible result.
  
  The real breakdown starts with [deeper problem].
  
  You can spot it earlier when:
  
  → [early signal 1]
  
  → [early signal 2]
  
  → [early signal 3]
  
  By the time [surface problem] appears, the damage has already moved through the system.
  
  Fixing it with [common wrong fix] may improve [surface symptom].
  
  But it leaves [root cause] untouched.
  
  Look upstream.
  
  Ask:
  
  "Where does this problem begin before anyone can see it?"
  
  That answer deserves your attention first.
  
  [cta]`,

    variables: [
      "audience",
      "problem",
      "surface problem",
      "common assumption",
      "deeper problem",
      "early signal 1",
      "early signal 2",
      "early signal 3",
      "common wrong fix",
      "surface symptom",
      "root cause",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the target audience, and what broader problem are they trying to solve?",
        fills: ["audience", "problem"],
      },
      {
        question: "What visible problem do they notice, and what do they usually blame for it?",
        fills: ["surface problem", "common assumption"],
      },
      {
        question: "What deeper issue usually creates the visible problem?",
        fills: ["deeper problem", "root cause"],
      },
      {
        question: "What are three early signals that appear before the visible problem becomes obvious?",
        fills: ["early signal 1", "early signal 2", "early signal 3"],
      },
      {
        question: "What fix do people usually try, and what surface-level symptom does it improve without solving the cause?",
        fills: ["common wrong fix", "surface symptom"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "problem_solution", "authority_reframe"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not begin with 'I've noticed.'",
      "Do not use vague root causes such as strategy, mindset, clarity, or consistency without explaining them.",
      "Do not make the surface problem and deeper problem sound interchangeable.",
      "Do not turn the post into a long educational essay.",
      "Do not shame the audience for treating the visible symptom first.",
    ],
  }),

  t({
    id: "pain_diagnosis_02",
    name: "Symptoms of a Deeper Issue",
    archetype: "Pain Diagnosis",
    variant: "Pattern-led diagnosis",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority"],

    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `When these four things happen together, stop blaming [surface diagnosis].
  
  → [symptom 1]
  
  → [symptom 2]
  
  → [symptom 3]
  
  → [symptom 4]
  
  That pattern points to [deeper diagnosis].
  
  The difference matters.
  
  A [surface diagnosis] sends you toward [wrong area].
  
  A [deeper diagnosis] sends you toward [right area].
  
  One creates [unhelpful result].
  
  The other addresses [underlying breakdown].
  
  Before you invest in [next tactic], answer one question:
  
  "Which diagnosis explains all four symptoms at once?"
  
  [cta]`,

    variables: [
      "surface diagnosis",
      "symptom 1",
      "symptom 2",
      "symptom 3",
      "symptom 4",
      "deeper diagnosis",
      "wrong area",
      "right area",
      "unhelpful result",
      "underlying breakdown",
      "next tactic",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What are four specific symptoms your audience would immediately recognize?",
        fills: ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
      },
      {
        question: "What do people usually misdiagnose these symptoms as?",
        fills: ["surface diagnosis"],
      },
      {
        question: "What deeper diagnosis explains all four symptoms more accurately?",
        fills: ["deeper diagnosis"],
      },
      {
        question: "What does the surface diagnosis cause people to fix, and what should they fix instead?",
        fills: ["wrong area", "right area"],
      },
      {
        question: "What unhelpful result comes from fixing the wrong area, and what underlying breakdown needs attention?",
        fills: ["unhelpful result", "underlying breakdown"],
      },
      {
        question: "What tactic, purchase, hire, or initiative should they pause before trying?",
        fills: ["next tactic"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "authority_reframe"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use symptoms that are vague or difficult to observe.",
      "Do not reveal the deeper diagnosis before presenting the symptoms.",
      "Do not make a diagnosis that fails to explain every listed symptom.",
      "Do not make the post sound like medical advice unless the topic is explicitly medical and properly supported.",
    ],
  }),

  t({
    id: "pain_diagnosis_03",
    name: "The Expensive Wrong Fix",
    archetype: "Pain Diagnosis",
    variant: "Cost-led wrong fix",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service", "Build authority"],

    bestForPillars: ["Problem education", "Mistakes and misconceptions", "Proof / case study"],

    template: `The most expensive response to [problem] is often the first one [audience] try.
  
  That response is [wrong fix].
  
  It feels logical because [reason it feels logical].
  
  But when [root cause] is driving the problem, [wrong fix] creates three new costs:
  
  → [cost 1]
  
  → [cost 2]
  
  → [cost 3]
  
  [proof example].
  
  They spent [time, money, or effort lost] improving [wrong area].
  
  The result barely moved because [root cause] stayed in place.
  
  The better first move was [better first move].
  
  That revealed [important insight].
  
  Do not increase your investment in [wrong fix] until you have ruled out [root cause].
  
  [cta]`,

    variables: [
      "problem",
      "audience",
      "wrong fix",
      "reason it feels logical",
      "root cause",
      "cost 1",
      "cost 2",
      "cost 3",
      "proof example",
      "time, money, or effort lost",
      "wrong area",
      "better first move",
      "important insight",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what problem are they trying to solve?",
        fills: ["audience", "problem"],
      },
      {
        question: "What wrong fix do they commonly try first?",
        fills: ["wrong fix"],
      },
      {
        question: "Why does that fix seem logical or attractive at first?",
        fills: ["reason it feels logical"],
      },
      {
        question: "What root cause makes that fix ineffective?",
        fills: ["root cause"],
      },
      {
        question: "What three costs does the wrong fix create in time, money, performance, or complexity?",
        fills: ["cost 1", "cost 2", "cost 3"],
      },
      {
        question: "Do you have a brief client example, personal example, observation, or data point that proves this pattern?",
        fills: ["proof example"],
      },
      {
        question: "What was wasted, and which wrong area received too much attention?",
        fills: ["time, money, or effort lost", "wrong area"],
      },
      {
        question: "What should they do first, and what useful insight will that uncover?",
        fills: ["better first move", "important insight"],
      },
    ],

    ctaStyles: ["problem_solution", "soft_lead", "offer_bridge", "diagnostic"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not shame the audience for making the mistake.",
      "Do not describe the fix as expensive without naming a specific cost.",
      "Do not invent client results, financial figures, or proof.",
      "Do not make the wrong fix sound completely useless when it may be useful after the root cause is addressed.",
      "Do not include a proof example when the user has not provided one.",
    ],
  }),

  t({
    id: "pain_diagnosis_04",
    name: "Nobody Checks This First",
    archetype: "Pain Diagnosis",
    variant: "Prerequisite-led diagnostic",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],

    bestForPillars: ["Problem education", "Process / how-I-work", "Mistakes and misconceptions"],

    template: `Do not touch [tactic or solution] until you check [ignored check].
  
  Most [audience] skip this step.
  
  They move straight into:
  
  → [premature action 1]
  
  → [premature action 2]
  
  → [premature action 3]
  
  Those actions depend on [ignored check] already working.
  
  When it is weak, every new tactic adds noise.
  
  [consequence 1].
  
  [consequence 2].
  
  [consequence 3].
  
  Run this test first:
  
  "[specific diagnostic question]"
  
  A weak answer means you are not ready for [desired next action].
  
  Fix [foundational issue] before adding more weight to the system.
  
  [cta]`,

    variables: [
      "tactic or solution",
      "ignored check",
      "audience",
      "premature action 1",
      "premature action 2",
      "premature action 3",
      "consequence 1",
      "consequence 2",
      "consequence 3",
      "specific diagnostic question",
      "desired next action",
      "foundational issue",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what tactic or solution are they usually eager to try?",
        fills: ["audience", "tactic or solution"],
      },
      {
        question: "What prerequisite, foundation, or diagnostic check do they usually skip?",
        fills: ["ignored check"],
      },
      {
        question: "What three actions do they take too early?",
        fills: ["premature action 1", "premature action 2", "premature action 3"],
      },
      {
        question: "What three specific consequences occur when they take those actions before the foundation is ready?",
        fills: ["consequence 1", "consequence 2", "consequence 3"],
      },
      {
        question: "What single question can they ask to test whether the prerequisite is strong enough?",
        fills: ["specific diagnostic question"],
      },
      {
        question: "What action should they delay, and what foundational issue should they fix first?",
        fills: ["desired next action", "foundational issue"],
      },
    ],

    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead", "offer_bridge"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use a vague ignored check such as 'strategy' or 'foundation' without defining it.",
      "Do not recommend a diagnostic question that can only be answered with yes or no unless that answer is genuinely useful.",
      "Do not use generic consequences such as poor results, wasted time, or confusion without explaining what changes.",
      "Do not make the prerequisite sound unrelated to the tactic being delayed.",
    ],
  }),

  t({
    id: "pain_diagnosis_05",
    name: "Problem Beneath the Problem",
    archetype: "Pain Diagnosis",
    variant: "Timeline-led escalation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority"],

    bestForPillars: ["Problem education", "Audience belief shift", "Process / how-I-work"],

    template: `The day [surface problem] appears is not the day the problem starts.
  
  The sequence usually looks like this:
  
  First, [hidden issue] begins.
  
  Then, [early sign 1] changes.
  
  Next, [early sign 2] becomes harder to ignore.
  
  After that, [early sign 3] starts affecting [important outcome].
  
  Only then does [surface problem] become visible.
  
  Most [audience] begin reacting at the final stage.
  
  That is why the response becomes [late-stage consequence].
  
  The better move is to monitor [leading indicator].
  
  It gives you time to correct [hidden issue] before it becomes [surface problem].
  
  Do not measure only the outcome.
  
  Measure the conditions that create it.
  
  [cta]`,

    variables: [
      "surface problem",
      "hidden issue",
      "early sign 1",
      "early sign 2",
      "early sign 3",
      "important outcome",
      "audience",
      "late-stage consequence",
      "leading indicator",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what visible problem do they usually notice too late?",
        fills: ["audience", "surface problem"],
      },
      {
        question: "What hidden issue begins before the visible problem appears?",
        fills: ["hidden issue"],
      },
      {
        question: "What are the first three changes that happen as the hidden issue develops?",
        fills: ["early sign 1", "early sign 2", "early sign 3"],
      },
      {
        question: "What important business, career, marketing, or performance outcome does the third sign begin to affect?",
        fills: ["important outcome"],
      },
      {
        question: "What happens when people wait until the final stage to respond?",
        fills: ["late-stage consequence"],
      },
      {
        question: "What leading indicator could they monitor to catch the issue earlier?",
        fills: ["leading indicator"],
      },
    ],

    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead", "problem_solution"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not describe events that do not follow a believable sequence.",
      "Do not repeat the same idea for all three early signs.",
      "Do not use a lagging outcome as the leading indicator.",
      "Do not claim that the sequence always happens unless the user has evidence.",
      "Do not make the timeline longer than necessary.",
    ],
  }),
  //
  t({
    id: "checklist_01",
    name: "Before You Do X",
    archetype: "Checklist",
    variant: "Risk-led pre-action checklist",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Grow my audience"],

    bestForPillars: ["Problem education", "Process / how-I-work", "Mistakes and misconceptions"],

    template: `Before you [do action], make sure these five things are true.

→ [check 1]

→ [check 2]

→ [check 3]

→ [check 4]

→ [check 5]

Most [audience] rush past [important check].

Then [specific failure] shows up after they have already invested [resource at risk].

The action was not necessarily wrong.

The timing was.

Before moving forward, ask:

"Have we solved [core issue] well enough to support [do action]?"

If the answer is unclear, pause.

Fix [priority fix] before committing more [resource at risk].

[cta]`,

    variables: [
      "do action",
      "audience",
      "check 1",
      "check 2",
      "check 3",
      "check 4",
      "check 5",
      "important check",
      "specific failure",
      "resource at risk",
      "core issue",
      "priority fix",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what action do they usually rush into?",
        fills: ["audience", "do action"],
      },
      {
        question: "What five conditions should be true before they take that action?",
        fills: ["check 1", "check 2", "check 3", "check 4", "check 5"],
      },
      {
        question: "Which check is most often skipped, and why is it especially important?",
        fills: ["important check"],
      },
      {
        question: "What specific failure tends to appear when people skip that check?",
        fills: ["specific failure"],
      },
      {
        question: "What resource do they risk wasting, such as time, money, attention, trust, or team capacity?",
        fills: ["resource at risk"],
      },
      {
        question: "What core issue must be solved first, and what should they fix before moving forward?",
        fills: ["core issue", "priority fix"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "conversation", "authority_reframe"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not begin with 'A word of advice.'",
      "Do not make the five checks overlap.",
      "Do not use vague checks such as 'have a strategy' without defining what that means.",
      "Do not explain every checklist item in detail.",
      "Do not frame the action itself as wrong when the real issue is timing or readiness.",
      "Do not use a generic bad outcome when a specific failure can be named.",
    ],
  }),

  t({
    id: "checklist_02",
    name: "Signs You Need to Fix X",
    archetype: "Checklist",
    variant: "Escalation-led warning signs",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Get inbound leads", "Grow my audience", "Build authority"],

    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `[problem area] rarely breaks all at once.

It starts with signals like these:

→ [sign 1]

→ [sign 2]

→ [sign 3]

→ [sign 4]

→ [sign 5]

The most serious signal is [biggest sign].

That usually means [deeper meaning].

At that point, the issue is already affecting [affected outcome].

Most [audience] wait until [late consequence] before acting.

That makes the fix slower, more expensive, and harder to isolate.

Address [priority issue] while the signals are still small.

[cta]`,

    variables: [
      "problem area",
      "sign 1",
      "sign 2",
      "sign 3",
      "sign 4",
      "sign 5",
      "biggest sign",
      "deeper meaning",
      "affected outcome",
      "audience",
      "late consequence",
      "priority issue",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what problem area should they monitor?",
        fills: ["audience", "problem area"],
      },
      {
        question: "What five observable signs show that this area is weakening?",
        fills: ["sign 1", "sign 2", "sign 3", "sign 4", "sign 5"],
      },
      {
        question: "Which sign is the strongest warning, and what does it reveal beneath the surface?",
        fills: ["biggest sign", "deeper meaning"],
      },
      {
        question: "What important result, metric, relationship, or process does that warning sign begin to affect?",
        fills: ["affected outcome"],
      },
      {
        question: "What late-stage consequence usually forces people to act?",
        fills: ["late consequence"],
      },
      {
        question: "What specific issue should they address first while the warning signs are still manageable?",
        fills: ["priority issue"],
      },
    ],

    ctaStyles: ["diagnostic", "conversation", "soft_lead", "problem_solution"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use signs that are merely different descriptions of the same symptom.",
      "Do not use vague warning signs that the audience cannot observe.",
      "Do not call one sign the biggest warning without explaining why.",
      "Do not exaggerate the late consequence.",
      "Do not imply that every sign must be present before action is needed.",
      "Do not make the post sound like medical advice unless the topic is explicitly medical and properly supported.",
    ],
  }),

  t({
    id: "checklist_03",
    name: "Decision Questions",
    archetype: "Checklist",
    variant: "Trade-off-led decision filter",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Build network"],

    bestForPillars: ["Problem education", "Process / how-I-work", "Values / philosophy"],

    template: `A weak question can ruin an important [decision].

Before choosing, ask:

→ [question 1]

→ [question 2]

→ [question 3]

→ [question 4]

→ [question 5]

Most [audience] focus on:

"[shallow question]"

That pushes the decision toward [weak basis].

But the real trade-off is [core trade-off].

A stronger decision comes from [strong basis].

So replace:

"[shallow question]"

With:

"[better question]"

The quality of the decision depends on the quality of the question.

[cta]`,

    variables: [
      "decision",
      "question 1",
      "question 2",
      "question 3",
      "question 4",
      "question 5",
      "audience",
      "shallow question",
      "weak basis",
      "core trade-off",
      "strong basis",
      "better question",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what decision do they commonly struggle to make?",
        fills: ["audience", "decision"],
      },
      {
        question: "What five questions would help them evaluate that decision from different angles?",
        fills: ["question 1", "question 2", "question 3", "question 4", "question 5"],
      },
      {
        question: "What shallow question do people usually ask first?",
        fills: ["shallow question"],
      },
      {
        question: "What weak basis does that question cause them to prioritize, such as price, speed, popularity, convenience, or appearances?",
        fills: ["weak basis"],
      },
      {
        question: "What is the real trade-off behind the decision?",
        fills: ["core trade-off"],
      },
      {
        question: "What stronger basis should guide the decision instead?",
        fills: ["strong basis"],
      },
      {
        question: "What single better question would most improve the final decision?",
        fills: ["better question"],
      },
    ],

    ctaStyles: ["diagnostic", "peer_question", "authority_reframe", "conversation"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use five versions of the same question.",
      "Do not include questions that can be answered without affecting the decision.",
      "Do not use a shallow question that nobody realistically asks.",
      "Do not present the decision as having one universally correct answer.",
      "Do not ignore meaningful trade-offs.",
      "Do not repeat the better question elsewhere in the checklist.",
    ],
  }),

  t({
    id: "checklist_04",
    name: "What Good Looks Like",
    archetype: "Checklist",
    variant: "Observable quality standards",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get job opportunities", "Promote my product/service"],

    bestForPillars: ["Values / philosophy", "Process / how-I-work", "Audience belief shift"],

    template: `Most people say they want better [topic].

Very few define what "better" means.

Strong [topic] should be:

→ [standard 1]

→ [standard 2]

→ [standard 3]

→ [standard 4]

→ [standard 5]

These standards matter because [reason standards matter].

Without them, [audience] default to [wrong metric].

That produces [misleading result].

A useful standard should help you decide:

→ What to keep.

→ What to reject.

→ What to improve next.

Do not ask whether [topic] looks impressive.

Ask whether it produces [meaningful outcome] under [real-world condition].

That is what good looks like.

[cta]`,

    variables: [
      "topic",
      "standard 1",
      "standard 2",
      "standard 3",
      "standard 4",
      "standard 5",
      "reason standards matter",
      "audience",
      "wrong metric",
      "misleading result",
      "meaningful outcome",
      "real-world condition",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what topic or area do they vaguely want to improve?",
        fills: ["audience", "topic"],
      },
      {
        question: "What five observable standards define high quality in that area?",
        fills: ["standard 1", "standard 2", "standard 3", "standard 4", "standard 5"],
      },
      {
        question: "Why do these standards matter in practice?",
        fills: ["reason standards matter"],
      },
      {
        question: "What easy but misleading metric do people use when clear standards are missing?",
        fills: ["wrong metric"],
      },
      {
        question: "What misleading result does that metric create or reward?",
        fills: ["misleading result"],
      },
      {
        question: "What meaningful outcome should strong performance produce?",
        fills: ["meaningful outcome"],
      },
      {
        question: "Under what real-world condition should the work still perform well?",
        fills: ["real-world condition"],
      },
    ],

    ctaStyles: ["belief_statement", "work_style", "offer_bridge", "authority_reframe"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not define quality with subjective words such as great, strong, clear, or professional without qualification.",
      "Do not use standards that cannot be observed or assessed.",
      "Do not make all five standards broad principles.",
      "Do not confuse an output metric with a quality standard.",
      "Do not criticize the wrong metric without naming the behavior it rewards.",
      "Do not claim that the standards apply equally in every context.",
    ],
  }),

  t({
    id: "checklist_05",
    name: "Quick Audit",
    archetype: "Checklist",
    variant: "Bottleneck-led self-audit",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Grow my audience"],

    bestForPillars: ["Problem education", "Process / how-I-work", "Mistakes and misconceptions"],

    template: `You can audit [topic] in less than [audit duration].

Ask:

→ [audit question 1]

→ [audit question 2]

→ [audit question 3]

→ [audit question 4]

→ [audit question 5]

Do not treat every "no" equally.

The most important question is:

"[important question]"

A weak answer usually reveals [constraint].

Without [foundation], [desired outcome] becomes harder because [mechanism].

Start with [first corrective action].

Then rerun the audit after [review period].

Do not fix everything at once.

Fix the constraint that weakens everything else.

[cta]`,

    variables: [
      "topic",
      "audit duration",
      "audit question 1",
      "audit question 2",
      "audit question 3",
      "audit question 4",
      "audit question 5",
      "important question",
      "constraint",
      "foundation",
      "desired outcome",
      "mechanism",
      "first corrective action",
      "review period",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What should the audience audit, and how quickly can this audit realistically be completed?",
        fills: ["topic", "audit duration"],
      },
      {
        question: "What five clear questions should the audience answer during the audit?",
        fills: ["audit question 1", "audit question 2", "audit question 3", "audit question 4", "audit question 5"],
      },
      {
        question: "Which audit question is the most important?",
        fills: ["important question"],
      },
      {
        question: "What bottleneck or constraint does a weak answer to that question reveal?",
        fills: ["constraint"],
      },
      {
        question: "What foundation does the desired result depend on?",
        fills: ["foundation"],
      },
      {
        question: "What outcome is the audience trying to achieve, and why does a weak foundation make it harder?",
        fills: ["desired outcome", "mechanism"],
      },
      {
        question: "What is the first corrective action they should take?",
        fills: ["first corrective action"],
      },
      {
        question: "When should they rerun the audit to check whether the corrective action worked?",
        fills: ["review period"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "conversation", "offer_bridge"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not write audit questions as incomplete sentence fragments.",
      "Do not make every audit question a simple yes-or-no check unless the answer is objectively clear.",
      "Do not make all five questions equally important.",
      "Do not identify a constraint without explaining how it affects the desired outcome.",
      "Do not recommend fixing every weakness at once.",
      "Do not promise that the audit can be completed quickly unless the stated duration is realistic.",
      "Do not use a review period that is too short for the corrective action to produce evidence.",
    ],
  }),
  //
  t({
    id: "contrarian_take_01",
    name: "Most People Have This Backwards",
    archetype: "Contrarian Take",
    variant: "Consequence-led belief reversal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Build network"],

    bestForPillars: ["Point of view", "Audience belief shift", "Mistakes and misconceptions"],

    template: `[common belief] sounds right.

But it pushes [audience] toward the wrong behaviors.

They start to:

→ [bad behavior 1]

→ [bad behavior 2]

→ [bad behavior 3]

The result is [negative consequence].

I believe the opposite:

[opposite belief].

That belief changes the behavior.

You begin to:

→ [better behavior 1]

→ [better behavior 2]

→ [better behavior 3]

I learned this after [proof or experience].

The real shift is from [old frame] to [new frame].

That is what produces [desired outcome].

[cta]`,

    variables: [
      "common belief",
      "audience",
      "bad behavior 1",
      "bad behavior 2",
      "bad behavior 3",
      "negative consequence",
      "opposite belief",
      "better behavior 1",
      "better behavior 2",
      "better behavior 3",
      "proof or experience",
      "old frame",
      "new frame",
      "desired outcome",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what common belief in your space do you think they have backwards?",
        fills: ["audience", "common belief"],
      },
      {
        question: "What three unhelpful behaviors does that belief encourage?",
        fills: ["bad behavior 1", "bad behavior 2", "bad behavior 3"],
      },
      {
        question: "What specific negative consequence do those behaviors create?",
        fills: ["negative consequence"],
      },
      {
        question: "What do you believe instead?",
        fills: ["opposite belief"],
      },
      {
        question: "What three better behaviors follow from your belief?",
        fills: ["better behavior 1", "better behavior 2", "better behavior 3"],
      },
      {
        question: "What experience, observation, client pattern, or result changed or confirmed your view?",
        fills: ["proof or experience"],
      },
      {
        question: "What old frame should the audience leave behind, and what new frame should replace it?",
        fills: ["old frame", "new frame"],
      },
      {
        question: "What meaningful outcome does the new frame help produce?",
        fills: ["desired outcome"],
      },
    ],

    ctaStyles: ["authority_reframe", "industry_prompt", "agree_disagree", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not make the opposing belief extreme just to attract attention.",
      "Do not use an opposite belief that is merely a rewording of the common belief.",
      "Do not attack people who hold the common belief.",
      "Do not claim the new belief produces better results without explaining the behavior change.",
      "Do not invent proof, experience, or results.",
      "Do not use vague frames such as mindset, value, or quality without defining them.",
    ],
  }),

  t({
    id: "contrarian_take_02",
    name: "The Uncomfortable Truth",
    archetype: "Contrarian Take",
    variant: "Avoidance-led uncomfortable truth",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Point of view", "Audience belief shift", "Problem education"],

    template: `The hardest truth about [topic] is this:

[uncomfortable truth].

People avoid saying it because [reason people avoid it].

That silence feels easier in the moment.

But it creates:

→ [bad outcome 1]

→ [bad outcome 2]

→ [bad outcome 3]

The honest reframe is:

[honest reframe].

That does not mean [misinterpretation].

It means [clarification].

The difference matters because [practical consequence].

Honesty without context becomes cruelty.

Context without honesty becomes avoidance.

You need both.

[cta]`,

    variables: [
      "topic",
      "uncomfortable truth",
      "reason people avoid it",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "honest reframe",
      "misinterpretation",
      "clarification",
      "practical consequence",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What topic are you addressing, and what uncomfortable truth does your audience need to hear?",
        fills: ["topic", "uncomfortable truth"],
      },
      {
        question: "Why do people avoid saying this directly?",
        fills: ["reason people avoid it"],
      },
      {
        question: "What three specific problems are created when people avoid this truth?",
        fills: ["bad outcome 1", "bad outcome 2", "bad outcome 3"],
      },
      {
        question: "How would you express the truth in a direct but constructive way?",
        fills: ["honest reframe"],
      },
      {
        question: "What might people wrongly assume your take means?",
        fills: ["misinterpretation"],
      },
      {
        question: "What do you actually mean?",
        fills: ["clarification"],
      },
      {
        question: "What practical decision or behavior changes when people understand this distinction?",
        fills: ["practical consequence"],
      },
    ],

    ctaStyles: ["authority_reframe", "agree_disagree", "conversation", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not insult, shame, or belittle the audience.",
      "Do not confuse cruelty with honesty.",
      "Do not use a truth that is obvious, generic, or impossible to challenge.",
      "Do not make the claim more absolute than the evidence supports.",
      "Do not use the clarification to repeat the uncomfortable truth.",
      "Do not invent evidence or imply universal agreement.",
      "Do not use this template for sensitive personal issues without appropriate care and context.",
    ],
  }),

  t({
    id: "contrarian_take_03",
    name: "Stop Optimizing the Wrong Thing",
    archetype: "Contrarian Take",
    variant: "Metric-led wrong focus",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],

    bestForPillars: ["Point of view", "Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `[audience] are getting better at [wrong thing].

That is part of the problem.

[wrong thing] feels productive because [why it feels useful].

It is easy to see.

It is easy to measure.

And it creates the appearance of [false signal of progress].

But optimizing it often leads to:

→ [bad outcome 1]

→ [bad outcome 2]

→ [bad outcome 3]

The stronger target is [right thing].

Because improving [right thing] leads to:

→ [better outcome 1]

→ [better outcome 2]

→ [better outcome 3]

Track [leading measure] instead of relying on [misleading measure].

The goal is not more [wrong thing].

The goal is [desired result].

[cta]`,

    variables: [
      "audience",
      "wrong thing",
      "why it feels useful",
      "false signal of progress",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "right thing",
      "better outcome 1",
      "better outcome 2",
      "better outcome 3",
      "leading measure",
      "misleading measure",
      "desired result",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what do they spend too much time optimizing?",
        fills: ["audience", "wrong thing"],
      },
      {
        question: "Why does that target feel useful or productive?",
        fills: ["why it feels useful"],
      },
      {
        question: "What false signal makes people believe they are making progress?",
        fills: ["false signal of progress"],
      },
      {
        question: "What three negative outcomes result from optimizing the wrong thing?",
        fills: ["bad outcome 1", "bad outcome 2", "bad outcome 3"],
      },
      {
        question: "What should they optimize instead?",
        fills: ["right thing"],
      },
      {
        question: "What three better outcomes follow when they improve the right thing?",
        fills: ["better outcome 1", "better outcome 2", "better outcome 3"],
      },
      {
        question: "What leading measure should they track, and what misleading measure should receive less attention?",
        fills: ["leading measure", "misleading measure"],
      },
      {
        question: "What final result are they actually trying to create?",
        fills: ["desired result"],
      },
    ],

    ctaStyles: ["diagnostic", "authority_reframe", "conversation", "problem_solution"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not argue that the wrong thing has zero value.",
      "Do not replace one vanity metric with another.",
      "Do not use measures that the audience cannot realistically track.",
      "Do not confuse an activity with an outcome.",
      "Do not claim causation without explaining the mechanism.",
      "Do not use three bad outcomes that describe the same consequence.",
      "Do not recommend the right thing without connecting it to the desired result.",
    ],
  }),

  t({
    id: "contrarian_take_04",
    name: "Everyone Says X, I See Y",
    archetype: "Contrarian Take",
    variant: "Evidence-led public narrative challenge",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Build network"],

    bestForPillars: ["Point of view", "Market / industry observation", "Audience belief shift"],

    template: `The market keeps repeating [popular narrative].

The evidence I see points somewhere else.

Across [observation context], I keep seeing [observed reality].

The pattern shows up in:

→ [signal 1]

→ [signal 2]

→ [signal 3]

The public conversation focuses on [surface conversation].

But those signals point to [real issue].

That distinction matters because [practical consequence].

If [real issue] is the real constraint, then [common response] will not solve it.

A better response is [better response].

So I would stop asking:

"[old question]"

And start asking:

"[better question]"

[cta]`,

    variables: [
      "popular narrative",
      "observation context",
      "observed reality",
      "signal 1",
      "signal 2",
      "signal 3",
      "surface conversation",
      "real issue",
      "practical consequence",
      "common response",
      "better response",
      "old question",
      "better question",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What popular narrative does your industry or audience keep repeating?",
        fills: ["popular narrative", "surface conversation"],
      },
      {
        question:
          "Where are your observations coming from, such as client work, customer conversations, market data, hiring, sales calls, or personal experience?",
        fills: ["observation context"],
      },
      {
        question: "What reality are you consistently observing instead?",
        fills: ["observed reality"],
      },
      {
        question: "What three concrete signals support your observation?",
        fills: ["signal 1", "signal 2", "signal 3"],
      },
      {
        question: "What deeper issue do those signals reveal?",
        fills: ["real issue"],
      },
      {
        question: "Why does the difference between the public narrative and the real issue matter in practice?",
        fills: ["practical consequence"],
      },
      {
        question: "What common response follows from the popular narrative, and why is it insufficient?",
        fills: ["common response"],
      },
      {
        question: "What response would better address the issue you are observing?",
        fills: ["better response"],
      },
      {
        question: "What question is the industry currently asking, and what better question should replace it?",
        fills: ["old question", "better question"],
      },
    ],

    ctaStyles: ["industry_prompt", "peer_question", "authority_reframe", "agree_disagree"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not use 'everyone' literally when the narrative is not widespread.",
      "Do not present personal anecdotes as complete market evidence.",
      "Do not invent trends, data, customer behavior, or industry signals.",
      "Do not use three signals that all come from the same isolated event.",
      "Do not challenge a public narrative without offering a practical alternative.",
      "Do not imply that the popular narrative is entirely false when it may only be incomplete.",
      "Do not use a better question that simply restates the real issue.",
    ],
  }),

  t({
    id: "contrarian_take_05",
    name: "Advice I No Longer Give",
    archetype: "Contrarian Take",
    variant: "Experience-led changed conviction",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Build network"],

    bestForPillars: ["Point of view", "Personal story", "Mistakes and misconceptions"],

    template: `I stopped giving this advice:

"[old advice]"

For a long time, I believed it because [why it seemed right].

Then [turning point] changed my mind.

I started noticing the same pattern:

→ [problem 1]

→ [problem 2]

→ [problem 3]

The advice worked when [condition where old advice worked].

It failed when [condition where old advice failed].

That distinction was missing.

Now I say:

"[new advice]"

Because [reason new advice is better].

The lesson was not that [old advice] is always wrong.

The lesson was that advice without [missing context] becomes misleading.

Specific advice helps people make better decisions.

[cta]`,

    variables: [
      "old advice",
      "why it seemed right",
      "turning point",
      "problem 1",
      "problem 2",
      "problem 3",
      "condition where old advice worked",
      "condition where old advice failed",
      "new advice",
      "reason new advice is better",
      "missing context",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What advice did you previously give or believe?",
        fills: ["old advice"],
      },
      {
        question: "Why did that advice seem correct at the time?",
        fills: ["why it seemed right"],
      },
      {
        question: "What experience, result, failure, conversation, or observation caused you to reconsider it?",
        fills: ["turning point"],
      },
      {
        question: "What three problems did you repeatedly see the old advice create?",
        fills: ["problem 1", "problem 2", "problem 3"],
      },
      {
        question: "Under what conditions did the old advice still work?",
        fills: ["condition where old advice worked"],
      },
      {
        question: "Under what conditions did the old advice fail?",
        fills: ["condition where old advice failed"],
      },
      {
        question: "What advice would you give now instead?",
        fills: ["new advice"],
      },
      {
        question: "Why is the new advice more useful or accurate?",
        fills: ["reason new advice is better"],
      },
      {
        question: "What important context, condition, or qualification was missing from the old advice?",
        fills: ["missing context"],
      },
    ],

    ctaStyles: ["authority_reframe", "relatable", "conversation", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not pretend your view changed when it did not.",
      "Do not invent a turning point or personal experience.",
      "Do not portray the old advice as universally wrong when it worked in specific conditions.",
      "Do not replace broad old advice with equally broad new advice.",
      "Do not make the story about personal growth without giving the audience a useful distinction.",
      "Do not criticize people who still give the old advice.",
      "Do not use problems that have no clear connection to the old advice.",
    ],
  }),
  //
  t({
    id: "mini_case_study_01",
    name: "Hidden Bottleneck",
    archetype: "Mini Case Study",
    variant: "Diagnosis-led root cause case",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],

    bestForPillars: ["Proof / case study", "Problem education", "Audience belief shift"],

    template: `[case subject] came to us with [surface problem].

The obvious explanation was [obvious diagnosis].

That would have led us straight to [wrong fix].

But [diagnostic clue] did not fit that diagnosis.

After reviewing [area investigated], we found the real bottleneck:

[root cause].

So we focused on [actual fix] instead.

Over [time period], three things changed:

→ [change 1]

→ [change 2]

→ [change 3]

The most important result was [primary result].

The lesson was simple:

Do not prescribe a fix for [surface problem] until you know what is creating it.

The visible problem tells you where to look.

It does not always tell you what to fix.

[cta]`,

    variables: [
      "case subject",
      "surface problem",
      "obvious diagnosis",
      "wrong fix",
      "diagnostic clue",
      "area investigated",
      "root cause",
      "actual fix",
      "time period",
      "change 1",
      "change 2",
      "change 3",
      "primary result",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Can you describe the client, customer, project, person, or team anonymously?",
        fills: ["case subject"],
      },
      {
        question: "What visible problem did they originally bring to you?",
        fills: ["surface problem"],
      },
      {
        question: "What looked like the obvious diagnosis, and what fix would that diagnosis normally suggest?",
        fills: ["obvious diagnosis", "wrong fix"],
      },
      {
        question: "What clue made you question the obvious diagnosis?",
        fills: ["diagnostic clue"],
      },
      {
        question: "What did you review, test, analyze, or investigate to find the real issue?",
        fills: ["area investigated"],
      },
      {
        question: "What was the real root cause?",
        fills: ["root cause"],
      },
      {
        question: "What did you do differently once you found the root cause?",
        fills: ["actual fix"],
      },
      {
        question: "Over what period did the results appear?",
        fills: ["time period"],
      },
      {
        question: "What three specific changes followed the intervention?",
        fills: ["change 1", "change 2", "change 3"],
      },
      {
        question: "Which result mattered most to the client, customer, project, person, or team?",
        fills: ["primary result"],
      },
    ],

    ctaStyles: ["soft_lead", "diagnostic", "problem_solution", "offer_bridge"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not invent a case when no real case exists.",
      "Do not invent metrics, timelines, quotes, or results.",
      "Do not reveal identifying or confidential information.",
      "Do not make the obvious diagnosis sound unreasonable if it was supported by the initial evidence.",
      "Do not claim the actual fix caused every observed change unless the evidence supports that conclusion.",
      "Do not use a vague root cause such as strategy, clarity, positioning, or mindset without explaining it.",
    ],
  }),

  t({
    id: "mini_case_study_02",
    name: "Small Change, Big Difference",
    archetype: "Mini Case Study",
    variant: "Constraint-led small intervention",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service", "Build authority"],

    bestForPillars: ["Proof / case study", "Process / how-I-work", "Problem education"],

    template: `We changed one part of [process or system].

It improved [primary outcome] without requiring [large alternative].

Before the change:

→ [before 1]

→ [before 2]

→ [before 3]

The constraint was [specific constraint].

So instead of rebuilding [larger system], we changed [small change].

That took [implementation effort].

Over [measurement period], we saw:

→ [after 1]

→ [after 2]

→ [after 3]

The change worked because it removed [mechanism of constraint].

The size of an intervention does not determine its value.

Its position in the system does.

Find the constraint before adding more work.

[cta]`,

    variables: [
      "process or system",
      "primary outcome",
      "large alternative",
      "before 1",
      "before 2",
      "before 3",
      "specific constraint",
      "larger system",
      "small change",
      "implementation effort",
      "measurement period",
      "after 1",
      "after 2",
      "after 3",
      "mechanism of constraint",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What process, workflow, offer, campaign, habit, or system did you change?",
        fills: ["process or system"],
      },
      {
        question: "What primary outcome improved?",
        fills: ["primary outcome"],
      },
      {
        question: "What larger, slower, or more expensive change did this intervention help avoid?",
        fills: ["large alternative", "larger system"],
      },
      {
        question: "What three observable conditions described the situation before the change?",
        fills: ["before 1", "before 2", "before 3"],
      },
      {
        question: "What specific constraint was limiting the result?",
        fills: ["specific constraint"],
      },
      {
        question: "What small change did you make?",
        fills: ["small change"],
      },
      {
        question: "How much time, money, or effort did the change require?",
        fills: ["implementation effort"],
      },
      {
        question: "Over what period did you measure the impact?",
        fills: ["measurement period"],
      },
      {
        question: "What three specific differences appeared after the change?",
        fills: ["after 1", "after 2", "after 3"],
      },
      {
        question: "Why did this small change remove or reduce the constraint?",
        fills: ["mechanism of constraint"],
      },
    ],

    ctaStyles: ["soft_lead", "offer_bridge", "belief_statement", "diagnostic"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not exaggerate the size or significance of the outcome.",
      "Do not call the change small without explaining what it required.",
      "Do not claim the intervention was the sole cause when other material changes happened at the same time.",
      "Do not invent before-and-after metrics.",
      "Do not use before and after statements that cannot be compared.",
      "Do not omit the mechanism that explains why the intervention worked.",
      "Do not imply that small changes always produce large results.",
    ],
  }),

  t({
    id: "mini_case_study_03",
    name: "First Attempt Failed",
    archetype: "Mini Case Study",
    variant: "Failure-led learning case",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Build network"],

    bestForPillars: ["Proof / case study", "Mistakes and misconceptions", "Process / how-I-work"],

    template: `Our first attempt at [goal] failed.

We tried [first attempt].

At the time, it made sense because [why it made sense].

But within [failure time frame], the warning signs were clear:

→ [problem 1]

→ [problem 2]

→ [problem 3]

The most useful signal was [revealing signal].

It showed us that [original assumption] was wrong.

The real issue was [insight].

So we changed the approach to [new approach].

This time, we [key implementation difference].

Over [result time frame], that led to [result].

The failed attempt was valuable because it replaced an assumption with evidence.

Failure only teaches you something when you study what failed.

[cta]`,

    variables: [
      "goal",
      "first attempt",
      "why it made sense",
      "failure time frame",
      "problem 1",
      "problem 2",
      "problem 3",
      "revealing signal",
      "original assumption",
      "insight",
      "new approach",
      "key implementation difference",
      "result time frame",
      "result",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real goal, project, or result were you trying to achieve?",
        fills: ["goal"],
      },
      {
        question: "What did you try first?",
        fills: ["first attempt"],
      },
      {
        question: "Why did that first attempt seem reasonable at the time?",
        fills: ["why it made sense"],
      },
      {
        question: "How quickly did you realize the first attempt was not working?",
        fills: ["failure time frame"],
      },
      {
        question: "What three specific problems or warning signs appeared?",
        fills: ["problem 1", "problem 2", "problem 3"],
      },
      {
        question: "Which signal revealed the most about why the attempt failed?",
        fills: ["revealing signal"],
      },
      {
        question: "What assumption did that signal prove wrong?",
        fills: ["original assumption"],
      },
      {
        question: "What did the failed attempt reveal about the real problem?",
        fills: ["insight"],
      },
      {
        question: "What approach did you try next?",
        fills: ["new approach"],
      },
      {
        question: "What did you implement differently the second time?",
        fills: ["key implementation difference"],
      },
      {
        question: "What honest result followed, and over what period?",
        fills: ["result", "result time frame"],
      },
    ],

    ctaStyles: ["relatable", "diagnostic", "authority_reframe", "conversation"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not make the failure sound like manufactured humility.",
      "Do not invent mistakes, setbacks, or lessons.",
      "Do not describe the first attempt as foolish when it was reasonable based on the available information.",
      "Do not hide your role in the failed decision.",
      "Do not jump from failure to success without explaining what changed.",
      "Do not claim the second approach worked without naming an observable result.",
      "Do not turn the case study into a generic motivational post about failure.",
    ],
  }),

  t({
    id: "mini_case_study_04",
    name: "Pattern Behind the Result",
    archetype: "Mini Case Study",
    variant: "Process-led outcome breakdown",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Promote my product/service", "Get job opportunities"],

    bestForPillars: ["Proof / case study", "Career / credibility proof", "Process / how-I-work"],

    template: `[result] looks like one breakthrough from the outside.

It was built through [time period] of repeated execution.

The pattern was:

→ [action 1]

→ [action 2]

→ [action 3]

→ [action 4]

None of those actions looked dramatic on its own.

Together, they created [compounding effect].

The visible result was [visible result].

The invisible work was [invisible work].

The hardest part was [hardest part].

The turning point came when [turning point].

That is the part a final number, launch, promotion, or announcement rarely shows.

Results become more useful when you explain the pattern that produced them.

[cta]`,

    variables: [
      "result",
      "time period",
      "action 1",
      "action 2",
      "action 3",
      "action 4",
      "compounding effect",
      "visible result",
      "invisible work",
      "hardest part",
      "turning point",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real result, project outcome, milestone, or achievement can you honestly discuss?",
        fills: ["result", "visible result"],
      },
      {
        question: "Over what period was the result created?",
        fills: ["time period"],
      },
      {
        question: "What four repeated actions contributed most to the result?",
        fills: ["action 1", "action 2", "action 3", "action 4"],
      },
      {
        question: "How did those actions reinforce one another over time?",
        fills: ["compounding effect"],
      },
      {
        question: "What important work happened behind the scenes that other people did not see?",
        fills: ["invisible work"],
      },
      {
        question: "What was the hardest part of maintaining the process?",
        fills: ["hardest part"],
      },
      {
        question: "Was there a moment, decision, or change that caused the work to start producing visible results?",
        fills: ["turning point"],
      },
    ],

    ctaStyles: ["belief_statement", "career_signal", "offer_bridge", "authority_reframe"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not invent metrics, milestones, or repeated actions.",
      "Do not attribute the full result to your own work when other people made material contributions.",
      "Do not present correlation as proven causation.",
      "Do not include four actions that describe the same activity.",
      "Do not make the invisible work sound more dramatic than it was.",
      "Do not hide important context that materially affected the result.",
      "Do not imply that repeating the same actions guarantees the same outcome for everyone.",
    ],
  }),

  t({
    id: "mini_case_study_05",
    name: "Came for X, Needed Y",
    archetype: "Mini Case Study",
    variant: "Request-led diagnostic reframe",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service", "Build authority"],

    bestForPillars: ["Proof / case study", "Problem education", "Audience belief shift"],

    template: `[case subject] asked us for [initial request].

Their reason was straightforward:

They wanted to [surface goal].

Delivering [requested thing] would have been easy.

It also would have left [underlying problem] untouched.

The clue was [diagnostic clue].

After [discovery process], we found that they actually needed [actual need].

So instead of [requested thing], we worked on [better thing].

That led to three realizations:

→ [realization 1]

→ [realization 2]

→ [realization 3]

The immediate result was [immediate result].

The longer-term impact was [long-term impact].

The first request was not wrong.

It was based on the information they had before the diagnosis was clear.

Good delivery starts by understanding the request.

Good advisory work starts by testing it.

[cta]`,

    variables: [
      "case subject",
      "initial request",
      "surface goal",
      "requested thing",
      "underlying problem",
      "diagnostic clue",
      "discovery process",
      "actual need",
      "better thing",
      "realization 1",
      "realization 2",
      "realization 3",
      "immediate result",
      "long-term impact",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Can you describe the client, customer, person, or team anonymously?",
        fills: ["case subject"],
      },
      {
        question: "What did they initially ask you to provide or help with?",
        fills: ["initial request", "requested thing"],
      },
      {
        question: "What result were they hoping that request would produce?",
        fills: ["surface goal"],
      },
      {
        question: "What underlying problem would the requested solution have left unresolved?",
        fills: ["underlying problem"],
      },
      {
        question: "What clue suggested that the initial request was not the full issue?",
        fills: ["diagnostic clue"],
      },
      {
        question: "What conversation, audit, research, assessment, or discovery process helped reveal the actual need?",
        fills: ["discovery process"],
      },
      {
        question: "What did they actually need?",
        fills: ["actual need"],
      },
      {
        question: "What did you work on instead of simply delivering the requested item?",
        fills: ["better thing"],
      },
      {
        question: "What three useful realizations came from reframing the request?",
        fills: ["realization 1", "realization 2", "realization 3"],
      },
      {
        question: "What immediate result followed the new approach?",
        fills: ["immediate result"],
      },
      {
        question: "What longer-term impact appeared, if enough time has passed to observe one?",
        fills: ["long-term impact"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "problem_solution", "offer_bridge"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not invent a client, request, discovery process, or result.",
      "Do not portray the client as uninformed or foolish.",
      "Do not imply that every initial request is wrong.",
      "Do not reframe the request only to force the case toward your service.",
      "Do not reveal confidential or identifying information.",
      "Do not claim a long-term impact when insufficient time has passed.",
      "Do not present the actual need as obvious when discovery was required to uncover it.",
    ],
  }),
  //
  t({
    id: "before_after_01",
    name: "Before and After Shift",
    archetype: "Before / After",
    variant: "Evidence-led transformation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service", "Get job opportunities"],

    bestForPillars: ["Career / credibility proof", "Proof / case study", "Process / how-I-work"],

    template: `[change] changed more than [obvious outcome].
  
  Before:
  
  → [before state 1]
  
  → [before state 2]
  
  → [before state 3]
  
  Then we changed [specific intervention].
  
  Over [time period], the situation became:
  
  → [after state 1]
  
  → [after state 2]
  
  → [after state 3]
  
  The visible difference was [obvious change].
  
  The deeper difference was [deeper change].
  
  That mattered because [why deeper change mattered].
  
  The result lasted because the way [case subject] operated had changed.
  
  The outcome was evidence of the transformation.
  
  It was not the whole transformation.
  
  [cta]`,

    variables: [
      "change",
      "obvious outcome",
      "before state 1",
      "before state 2",
      "before state 3",
      "specific intervention",
      "time period",
      "after state 1",
      "after state 2",
      "after state 3",
      "obvious change",
      "deeper change",
      "why deeper change mattered",
      "case subject",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who or what experienced the transformation, and what overall change took place?",
        fills: ["case subject", "change"],
      },
      {
        question: "What obvious outcome were you initially trying to improve?",
        fills: ["obvious outcome"],
      },
      {
        question: "What three specific conditions describe the situation before the change?",
        fills: ["before state 1", "before state 2", "before state 3"],
      },
      {
        question: "What specific intervention, decision, system, or behavior created the shift?",
        fills: ["specific intervention"],
      },
      {
        question: "Over what period did the transformation become visible?",
        fills: ["time period"],
      },
      {
        question: "What three directly comparable conditions describe the situation afterward?",
        fills: ["after state 1", "after state 2", "after state 3"],
      },
      {
        question: "What visible change would an outside observer notice first?",
        fills: ["obvious change"],
      },
      {
        question: "What deeper capability, behavior, process, or belief changed beneath the visible result?",
        fills: ["deeper change"],
      },
      {
        question: "Why did that deeper change make the result more durable or valuable?",
        fills: ["why deeper change mattered"],
      },
    ],

    ctaStyles: ["soft_lead", "offer_bridge", "career_signal", "problem_solution"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent the transformation, timeline, intervention, or results.",
      "Do not compare before and after states that measure different things.",
      "Do not exaggerate how bad the starting point was.",
      "Do not exaggerate how complete the final transformation was.",
      "Do not attribute the entire change to one intervention when other factors contributed.",
      "Do not use a vague deeper change such as confidence, clarity, or mindset without explaining what changed in practice.",
      "Do not claim the result lasted unless enough time has passed to support that claim.",
    ],
  }),

  t({
    id: "before_after_02",
    name: "Messy to Clear",
    archetype: "Before / After",
    variant: "Decision-led clarity transformation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority", "Get job opportunities"],

    bestForPillars: ["Career / credibility proof", "Process / how-I-work", "Problem education"],

    template: `[situation] did not need more ideas.
  
  It needed one clear decision.
  
  At the start, there was:
  
  → [messy part 1]
  
  → [messy part 2]
  
  → [messy part 3]
  
  The confusion came from [source of confusion].
  
  The turning point was [clarifying move].
  
  That gave us a clear view of:
  
  → [clear insight 1]
  
  → [clear insight 2]
  
  → [clear insight 3]
  
  The next decision became [next decision].
  
  That led to [practical result].
  
  Clarity did not solve every part of the problem.
  
  It removed the uncertainty blocking the next move.
  
  Progress started when the decision became easier to make.
  
  [cta]`,

    variables: [
      "situation",
      "messy part 1",
      "messy part 2",
      "messy part 3",
      "source of confusion",
      "clarifying move",
      "clear insight 1",
      "clear insight 2",
      "clear insight 3",
      "next decision",
      "practical result",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real situation, project, process, or decision had become messy or unclear?",
        fills: ["situation"],
      },
      {
        question: "What three specific signs showed that the situation lacked clarity?",
        fills: ["messy part 1", "messy part 2", "messy part 3"],
      },
      {
        question: "What was creating the confusion beneath those symptoms?",
        fills: ["source of confusion"],
      },
      {
        question: "What exercise, question, conversation, analysis, decision, or framework created clarity?",
        fills: ["clarifying move"],
      },
      {
        question: "What three useful insights became clear afterward?",
        fills: ["clear insight 1", "clear insight 2", "clear insight 3"],
      },
      {
        question: "What specific next decision became easier once the situation was clear?",
        fills: ["next decision"],
      },
      {
        question: "What practical result followed from making that decision?",
        fills: ["practical result"],
      },
    ],

    ctaStyles: ["diagnostic", "belief_statement", "work_style", "soft_lead"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not use messy or clear as substitutes for specific details.",
      "Do not claim that clarity alone solved the full problem.",
      "Do not invent insights, decisions, or results.",
      "Do not list three messy parts that all describe general confusion.",
      "Do not use a clarifying move that has no clear connection to the new insights.",
      "Do not end the case before explaining what decision the clarity enabled.",
      "Do not turn the post into generic advice about gaining clarity.",
    ],
  }),

  t({
    id: "before_after_03",
    name: "Reactive to Intentional",
    archetype: "Before / After",
    variant: "System-led operating shift",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads"],

    bestForPillars: ["Process / how-I-work", "Audience belief shift", "Proof / case study"],

    template: `Every [trigger] used to force [case subject] into reaction mode.
  
  That looked like:
  
  → [reactive behavior 1]
  
  → [reactive behavior 2]
  
  → [reactive behavior 3]
  
  The cost was [cost of reacting].
  
  The issue was not a lack of effort.
  
  There was no reliable way to manage [deeper system].
  
  So we introduced [new system].
  
  The system created three new behaviors:
  
  → [intentional behavior 1]
  
  → [intentional behavior 2]
  
  → [intentional behavior 3]
  
  Over [time period], [measurable or observable result].
  
  The triggers did not disappear.
  
  The response changed.
  
  That is the difference between reacting to [trigger] and managing [deeper system] intentionally.
  
  [cta]`,

    variables: [
      "trigger",
      "case subject",
      "reactive behavior 1",
      "reactive behavior 2",
      "reactive behavior 3",
      "cost of reacting",
      "deeper system",
      "new system",
      "intentional behavior 1",
      "intentional behavior 2",
      "intentional behavior 3",
      "time period",
      "measurable or observable result",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who was operating reactively, and what recurring trigger kept forcing that response?",
        fills: ["case subject", "trigger"],
      },
      {
        question: "What three observable behaviors showed that they were reacting instead of operating intentionally?",
        fills: ["reactive behavior 1", "reactive behavior 2", "reactive behavior 3"],
      },
      {
        question: "What did reactive behavior cost in time, quality, money, focus, trust, or team capacity?",
        fills: ["cost of reacting"],
      },
      {
        question: "What broader process, workflow, responsibility, or system were they failing to manage consistently?",
        fills: ["deeper system"],
      },
      {
        question: "What concrete system, rule, process, schedule, or decision framework did you introduce?",
        fills: ["new system"],
      },
      {
        question: "What three intentional behaviors became possible after the new system was adopted?",
        fills: ["intentional behavior 1", "intentional behavior 2", "intentional behavior 3"],
      },
      {
        question: "Over what period did the new behavior become consistent?",
        fills: ["time period"],
      },
      {
        question: "What measurable or clearly observable result followed?",
        fills: ["measurable or observable result"],
      },
    ],

    ctaStyles: ["authority_reframe", "soft_lead", "diagnostic", "work_style"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not use mindset as the new system unless a specific behavior or process changed.",
      "Do not imply that intentional work eliminates unexpected events.",
      "Do not invent results, timelines, or behavior changes.",
      "Do not make reactive behavior sound like a personal character flaw.",
      "Do not list intentional behaviors that are unrelated to the original trigger.",
      "Do not claim a system worked without describing how behavior changed.",
      "Do not use operating system as an empty metaphor.",
    ],
  }),

  t({
    id: "before_after_04",
    name: "Invisible Before and After",
    archetype: "Before / After",
    variant: "Behavior-led internal transformation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Build authority", "Grow my audience", "Get job opportunities"],

    bestForPillars: ["Personal story", "Career / credibility proof", "Values / philosophy"],

    template: `People noticed [visible change].
  
  They did not see the transformation that came first.
  
  Before:
  
  → [internal before 1]
  
  → [internal before 2]
  
  → [internal before 3]
  
  The shift began with [turning point].
  
  Afterward:
  
  → [internal after 1]
  
  → [internal after 2]
  
  → [internal after 3]
  
  Those internal changes affected how [case subject] handled [relevant situation].
  
  That led to [visible change].
  
  The most important internal change was [internal change].
  
  You could see it through [behavioral evidence].
  
  The outside result attracted attention.
  
  The inside change made the result possible.
  
  [cta]`,

    variables: [
      "visible change",
      "internal before 1",
      "internal before 2",
      "internal before 3",
      "turning point",
      "internal after 1",
      "internal after 2",
      "internal after 3",
      "case subject",
      "relevant situation",
      "internal change",
      "behavioral evidence",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who experienced the transformation, and what external change did other people notice?",
        fills: ["case subject", "visible change"],
      },
      {
        question: "What three internal beliefs, habits, fears, assumptions, or decision patterns existed before the change?",
        fills: ["internal before 1", "internal before 2", "internal before 3"],
      },
      {
        question: "What real event, decision, realization, experience, or practice started the internal shift?",
        fills: ["turning point"],
      },
      {
        question: "What three internal patterns were different afterward?",
        fills: ["internal after 1", "internal after 2", "internal after 3"],
      },
      {
        question: "In what recurring situation did those internal changes become visible?",
        fills: ["relevant situation"],
      },
      {
        question: "Which internal change mattered most?",
        fills: ["internal change"],
      },
      {
        question: "What observable behavior proves that the internal change took place?",
        fills: ["behavioral evidence"],
      },
    ],

    ctaStyles: ["relatable", "belief_statement", "career_signal", "conversation"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent personal struggles, turning points, or emotional changes.",
      "Do not use vague internal shifts without observable behavioral evidence.",
      "Do not present private details about another person without permission.",
      "Do not imply that an internal change caused the visible result without explaining the connection.",
      "Do not make the internal before state unnecessarily dramatic.",
      "Do not romanticize burnout, fear, insecurity, or hardship.",
      "Do not claim to know another person's internal experience unless they shared it directly.",
    ],
  }),

  t({
    id: "before_after_05",
    name: "What Changed When We Stopped",
    archetype: "Before / After",
    variant: "Subtraction-led progress",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],

    bestForPillars: ["Mistakes and misconceptions", "Audience belief shift", "Personal story", "Process / how-I-work"],

    template: `Progress accelerated when we stopped [old behavior].
  
  Before, that behavior kept creating:
  
  → [bad outcome 1]
  
  → [bad outcome 2]
  
  → [bad outcome 3]
  
  We kept doing it because [reason old behavior continued].
  
  The turning point was [evidence or realization].
  
  So we removed [old behavior].
  
  We replaced it with [new behavior].
  
  Over [time period], that created:
  
  → [better outcome 1]
  
  → [better outcome 2]
  
  → [better outcome 3]
  
  The biggest improvement came from [primary improvement].
  
  We did not need another tactic.
  
  We needed to remove the behavior competing with the result we wanted.
  
  Sometimes progress starts with subtraction.
  
  [cta]`,

    variables: [
      "old behavior",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "reason old behavior continued",
      "evidence or realization",
      "new behavior",
      "time period",
      "better outcome 1",
      "better outcome 2",
      "better outcome 3",
      "primary improvement",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real behavior, process, tactic, commitment, or habit did you, your team, or a client stop?",
        fills: ["old behavior"],
      },
      {
        question: "What three specific problems did that behavior repeatedly create?",
        fills: ["bad outcome 1", "bad outcome 2", "bad outcome 3"],
      },
      {
        question: "Why did the behavior continue even though it was creating problems?",
        fills: ["reason old behavior continued"],
      },
      {
        question: "What evidence, event, result, or realization made it clear that the behavior needed to stop?",
        fills: ["evidence or realization"],
      },
      {
        question: "What behavior, rule, process, or priority replaced it?",
        fills: ["new behavior"],
      },
      {
        question: "Over what period did the effects of removing the old behavior become visible?",
        fills: ["time period"],
      },
      {
        question: "What three specific outcomes improved afterward?",
        fills: ["better outcome 1", "better outcome 2", "better outcome 3"],
      },
      {
        question: "Which improvement mattered most, and why?",
        fills: ["primary improvement"],
      },
    ],

    ctaStyles: ["authority_reframe", "relatable", "soft_lead", "conversation"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent the behavior, realization, timeline, or improvement.",
      "Do not imply that stopping an activity automatically caused every later result.",
      "Do not portray the old behavior as irrational when there was a legitimate reason it continued.",
      "Do not replace the old behavior with a vague concept such as focus or discipline.",
      "Do not make all three improved outcomes different versions of less noise.",
      "Do not claim subtraction was sufficient when an important replacement behavior was also required.",
      "Do not imply that doing less is always better.",
    ],
  }),
  //
  t({
    id: "mistake_lesson_01",
    name: "I Used to Think",
    archetype: "Mistake Lesson",
    variant: "Evidence-led changed belief",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority", "Build network"],

    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Point of view"],

    template: `I built [old behavior] around one belief:
  
  "[old belief]"
  
  For a while, it seemed to work.
  
  I saw [early evidence that supported belief].
  
  Then [moment of friction] exposed the limit.
  
  The clearest sign was [revealing evidence].
  
  That forced me to admit:
  
  [lesson].
  
  Now I work differently.
  
  → [new behavior 1]
  
  → [new behavior 2]
  
  → [new behavior 3]
  
  The belief changed first.
  
  The behavior followed.
  
  Growth started when I stopped defending what the evidence no longer supported.
  
  [cta]`,

    variables: [
      "old behavior",
      "old belief",
      "early evidence that supported belief",
      "moment of friction",
      "revealing evidence",
      "lesson",
      "new behavior 1",
      "new behavior 2",
      "new behavior 3",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What did you previously believe, and what behavior did that belief lead you to repeat?",
        fills: ["old belief", "old behavior"],
      },
      {
        question: "What early result or experience made the belief seem correct at first?",
        fills: ["early evidence that supported belief"],
      },
      {
        question: "What event, result, failure, or tension made you question the belief?",
        fills: ["moment of friction"],
      },
      {
        question: "What specific evidence made it clear that the old belief was no longer accurate or useful?",
        fills: ["revealing evidence"],
      },
      {
        question: "What lesson did you take from that experience?",
        fills: ["lesson"],
      },
      {
        question: "What three concrete behaviors do you follow now because your belief changed?",
        fills: ["new behavior 1", "new behavior 2", "new behavior 3"],
      },
    ],

    ctaStyles: ["relatable", "conversation", "authority_reframe", "shared_learning"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent a belief change, turning point, or supporting evidence.",
      "Do not make the old belief sound foolish if it was reasonable at the time.",
      "Do not claim the belief changed without showing what evidence challenged it.",
      "Do not use vague new behaviors such as be more intentional or work smarter.",
      "Do not turn the lesson into generic motivational advice.",
      "Do not present a temporary preference as a major personal transformation.",
    ],
  }),

  t({
    id: "mistake_lesson_02",
    name: "Mistake I Kept Repeating",
    archetype: "Mistake Lesson",
    variant: "Pattern-led repeated mistake",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority"],

    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Process / how-I-work"],

    template: `I made the same mistake in [recurring situation] more than once.
  
  The mistake was [mistake].
  
  Each time, it felt reasonable because [why it seemed reasonable].
  
  And each time, the pattern ended the same way:
  
  → [bad result 1]
  
  → [bad result 2]
  
  → [bad result 3]
  
  I kept treating [surface problem].
  
  The real problem was [real problem].
  
  The pattern finally became obvious when [pattern-breaking moment].
  
  Now I use [new behavior or rule].
  
  Before I act, I ask:
  
  "[preventive question]"
  
  That does not make every decision perfect.
  
  It stops me from repeating the same mistake without noticing it.
  
  [cta]`,

    variables: [
      "recurring situation",
      "mistake",
      "why it seemed reasonable",
      "bad result 1",
      "bad result 2",
      "bad result 3",
      "surface problem",
      "real problem",
      "pattern-breaking moment",
      "new behavior or rule",
      "preventive question",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "In what recurring situation did you repeat the same mistake?",
        fills: ["recurring situation"],
      },
      {
        question: "What mistake did you make more than once?",
        fills: ["mistake"],
      },
      {
        question: "Why did the mistake seem reasonable each time?",
        fills: ["why it seemed reasonable"],
      },
      {
        question: "What three specific results kept following the mistake?",
        fills: ["bad result 1", "bad result 2", "bad result 3"],
      },
      {
        question: "What surface-level problem were you trying to solve?",
        fills: ["surface problem"],
      },
      {
        question: "What deeper issue was actually causing the pattern?",
        fills: ["real problem"],
      },
      {
        question: "What event or repeated signal finally made the pattern obvious?",
        fills: ["pattern-breaking moment"],
      },
      {
        question: "What rule, process, or behavior do you use now to avoid repeating it?",
        fills: ["new behavior or rule"],
      },
      {
        question: "What question do you ask yourself before acting in a similar situation?",
        fills: ["preventive question"],
      },
    ],

    ctaStyles: ["relatable", "conversation", "belief_statement", "diagnostic"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent repeated failures or a pattern-breaking moment.",
      "Do not describe a one-time mistake as a repeated pattern.",
      "Do not blame other people for a mistake presented as your own.",
      "Do not use three bad results that describe the same consequence.",
      "Do not make the preventive question vague or rhetorical.",
      "Do not claim the new rule eliminates all future mistakes.",
      "Do not use fake humility to make yourself look more competent.",
    ],
  }),

  t({
    id: "mistake_lesson_03",
    name: "Lesson Learned Too Late",
    archetype: "Mistake Lesson",
    variant: "Cost-led late realization",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities"],

    bestForPillars: ["Personal story", "Career / credibility proof", "Mistakes and misconceptions"],

    template: `I paid for this lesson with [cost of learning].
  
  The lesson was:
  
  [lesson].
  
  Before I understood it, I believed [old belief].
  
  That belief kept me [old behavior].
  
  Over [time period], the cost showed up as:
  
  → [bad result 1]
  
  → [bad result 2]
  
  → [bad result 3]
  
  The turning point was [turning point].
  
  That changed my belief to:
  
  [new belief].
  
  Now I focus on:
  
  → [new focus 1]
  
  → [new focus 2]
  
  → [new focus 3]
  
  I wish I had learned it earlier.
  
  But learning it late still changed what I did next.
  
  [cta]`,

    variables: [
      "cost of learning",
      "lesson",
      "old belief",
      "old behavior",
      "time period",
      "bad result 1",
      "bad result 2",
      "bad result 3",
      "turning point",
      "new belief",
      "new focus 1",
      "new focus 2",
      "new focus 3",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What lesson did you learn later than you wish?",
        fills: ["lesson"],
      },
      {
        question: "What did learning it late cost you in time, money, energy, opportunity, trust, or progress?",
        fills: ["cost of learning"],
      },
      {
        question: "What did you believe before learning the lesson?",
        fills: ["old belief"],
      },
      {
        question: "What behavior did that old belief keep producing?",
        fills: ["old behavior"],
      },
      {
        question: "Over what period did the consequences build?",
        fills: ["time period"],
      },
      {
        question: "What three specific consequences came from the old belief and behavior?",
        fills: ["bad result 1", "bad result 2", "bad result 3"],
      },
      {
        question: "What event, result, conversation, or realization finally changed your view?",
        fills: ["turning point"],
      },
      {
        question: "What do you believe now?",
        fills: ["new belief"],
      },
      {
        question: "What three priorities or behaviors receive more attention now?",
        fills: ["new focus 1", "new focus 2", "new focus 3"],
      },
    ],

    ctaStyles: ["relatable", "career_signal", "conversation", "shared_learning"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not exaggerate the cost to make the lesson sound more important.",
      "Do not invent a turning point, timeline, or consequence.",
      "Do not make the lesson generic enough to apply to every situation.",
      "Do not present the old belief as obviously wrong in hindsight.",
      "Do not use three new focuses that are not connected to the lesson.",
      "Do not imply that learning something late makes the earlier cost worthwhile.",
      "Do not turn the post into regret without showing changed behavior.",
    ],
  }),

  t({
    id: "mistake_lesson_04",
    name: "What I Got Wrong About Success",
    archetype: "Mistake Lesson",
    variant: "Measure-led success reframe",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Grow my audience", "Build network"],

    bestForPillars: ["Personal story", "Values / philosophy", "Point of view"],

    template: `I was measuring success with [old measure].
  
  That shaped what I chased.
  
  → [old pursuit 1]
  
  → [old pursuit 2]
  
  → [old pursuit 3]
  
  From the outside, it looked like [visible sign of success].
  
  Behind the scenes, it cost [cost].
  
  The moment I questioned that definition was [redefining moment].
  
  Now I measure success through:
  
  → [new definition 1]
  
  → [new definition 2]
  
  → [new definition 3]
  
  That does not mean [misinterpretation].
  
  It means [clarification].
  
  I still care about [retained ambition].
  
  I no longer want it at the expense of [boundary or priority].
  
  The goal changed.
  
  So did the scorecard.
  
  [cta]`,

    variables: [
      "old measure",
      "old pursuit 1",
      "old pursuit 2",
      "old pursuit 3",
      "visible sign of success",
      "cost",
      "redefining moment",
      "new definition 1",
      "new definition 2",
      "new definition 3",
      "misinterpretation",
      "clarification",
      "retained ambition",
      "boundary or priority",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What metric, milestone, title, or external signal did you once use to measure success?",
        fills: ["old measure", "visible sign of success"],
      },
      {
        question: "What three things did that definition push you to pursue?",
        fills: ["old pursuit 1", "old pursuit 2", "old pursuit 3"],
      },
      {
        question: "What personal, professional, financial, relational, or health cost came with that pursuit?",
        fills: ["cost"],
      },
      {
        question: "What event or realization made you question your old definition of success?",
        fills: ["redefining moment"],
      },
      {
        question: "What three standards define success for you now?",
        fills: ["new definition 1", "new definition 2", "new definition 3"],
      },
      {
        question: "What might people wrongly assume your new definition means?",
        fills: ["misinterpretation"],
      },
      {
        question: "What do you actually mean?",
        fills: ["clarification"],
      },
      {
        question: "What ambition, result, or standard do you still care about?",
        fills: ["retained ambition"],
      },
      {
        question: "What important boundary or priority are you no longer willing to sacrifice for it?",
        fills: ["boundary or priority"],
      },
    ],

    ctaStyles: ["relatable", "shared_learning", "conversation", "belief_statement"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not imply that ambition, money, status, or growth is inherently wrong.",
      "Do not replace one vague definition of success with another.",
      "Do not invent personal costs or emotional struggles.",
      "Do not criticize people who still use the old measure.",
      "Do not frame success as a false choice between achievement and wellbeing.",
      "Do not use the clarification to repeat the new definition.",
      "Do not present a personal definition as the correct definition for everyone.",
    ],
  }),

  t({
    id: "mistake_lesson_05",
    name: "Small Failure, Big Lesson",
    archetype: "Mistake Lesson",
    variant: "Assumption-led small failure",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Grow my audience", "Build authority", "Build network"],

    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Process / how-I-work"],

    template: `[failure] looked like a small mistake.
  
  It exposed a much bigger assumption.
  
  At the time, I felt [feeling].
  
  I had assumed:
  
  "[wrong assumption]"
  
  Then [evidence that challenged assumption] proved otherwise.
  
  The failure taught me three things:
  
  → [lesson 1]
  
  → [lesson 2]
  
  → [lesson 3]
  
  The most useful lesson was [most useful lesson].
  
  Now I [new awareness or behavior] before [relevant action].
  
  That small change helps me catch [risk now monitored] earlier.
  
  The failure was small.
  
  The assumption behind it was not.
  
  [cta]`,

    variables: [
      "failure",
      "feeling",
      "wrong assumption",
      "evidence that challenged assumption",
      "lesson 1",
      "lesson 2",
      "lesson 3",
      "most useful lesson",
      "new awareness or behavior",
      "relevant action",
      "risk now monitored",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What small failure, awkward moment, missed detail, or disappointing result actually happened?",
        fills: ["failure"],
      },
      {
        question: "How did you honestly feel at the time?",
        fills: ["feeling"],
      },
      {
        question: "What assumption were you making before the failure?",
        fills: ["wrong assumption"],
      },
      {
        question: "What evidence showed that the assumption was wrong or incomplete?",
        fills: ["evidence that challenged assumption"],
      },
      {
        question: "What three distinct lessons did you take from the experience?",
        fills: ["lesson 1", "lesson 2", "lesson 3"],
      },
      {
        question: "Which lesson changed your behavior the most?",
        fills: ["most useful lesson"],
      },
      {
        question: "What do you now check, ask, test, or do differently?",
        fills: ["new awareness or behavior"],
      },
      {
        question: "Before what recurring action do you apply that new behavior?",
        fills: ["relevant action"],
      },
      {
        question: "What risk does the new behavior help you detect earlier?",
        fills: ["risk now monitored"],
      },
    ],

    ctaStyles: ["relatable", "conversation", "shared_learning", "authority_reframe"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent a failure, feeling, assumption, or lesson.",
      "Do not inflate a minor mistake into a dramatic crisis.",
      "Do not use fake vulnerability to manufacture engagement.",
      "Do not list three lessons that repeat the same idea.",
      "Do not claim the failure taught you something that you already knew and practiced.",
      "Do not end with awareness alone when a concrete behavior changed.",
      "Do not blame another person for the failure while presenting it as your lesson.",
    ],
  }),
  //
  t({
    id: "process_breakdown_01",
    name: "How I Approach X",
    archetype: "Process Breakdown",
    variant: "Sequence-led three-step process",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Get job opportunities"],

    bestForPillars: ["Process / how-I-work", "Problem education", "Career / credibility proof"],

    template: `Most people start solving [problem] one step too early.
  
  I use a three-step process instead.
  
  Step 1: [step 1]
  
  This establishes [step 1 output] before any major decision is made.
  
  I start here because [reason 1].
  
  Step 2: [step 2]
  
  This usually reveals [insight].
  
  That insight determines [decision shaped by insight].
  
  Step 3: [step 3]
  
  Only then do I work toward [outcome].
  
  The order matters because [sequence reason].
  
  Skip the first step, and [risk of skipping].
  
  Skip the second, and the final step becomes guesswork.
  
  A simple process still fails when the sequence is wrong.
  
  [cta]`,

    variables: [
      "problem",
      "step 1",
      "step 1 output",
      "reason 1",
      "step 2",
      "insight",
      "decision shaped by insight",
      "step 3",
      "outcome",
      "sequence reason",
      "risk of skipping",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What problem, project, or outcome do you want to explain your process for?",
        fills: ["problem", "outcome"],
      },
      {
        question: "What is the first step in your process, and what concrete output should it produce?",
        fills: ["step 1", "step 1 output"],
      },
      {
        question: "Why must that first step happen before the others?",
        fills: ["reason 1"],
      },
      {
        question: "What is the second step, and what important insight does it usually reveal?",
        fills: ["step 2", "insight"],
      },
      {
        question: "What decision does that insight help you make?",
        fills: ["decision shaped by insight"],
      },
      {
        question: "What is the third step?",
        fills: ["step 3"],
      },
      {
        question: "Why does the sequence matter, and what tends to go wrong when people skip the first step?",
        fills: ["sequence reason", "risk of skipping"],
      },
    ],

    ctaStyles: ["belief_statement", "soft_lead", "work_style", "diagnostic"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not begin with 'Here is how I approach.'",
      "Do not use three steps that can happen in any order.",
      "Do not make the steps broad labels without describing their outputs.",
      "Do not claim the process is simple unless it is genuinely easy to understand.",
      "Do not explain every operational detail.",
      "Do not present a personal process as the only valid approach.",
      "Do not use a final outcome that is disconnected from the three steps.",
    ],
  }),

  t({
    id: "process_breakdown_02",
    name: "First 30 Minutes",
    archetype: "Process Breakdown",
    variant: "Time-boxed initial diagnosis",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads"],

    bestForPillars: ["Process / how-I-work", "Problem education", "Mistakes and misconceptions"],

    template: `I do not spend the first [diagnostic duration] solving [problem].
  
  I spend it trying to disprove the obvious diagnosis.
  
  First, I look for:
  
  → [signal 1]
  
  → [signal 2]
  
  → [signal 3]
  
  Those signals tell me [what signals reveal].
  
  Then I ask:
  
  → [question 1]
  
  → [question 2]
  
  → [question 3]
  
  The most important question is:
  
  "[priority question]"
  
  Its answer helps separate [possible cause 1] from [possible cause 2].
  
  Only after that do I decide [next step].
  
  The first solution is often obvious.
  
  The correct diagnosis usually takes more work.
  
  [cta]`,

    variables: [
      "diagnostic duration",
      "problem",
      "signal 1",
      "signal 2",
      "signal 3",
      "what signals reveal",
      "question 1",
      "question 2",
      "question 3",
      "priority question",
      "possible cause 1",
      "possible cause 2",
      "next step",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What problem are you diagnosing, and how much time do you realistically spend on the initial review?",
        fills: ["problem", "diagnostic duration"],
      },
      {
        question: "What three observable signals do you examine first?",
        fills: ["signal 1", "signal 2", "signal 3"],
      },
      {
        question: "What do those signals help you understand or rule out?",
        fills: ["what signals reveal"],
      },
      {
        question: "What three questions do you ask before recommending a solution?",
        fills: ["question 1", "question 2", "question 3"],
      },
      {
        question: "Which question carries the most diagnostic value?",
        fills: ["priority question"],
      },
      {
        question: "What two possible causes does that question help you distinguish between?",
        fills: ["possible cause 1", "possible cause 2"],
      },
      {
        question: "What decision or next step do you make after completing the diagnosis?",
        fills: ["next step"],
      },
    ],

    ctaStyles: ["diagnostic", "authority_reframe", "specific_peer_question", "soft_lead"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use a time duration that is unrealistic for the work.",
      "Do not imply that every problem can be diagnosed fully within the stated duration.",
      "Do not use signals that are vague or impossible to observe.",
      "Do not ask three versions of the same diagnostic question.",
      "Do not recommend a next step that could have been chosen before the diagnosis.",
      "Do not use 'the solution is just noise' without explaining the risk of a wrong diagnosis.",
      "Do not present diagnosis as certainty when the available evidence only supports a working hypothesis.",
    ],
  }),

  t({
    id: "process_breakdown_03",
    name: "Simple Framework",
    archetype: "Process Breakdown",
    variant: "Decision-led named framework",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads"],

    bestForPillars: ["Process / how-I-work", "Problem education", "Point of view"],

    template: `I use the [framework name] framework to make [topic] easier to diagnose.
  
  It has three parts.
  
  1. [framework part 1]
  
  [one-line explanation 1].
  
  This answers:
  
  "[decision question 1]"
  
  2. [framework part 2]
  
  [one-line explanation 2].
  
  This answers:
  
  "[decision question 2]"
  
  3. [framework part 3]
  
  [one-line explanation 3].
  
  This answers:
  
  "[decision question 3]"
  
  Most [audience] start with [wrong starting point].
  
  That creates [consequence of wrong start].
  
  The stronger starting point is [right starting point].
  
  Once that is clear, [next decision] becomes easier.
  
  A framework is useful when it improves a decision.
  
  A memorable name is not enough.
  
  [cta]`,

    variables: [
      "framework name",
      "topic",
      "framework part 1",
      "one-line explanation 1",
      "decision question 1",
      "framework part 2",
      "one-line explanation 2",
      "decision question 2",
      "framework part 3",
      "one-line explanation 3",
      "decision question 3",
      "audience",
      "wrong starting point",
      "consequence of wrong start",
      "right starting point",
      "next decision",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What topic or decision does your framework help people handle?",
        fills: ["topic"],
      },
      {
        question: "Does the framework already have a real name, or what accurate descriptive name would fit it?",
        fills: ["framework name"],
      },
      {
        question: "Who is the framework designed for?",
        fills: ["audience"],
      },
      {
        question: "What are the three distinct parts of the framework?",
        fills: ["framework part 1", "framework part 2", "framework part 3"],
      },
      {
        question: "What does each part examine, produce, or clarify?",
        fills: ["one-line explanation 1", "one-line explanation 2", "one-line explanation 3"],
      },
      {
        question: "What decision question does each part answer?",
        fills: ["decision question 1", "decision question 2", "decision question 3"],
      },
      {
        question: "Where do people usually start incorrectly, and what problem does that create?",
        fills: ["wrong starting point", "consequence of wrong start"],
      },
      {
        question: "Where should they start instead, and what next decision becomes easier after that?",
        fills: ["right starting point", "next decision"],
      },
    ],

    ctaStyles: ["authority_reframe", "diagnostic", "soft_lead", "work_style"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not invent a forced acronym only to make the framework sound memorable.",
      "Do not give the framework a name that implies originality when it is a common model.",
      "Do not use three framework parts that overlap.",
      "Do not define parts with vague labels such as strategy, clarity, and execution without qualification.",
      "Do not present a framework without showing what decisions it improves.",
      "Do not claim the framework works in every context.",
      "Do not make the named framework more important than the reasoning behind it.",
    ],
  }),

  t({
    id: "process_breakdown_04",
    name: "What Happens Behind the Scenes",
    archetype: "Process Breakdown",
    variant: "Effort-led hidden execution",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Recruit / hire talent"],

    bestForPillars: ["Process / how-I-work", "Behind the scenes", "Career / credibility proof"],

    template: `[visible output] looks like [surface impression] from the outside.
  
  The final version hides most of the work.
  
  Before anyone sees it, we usually:
  
  → [hidden work 1]
  
  → [hidden work 2]
  
  → [hidden work 3]
  
  → [hidden work 4]
  
  The part that takes the most judgment is [judgment-heavy work].
  
  The part that takes the most time is [time-heavy work].
  
  And the part most people underestimate is [underestimated work].
  
  Together, those steps prevent [failure prevented].
  
  The visible output is [visible artifact or moment].
  
  The invisible effort is [invisible effort].
  
  That is why strong [topic] often looks simple after the difficult decisions have already been made.
  
  [cta]`,

    variables: [
      "visible output",
      "surface impression",
      "hidden work 1",
      "hidden work 2",
      "hidden work 3",
      "hidden work 4",
      "judgment-heavy work",
      "time-heavy work",
      "underestimated work",
      "failure prevented",
      "visible artifact or moment",
      "invisible effort",
      "topic",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What result, deliverable, launch, performance, or output do people see from the outside?",
        fills: ["visible output", "visible artifact or moment"],
      },
      {
        question: "What simple or misleading impression does that final output create?",
        fills: ["surface impression"],
      },
      {
        question: "What four distinct pieces of work happen before the final output is visible?",
        fills: ["hidden work 1", "hidden work 2", "hidden work 3", "hidden work 4"],
      },
      {
        question: "Which part requires the most judgment or expertise?",
        fills: ["judgment-heavy work"],
      },
      {
        question: "Which part requires the most time?",
        fills: ["time-heavy work"],
      },
      {
        question: "Which part do outsiders most often underestimate?",
        fills: ["underestimated work"],
      },
      {
        question: "What mistake, delay, quality issue, or risk does this hidden work prevent?",
        fills: ["failure prevented"],
      },
      {
        question: "How would you summarize the invisible effort behind the result?",
        fills: ["invisible effort"],
      },
      {
        question: "What broader type of work or discipline does this example represent?",
        fills: ["topic"],
      },
    ],

    ctaStyles: ["belief_statement", "culture_invite", "conversation", "career_signal"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not exaggerate the hidden workload to make the work appear more valuable.",
      "Do not glorify overwork, long hours, or unnecessary complexity.",
      "Do not list routine tasks as specialized hidden expertise without justification.",
      "Do not imply that work is high quality merely because it took a long time.",
      "Do not reveal confidential workflows, client details, or proprietary information.",
      "Do not use four hidden-work items that describe the same activity.",
      "Do not frame simplicity as evidence that the audience fails to appreciate the work.",
    ],
  }),

  t({
    id: "process_breakdown_05",
    name: "Quality Checklist",
    archetype: "Process Breakdown",
    variant: "Outcome-led quality control",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get job opportunities", "Promote my product/service"],

    bestForPillars: ["Process / how-I-work", "Values / philosophy", "Career / credibility proof"],

    template: `I do not call [work or output] finished when it looks polished.
  
  I call it finished when it passes these five checks:
  
  → [quality check 1]
  
  → [quality check 2]
  
  → [quality check 3]
  
  → [quality check 4]
  
  → [quality check 5]
  
  Each check protects against a different failure.
  
  The one I care about most is [most important check].
  
  Without it, [specific bad outcome].
  
  A polished result can still fail when [hidden quality risk].
  
  That is why I test [real standard] before approving the work.
  
  Good [work or output] should not only [surface standard].
  
  It should [meaningful outcome] for [intended audience or user].
  
  [cta]`,

    variables: [
      "work or output",
      "quality check 1",
      "quality check 2",
      "quality check 3",
      "quality check 4",
      "quality check 5",
      "most important check",
      "specific bad outcome",
      "hidden quality risk",
      "real standard",
      "surface standard",
      "meaningful outcome",
      "intended audience or user",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What type of work, deliverable, or output are you evaluating?",
        fills: ["work or output"],
      },
      {
        question: "What five distinct checks must the work pass before you consider it complete?",
        fills: ["quality check 1", "quality check 2", "quality check 3", "quality check 4", "quality check 5"],
      },
      {
        question: "Which quality check matters most, and why?",
        fills: ["most important check"],
      },
      {
        question: "What specific failure occurs when that check is missed?",
        fills: ["specific bad outcome"],
      },
      {
        question: "What hidden quality risk can remain even when the work looks polished?",
        fills: ["hidden quality risk"],
      },
      {
        question: "What real standard do you test before approving the work?",
        fills: ["real standard"],
      },
      {
        question: "What surface-level standard do people often mistake for quality?",
        fills: ["surface standard"],
      },
      {
        question: "What meaningful outcome should the work create, and for whom?",
        fills: ["meaningful outcome", "intended audience or user"],
      },
    ],

    ctaStyles: ["belief_statement", "work_style", "offer_bridge", "career_signal"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use vague checks such as high quality, professional, clear, or valuable without defining them.",
      "Do not make all five checks subjective.",
      "Do not include overlapping checks only to reach five items.",
      "Do not confuse polish with performance.",
      "Do not claim one quality standard applies to every audience or context.",
      "Do not use a meaningful outcome that cannot be connected to the work.",
      "Do not make the checklist so detailed that it becomes an operating manual.",
    ],
  }),
  //
  t({
    id: "myth_buster_01",
    name: "Myth vs Reality",
    archetype: "Myth-Buster",
    variant: "Classic myth buster",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Mistakes and misconceptions", "Audience belief shift", "Point of view"],
    template: `Myth:

[common myth]

Reality:

[truth]

I understand why people believe the myth.

It promises [appealing shortcut].

But in practice, it usually creates:

1. [bad outcome 1]
2. [bad outcome 2]
3. [bad outcome 3]

A better belief:

[better belief]

That one leads to better decisions.

[cta]`,
    variables: ["common myth", "truth", "appealing shortcut", "bad outcome 1", "bad outcome 2", "bad outcome 3", "better belief", "cta"],
    clarifyingQuestions: [
      {
        question: "What myth does your audience believe?",
        fills: ["common myth"],
      },
      {
        question: "What is the more accurate truth?",
        fills: ["truth", "better belief"],
      },
    ],
    ctaStyles: ["authority_reframe", "conversation", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "myth_buster_02",
    name: "The Half-Truth",
    archetype: "Myth-Buster",
    variant: "Nuanced advice",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Build network"],
    bestForPillars: ["Mistakes and misconceptions", "Point of view"],
    template: `[common advice] is not wrong.

It’s just incomplete.

It works when:

1. [works when 1]
2. [works when 2]
3. [works when 3]

It breaks when:

1. [breaks when 1]
2. [breaks when 2]
3. [breaks when 3]

The missing context is [missing context].

So the better advice is:

[better advice]

[cta]`,
    variables: [
      "common advice",
      "works when 1",
      "works when 2",
      "works when 3",
      "breaks when 1",
      "breaks when 2",
      "breaks when 3",
      "missing context",
      "better advice",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What common advice is only partly true?",
        fills: ["common advice"],
      },
      {
        question: "When does it work, and when does it break?",
        fills: ["works when 1", "works when 2", "works when 3", "breaks when 1", "breaks when 2", "breaks when 3"],
      },
    ],
    ctaStyles: ["authority_reframe", "shared_learning", "industry_prompt"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "myth_buster_03",
    name: "This Works, But Only When",
    archetype: "Myth-Buster",
    variant: "Conditional tactic",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads"],
    bestForPillars: ["Mistakes and misconceptions", "Problem education"],
    template: `[tactic] works.

But only when [condition].

It fails when:

1. [failure condition 1]
2. [failure condition 2]
3. [failure condition 3]

That’s why some people get [good outcome] from it.

And others get [bad outcome].

The tactic is not the problem.

The missing context is [missing context].

[cta]`,
    variables: [
      "tactic",
      "condition",
      "failure condition 1",
      "failure condition 2",
      "failure condition 3",
      "good outcome",
      "bad outcome",
      "missing context",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What tactic does your audience overuse or misunderstand?",
        fills: ["tactic"],
      },
      {
        question: "When does it work, and when does it fail?",
        fills: ["condition", "failure condition 1", "failure condition 2", "failure condition 3"],
      },
    ],
    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "myth_buster_04",
    name: "Dangerous Simplification",
    archetype: "Myth-Buster",
    variant: "Oversimplified idea",
    bestForRoles: ["Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Mistakes and misconceptions", "Audience belief shift"],
    template: `[oversimplified idea] sounds helpful.

That’s why it spreads.

But it hides:

1. [hidden complexity 1]
2. [hidden complexity 2]
3. [hidden complexity 3]

And when people ignore those, they end up with [bad outcome].

A more useful version is:

[better framing]

Less catchy.

Much more accurate.

[cta]`,
    variables: ["oversimplified idea", "hidden complexity 1", "hidden complexity 2", "hidden complexity 3", "bad outcome", "better framing", "cta"],
    clarifyingQuestions: [
      {
        question: "What idea is too oversimplified in your industry?",
        fills: ["oversimplified idea"],
      },
      {
        question: "What complexity does that idea hide?",
        fills: ["hidden complexity 1", "hidden complexity 2", "hidden complexity 3", "better framing"],
      },
    ],
    ctaStyles: ["authority_reframe", "agree_disagree", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "myth_buster_05",
    name: "Myth I Believed Too",
    archetype: "Myth-Buster",
    variant: "Personal myth correction",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority"],
    bestForPillars: ["Personal story", "Mistakes and misconceptions"],
    template: `I used to believe [myth].

It made sense because [why it made sense].

So I did:

1. [old action 1]
2. [old action 2]
3. [old action 3]

But eventually I realized [truth].

Now I think about it this way:

[better belief]

I don’t blame people for believing [myth].

I did too.

But it cost me [cost].

[cta]`,
    variables: ["myth", "why it made sense", "old action 1", "old action 2", "old action 3", "truth", "better belief", "cost", "cta"],
    clarifyingQuestions: [
      {
        question: "What myth did you also believe at some point?",
        fills: ["myth", "why it made sense"],
      },
      {
        question: "What changed your mind?",
        fills: ["truth", "better belief", "cost"],
      },
    ],
    ctaStyles: ["relatable", "authority_reframe", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),
  //
  t({
    id: "myth_buster_01",
    name: "Myth vs Reality",
    archetype: "Myth-Buster",
    variant: "Consequence-led myth correction",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Mistakes and misconceptions", "Audience belief shift", "Point of view"],

    template: `[common myth] sounds useful.

It is also leading [audience] toward the wrong decisions.

The more accurate reality is:

[truth].

The myth remains popular because it promises [appealing shortcut].

But following it often creates:

→ [bad outcome 1]

→ [bad outcome 2]

→ [bad outcome 3]

The clearest evidence is [supporting evidence].

A stronger belief is:

[better belief].

That changes the decision from [old decision] to [better decision].

A useful belief should improve what you do next.

[cta]`,

    variables: [
      "common myth",
      "audience",
      "truth",
      "appealing shortcut",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "supporting evidence",
      "better belief",
      "old decision",
      "better decision",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what common myth do they believe?",
        fills: ["audience", "common myth"],
      },
      {
        question: "What is the more accurate reality?",
        fills: ["truth"],
      },
      {
        question: "What attractive shortcut, promise, or simplification makes the myth appealing?",
        fills: ["appealing shortcut"],
      },
      {
        question: "What three specific negative outcomes can the myth create?",
        fills: ["bad outcome 1", "bad outcome 2", "bad outcome 3"],
      },
      {
        question: "What evidence, experience, observation, or mechanism supports your correction?",
        fills: ["supporting evidence"],
      },
      {
        question: "What more useful belief should replace the myth?",
        fills: ["better belief"],
      },
      {
        question: "What decision does the myth encourage, and what better decision follows from the corrected belief?",
        fills: ["old decision", "better decision"],
      },
    ],

    ctaStyles: ["authority_reframe", "conversation", "belief_statement", "agree_disagree"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not label a reasonable disagreement as a myth.",
      "Do not choose a belief that almost nobody actually holds.",
      "Do not replace the myth with an equally broad claim.",
      "Do not attack people who believe the myth.",
      "Do not claim the myth always creates the same outcome.",
      "Do not invent evidence, examples, or results.",
      "Do not use the truth and better belief as duplicate statements.",
    ],
  }),

  t({
    id: "myth_buster_02",
    name: "The Half-Truth",
    archetype: "Myth-Buster",
    variant: "Boundary-led nuanced advice",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Build network"],

    bestForPillars: ["Mistakes and misconceptions", "Point of view", "Audience belief shift"],

    template: `[common advice] is useful advice in the wrong-sized box.

It works when:

→ [works when 1]

→ [works when 2]

→ [works when 3]

It starts breaking when:

→ [breaks when 1]

→ [breaks when 2]

→ [breaks when 3]

The missing context is [missing context].

Without that context, people apply the advice to [wrong application].

That leads to [practical consequence].

A more accurate version is:

"[better advice]"

Good advice needs boundaries.

Otherwise, a useful principle becomes a bad default.

[cta]`,

    variables: [
      "common advice",
      "works when 1",
      "works when 2",
      "works when 3",
      "breaks when 1",
      "breaks when 2",
      "breaks when 3",
      "missing context",
      "wrong application",
      "practical consequence",
      "better advice",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What common advice is useful but incomplete?",
        fills: ["common advice"],
      },
      {
        question: "Under what three conditions does the advice work well?",
        fills: ["works when 1", "works when 2", "works when 3"],
      },
      {
        question: "Under what three conditions does the advice become ineffective or harmful?",
        fills: ["breaks when 1", "breaks when 2", "breaks when 3"],
      },
      {
        question: "What important context, boundary, stage, or condition is usually missing?",
        fills: ["missing context"],
      },
      {
        question: "Where do people incorrectly apply the advice?",
        fills: ["wrong application"],
      },
      {
        question: "What practical consequence follows from that incorrect application?",
        fills: ["practical consequence"],
      },
      {
        question: "How would you rewrite the advice so it includes the missing context?",
        fills: ["better advice"],
      },
    ],

    ctaStyles: ["authority_reframe", "shared_learning", "industry_prompt", "peer_question"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not claim advice is incomplete without defining its limits.",
      "Do not use conditions that overlap.",
      "Do not make the working conditions so narrow that the advice becomes meaningless.",
      "Do not make the failure conditions unrealistic.",
      "Do not present nuance as indecision.",
      "Do not turn the better advice into a long paragraph.",
      "Do not imply that incomplete advice was created with bad intentions.",
    ],
  }),

  t({
    id: "myth_buster_03",
    name: "This Works, But Only When",
    archetype: "Myth-Buster",
    variant: "Prerequisite-led conditional tactic",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads"],

    bestForPillars: ["Mistakes and misconceptions", "Problem education", "Process / how-I-work"],

    template: `[tactic] works.

But only after [critical prerequisite] is true.

When that condition exists, the tactic can produce [good outcome].

When it does not, the same tactic often creates:

→ [failure condition 1]

→ [failure condition 2]

→ [failure condition 3]

That explains why one [audience segment] gets [good outcome].

Another gets [bad outcome].

The difference is not effort.

It is [missing context].

Before using [tactic], check:

"[diagnostic question]"

A weak answer means the tactic is early, not necessarily wrong.

Fix [priority fix] first.

[cta]`,

    variables: [
      "tactic",
      "critical prerequisite",
      "good outcome",
      "failure condition 1",
      "failure condition 2",
      "failure condition 3",
      "audience segment",
      "bad outcome",
      "missing context",
      "diagnostic question",
      "priority fix",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What tactic does your audience overuse, misuse, or misunderstand?",
        fills: ["tactic"],
      },
      {
        question: "What prerequisite must be true before the tactic can work well?",
        fills: ["critical prerequisite"],
      },
      {
        question: "What useful outcome can the tactic produce under the right conditions?",
        fills: ["good outcome"],
      },
      {
        question: "What three conditions cause the tactic to fail or underperform?",
        fills: ["failure condition 1", "failure condition 2", "failure condition 3"],
      },
      {
        question: "What type of audience, company, person, or situation tends to use this tactic?",
        fills: ["audience segment"],
      },
      {
        question: "What negative result occurs when the tactic is used too early or in the wrong context?",
        fills: ["bad outcome"],
      },
      {
        question: "What important context explains the difference between success and failure?",
        fills: ["missing context"],
      },
      {
        question: "What question can someone ask to determine whether they are ready to use the tactic?",
        fills: ["diagnostic question"],
      },
      {
        question: "What should they fix or establish before applying the tactic?",
        fills: ["priority fix"],
      },
    ],

    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead", "problem_solution"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not claim a tactic works without defining the required conditions.",
      "Do not describe symptoms as failure conditions.",
      "Do not present timing as the issue when the tactic is genuinely unsuitable.",
      "Do not claim effort is irrelevant when execution quality matters.",
      "Do not make the diagnostic question impossible for the audience to answer.",
      "Do not use a vague prerequisite such as strategy, clarity, or consistency without defining it.",
      "Do not imply that fixing one prerequisite guarantees success.",
    ],
  }),

  t({
    id: "myth_buster_04",
    name: "Dangerous Simplification",
    archetype: "Myth-Buster",
    variant: "Risk-led oversimplification",

    bestForRoles: ["Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Mistakes and misconceptions", "Audience belief shift", "Point of view"],

    template: `[oversimplified idea] fits neatly into one sentence.

The real problem does not.

The idea leaves out:

→ [hidden complexity 1]

→ [hidden complexity 2]

→ [hidden complexity 3]

Those details matter because [why complexity matters].

When [audience] ignore them, they often [bad decision].

That creates [bad outcome].

A more useful framing is:

"[better framing]"

It is less catchy.

It also tells you what to do when [important exception].

Simple ideas help people remember.

Accurate ideas help people decide.

[cta]`,

    variables: [
      "oversimplified idea",
      "hidden complexity 1",
      "hidden complexity 2",
      "hidden complexity 3",
      "why complexity matters",
      "audience",
      "bad decision",
      "bad outcome",
      "better framing",
      "important exception",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What popular idea in your industry is too simplified?",
        fills: ["oversimplified idea"],
      },
      {
        question: "What three important factors, conditions, or trade-offs does it hide?",
        fills: ["hidden complexity 1", "hidden complexity 2", "hidden complexity 3"],
      },
      {
        question: "Why do those hidden factors matter in practice?",
        fills: ["why complexity matters"],
      },
      {
        question: "Who is most likely to be misled by the simplified idea?",
        fills: ["audience"],
      },
      {
        question: "What bad decision does the simplification encourage?",
        fills: ["bad decision"],
      },
      {
        question: "What specific negative outcome can follow?",
        fills: ["bad outcome"],
      },
      {
        question: "How would you restate the idea more accurately without making it unnecessarily complicated?",
        fills: ["better framing"],
      },
      {
        question: "What important exception should the improved framing account for?",
        fills: ["important exception"],
      },
    ],

    ctaStyles: ["authority_reframe", "agree_disagree", "belief_statement", "industry_prompt"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not criticize simplicity merely because a topic is complex.",
      "Do not add complexity that does not affect a decision.",
      "Do not make the corrected framing impossible to understand.",
      "Do not claim an idea is dangerous without naming the decision or outcome at risk.",
      "Do not use hidden complexities that are minor exceptions.",
      "Do not attack creators or people who repeat the simplified idea.",
      "Do not imply that more detail always produces better advice.",
    ],
  }),

  t({
    id: "myth_buster_05",
    name: "Myth I Believed Too",
    archetype: "Myth-Buster",
    variant: "Experience-led personal correction",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority"],

    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Point of view"],

    template: `I believed [myth] long enough to build my behavior around it.

It made sense because [why it made sense].

So I kept:

→ [old action 1]

→ [old action 2]

→ [old action 3]

Then [turning point] challenged the belief.

The clearest evidence was [revealing evidence].

It showed me that [truth].

The myth had already cost me [cost].

Now I use a different belief:

"[better belief]"

That changes how I [changed decision or behavior].

I understand why people still believe [myth].

I did too.

But understanding why a belief is appealing does not make it accurate.

[cta]`,

    variables: [
      "myth",
      "why it made sense",
      "old action 1",
      "old action 2",
      "old action 3",
      "turning point",
      "revealing evidence",
      "truth",
      "cost",
      "better belief",
      "changed decision or behavior",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What myth did you genuinely believe at one point?",
        fills: ["myth"],
      },
      {
        question: "Why did that belief seem reasonable or useful at the time?",
        fills: ["why it made sense"],
      },
      {
        question: "What three behaviors or decisions followed from the myth?",
        fills: ["old action 1", "old action 2", "old action 3"],
      },
      {
        question: "What event, result, conversation, or experience caused you to question it?",
        fills: ["turning point"],
      },
      {
        question: "What specific evidence made it clear that the myth was wrong or incomplete?",
        fills: ["revealing evidence"],
      },
      {
        question: "What more accurate truth did you learn?",
        fills: ["truth"],
      },
      {
        question: "What did believing the myth cost you in time, money, energy, opportunity, trust, or progress?",
        fills: ["cost"],
      },
      {
        question: "What belief do you use now instead?",
        fills: ["better belief"],
      },
      {
        question: "What decision or behavior changed because of the new belief?",
        fills: ["changed decision or behavior"],
      },
    ],

    ctaStyles: ["relatable", "authority_reframe", "conversation", "shared_learning"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent a past belief, turning point, cost, or personal experience.",
      "Do not use fake vulnerability to make the correction feel more credible.",
      "Do not make the old belief sound foolish in hindsight.",
      "Do not exaggerate the cost of believing the myth.",
      "Do not blame other people for teaching or reinforcing the belief.",
      "Do not replace the old myth with another absolute statement.",
      "Do not claim personal experience proves a universal rule.",
    ],
  }),
  //
  t({
    id: "objection_handling_01",
    name: "We're Not Ready Yet",
    archetype: "Objection Handling",
    variant: "Readiness-led low-risk next step",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service"],

    bestForPillars: ["Objection handling", "Product / service education", "Problem education"],

    template: `"We're not ready for [thing]" usually means something more specific.
  
  For [audience], it often means:
  
  → [real concern 1]
  
  → [real concern 2]
  
  → [real concern 3]
  
  Those concerns are valid.
  
  But waiting until everything feels ready can create:
  
  → [cost of waiting 1]
  
  → [cost of waiting 2]
  
  → [cost of waiting 3]
  
  The goal is not to jump straight into [big intimidating step].
  
  The goal is to reduce uncertainty through [safe first step].
  
  That first step should answer:
  
  "[readiness question]"
  
  If the answer is [positive readiness signal], move forward.
  
  If it is not, you now know what to fix before making a larger commitment.
  
  Readiness is easier to build when the next step is small enough to learn from.
  
  [cta]`,

    variables: [
      "thing",
      "audience",
      "real concern 1",
      "real concern 2",
      "real concern 3",
      "cost of waiting 1",
      "cost of waiting 2",
      "cost of waiting 3",
      "big intimidating step",
      "safe first step",
      "readiness question",
      "positive readiness signal",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what do they often say they are not ready for?",
        fills: ["audience", "thing"],
      },
      {
        question: "What three specific concerns usually sit behind that lack of readiness?",
        fills: ["real concern 1", "real concern 2", "real concern 3"],
      },
      {
        question: "What three costs can increase while they continue waiting?",
        fills: ["cost of waiting 1", "cost of waiting 2", "cost of waiting 3"],
      },
      {
        question: "What large commitment or intimidating step do they assume they must take?",
        fills: ["big intimidating step"],
      },
      {
        question: "What smaller, lower-risk first step could help them learn without making the full commitment?",
        fills: ["safe first step"],
      },
      {
        question: "What question should that first step answer?",
        fills: ["readiness question"],
      },
      {
        question: "What result or signal would show that they are ready to move forward?",
        fills: ["positive readiness signal"],
      },
    ],

    ctaStyles: ["soft_lead", "problem_solution", "offer_bridge", "diagnostic"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not dismiss hesitation as fear or indecision.",
      "Do not imply that waiting is always the wrong choice.",
      "Do not manufacture urgency without a real cost of delay.",
      "Do not use vague concerns such as time, money, or resources without explaining the specific issue.",
      "Do not make the safe first step a disguised full commitment.",
      "Do not promise that a small first step removes all risk.",
      "Do not pressure the audience into acting before genuine readiness conditions are met.",
    ],
  }),

  t({
    id: "objection_handling_02",
    name: "Too Expensive",
    archetype: "Objection Handling",
    variant: "Total-cost comparison",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service"],

    bestForPillars: ["Objection handling", "Product / service education", "Problem education"],

    template: `"[thing] is too expensive" may be completely true.
  
  The price has to fit the value, timing, and available budget.
  
  But price is only one side of the decision.
  
  The other side is what [unresolved problem] is already costing.
  
  That cost may show up as:
  
  → [hidden cost 1]
  
  → [hidden cost 2]
  
  → [hidden cost 3]
  
  Over [cost time frame], that adds up to [cost consequence].
  
  The fair comparison is not:
  
  "[price-only question]"
  
  It is:
  
  "[total-cost question]"
  
  If the cost of the problem is lower than the cost of solving it, waiting may be sensible.
  
  If the unresolved problem is costing more, the cheaper-looking option may be the expensive one.
  
  The decision should be based on total cost, not pressure.
  
  [cta]`,

    variables: [
      "thing",
      "unresolved problem",
      "hidden cost 1",
      "hidden cost 2",
      "hidden cost 3",
      "cost time frame",
      "cost consequence",
      "price-only question",
      "total-cost question",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What product, service, hire, investment, or solution does the audience consider too expensive?",
        fills: ["thing"],
      },
      {
        question: "What unresolved problem is that investment intended to address?",
        fills: ["unresolved problem"],
      },
      {
        question:
          "What three specific costs does the unresolved problem create in money, time, missed opportunities, quality, risk, or team capacity?",
        fills: ["hidden cost 1", "hidden cost 2", "hidden cost 3"],
      },
      {
        question: "Over what realistic period do those costs accumulate?",
        fills: ["cost time frame"],
      },
      {
        question: "What broader consequence do those accumulated costs create?",
        fills: ["cost consequence"],
      },
      {
        question: "What narrow price-focused question does the audience usually ask?",
        fills: ["price-only question"],
      },
      {
        question: "What fair total-cost question would help them compare acting, waiting, and alternative solutions?",
        fills: ["total-cost question"],
      },
    ],

    ctaStyles: ["problem_solution", "offer_bridge", "soft_lead", "diagnostic"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not use aggressive sales language.",
      "Do not dismiss a genuine budget constraint.",
      "Do not imply that every expensive offer is justified by hidden costs.",
      "Do not invent financial losses, return estimates, or opportunity costs.",
      "Do not compare a certain price with speculative costs as if both are equally verified.",
      "Do not create false urgency through long-term fear.",
      "Do not frame inaction as irrational when waiting may be financially responsible.",
      "Do not discuss cost without acknowledging value, timing, and available alternatives.",
    ],
  }),

  t({
    id: "objection_handling_03",
    name: "We Tried That Before",
    archetype: "Objection Handling",
    variant: "Failure-led diagnostic review",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service"],

    bestForPillars: ["Objection handling", "Mistakes and misconceptions", "Problem education"],

    template: `"We tried [thing] before" is a reason to investigate.
  
  It is not a reason to repeat the same attempt.
  
  Before deciding whether [thing] works, separate the tactic from the conditions around it.
  
  Ask what failed:
  
  → [possible failure point 1]
  
  → [possible failure point 2]
  
  → [possible failure point 3]
  
  → [possible failure point 4]
  
  The strongest clue is [diagnostic clue].
  
  That may reveal that the real issue was [real issue].
  
  A second attempt only makes sense when [material difference].
  
  Without that difference, it is repetition.
  
  With it, the new attempt is testing a different set of conditions.
  
  The useful question is not:
  
  "Did we try it?"
  
  It is:
  
  "Did we give it the conditions required to work?"
  
  [cta]`,

    variables: [
      "thing",
      "possible failure point 1",
      "possible failure point 2",
      "possible failure point 3",
      "possible failure point 4",
      "diagnostic clue",
      "real issue",
      "material difference",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What tactic, service, channel, process, or approach has the audience already tried?",
        fills: ["thing"],
      },
      {
        question: "What four distinct parts of the previous attempt could have caused it to fail?",
        fills: ["possible failure point 1", "possible failure point 2", "possible failure point 3", "possible failure point 4"],
      },
      {
        question: "What evidence or result from the previous attempt provides the strongest diagnostic clue?",
        fills: ["diagnostic clue"],
      },
      {
        question: "What was the likely underlying issue with the previous attempt?",
        fills: ["real issue"],
      },
      {
        question: "What would need to be materially different before trying the approach again?",
        fills: ["material difference"],
      },
    ],

    ctaStyles: ["soft_lead", "diagnostic", "problem_solution", "authority_reframe"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not assume the previous failure was caused by poor execution.",
      "Do not imply that the tactic itself can never be the problem.",
      "Do not recommend trying again unless something material will change.",
      "Do not blame the audience, client, team, or previous provider without evidence.",
      "Do not invent details about why the previous attempt failed.",
      "Do not treat one failed attempt as proof that the tactic works under other conditions.",
      "Do not use failure points that overlap or merely restate poor execution.",
    ],
  }),

  t({
    id: "objection_handling_04",
    name: "We Can Do It Ourselves",
    archetype: "Objection Handling",
    variant: "Build-versus-buy decision",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service"],

    bestForPillars: ["Objection handling", "Product / service education", "Problem education"],

    template: `"We can do [thing] ourselves" may be the right decision.
  
  DIY works well when:
  
  → [works when 1]
  
  → [works when 2]
  
  → [works when 3]
  
  It becomes costly when:
  
  → [breaks when 1]
  
  → [breaks when 2]
  
  → [breaks when 3]
  
  The real comparison is not capability alone.
  
  It is the trade-off between [internal advantage] and [external advantage].
  
  Before choosing, compare:
  
  → [decision factor 1]
  
  → [decision factor 2]
  
  → [decision factor 3]
  
  Then ask:
  
  "Is doing [thing] internally the best use of [constrained resource] right now?"
  
  If yes, keep it in-house.
  
  If no, outside support may be the more efficient decision.
  
  The right answer depends on the economics and the context.
  
  [cta]`,

    variables: [
      "thing",
      "works when 1",
      "works when 2",
      "works when 3",
      "breaks when 1",
      "breaks when 2",
      "breaks when 3",
      "internal advantage",
      "external advantage",
      "decision factor 1",
      "decision factor 2",
      "decision factor 3",
      "constrained resource",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What task, service, process, or project does the audience think they can handle internally?",
        fills: ["thing"],
      },
      {
        question: "Under what three conditions does handling it internally work well?",
        fills: ["works when 1", "works when 2", "works when 3"],
      },
      {
        question: "Under what three conditions does the DIY approach become inefficient, risky, or difficult?",
        fills: ["breaks when 1", "breaks when 2", "breaks when 3"],
      },
      {
        question: "What is the strongest advantage of doing the work internally?",
        fills: ["internal advantage"],
      },
      {
        question: "What is the strongest advantage of using outside help?",
        fills: ["external advantage"],
      },
      {
        question: "What three factors should guide the build-versus-buy decision?",
        fills: ["decision factor 1", "decision factor 2", "decision factor 3"],
      },
      {
        question: "What scarce resource is most affected, such as time, attention, expertise, speed, or team capacity?",
        fills: ["constrained resource"],
      },
    ],

    ctaStyles: ["specific_peer_question", "soft_lead", "offer_bridge", "diagnostic"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not imply that outsourcing is automatically the better choice.",
      "Do not minimize the audience's internal capabilities.",
      "Do not use expertise as the only reason to hire outside help.",
      "Do not ignore coordination costs, vendor risk, or knowledge transfer.",
      "Do not make DIY failure conditions artificially broad.",
      "Do not disguise a sales pitch as an objective build-versus-buy analysis.",
      "Do not present time savings without considering the time required to manage outside support.",
    ],
  }),

  t({
    id: "objection_handling_05",
    name: "Objection Behind the Objection",
    archetype: "Objection Handling",
    variant: "Concern-led empathetic response",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Promote my product/service"],

    bestForPillars: ["Objection handling", "Audience belief shift", "Product / service education"],

    template: `When someone says, "[stated objection]," answering too quickly can make the conversation worse.
  
  The words may point to [surface concern].
  
  But the actual concern may be:
  
  → [hidden concern 1]
  
  → [hidden concern 2]
  
  → [hidden concern 3]
  
  That is why replying with [logical response] often misses the point.
  
  It answers the statement.
  
  It does not clarify the concern.
  
  A better response is:
  
  "[empathetic reframe]"
  
  Then ask:
  
  "[clarifying question]"
  
  The answer reveals whether the person needs [need 1], [need 2], or [need 3].
  
  Good objection handling is not about winning an argument.
  
  It is about making the real decision easier to understand.
  
  [cta]`,

    variables: [
      "stated objection",
      "surface concern",
      "hidden concern 1",
      "hidden concern 2",
      "hidden concern 3",
      "logical response",
      "empathetic reframe",
      "clarifying question",
      "need 1",
      "need 2",
      "need 3",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What exact objection do you hear most often?",
        fills: ["stated objection"],
      },
      {
        question: "What surface-level concern does that objection appear to express?",
        fills: ["surface concern"],
      },
      {
        question: "What three deeper concerns may sit underneath the stated objection?",
        fills: ["hidden concern 1", "hidden concern 2", "hidden concern 3"],
      },
      {
        question: "What logical response do people commonly give that fails to address the deeper concern?",
        fills: ["logical response"],
      },
      {
        question: "What direct but empathetic response would acknowledge the concern without applying pressure?",
        fills: ["empathetic reframe"],
      },
      {
        question: "What open question could clarify what the person is actually worried about?",
        fills: ["clarifying question"],
      },
      {
        question: "What three different things might the person need before making a decision?",
        fills: ["need 1", "need 2", "need 3"],
      },
    ],

    ctaStyles: ["soft_lead", "problem_solution", "offer_bridge", "conversation"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not claim to know a person's hidden concern without asking.",
      "Do not use psychological labels to explain ordinary hesitation.",
      "Do not treat every objection as a disguised fear.",
      "Do not use empathy as a manipulation tactic.",
      "Do not write an empathetic reframe that immediately pressures the person to buy.",
      "Do not dismiss the stated objection merely because a deeper concern may exist.",
      "Do not ask a leading question designed to force one preferred answer.",
      "Do not frame objection handling as overcoming resistance.",
    ],
  }),
  //
  t({
    id: "use_case_story_01",
    name: "When to Use This",
    archetype: "Use Case Story",
    variant: "Trigger-led best-fit scenario",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Promote my product/service", "Get inbound leads"],

    bestForPillars: ["Product / service education", "Problem education", "Objection handling"],

    template: `[product, service, or approach] becomes useful when [trigger situation].
  
  That is usually the point where [audience] are dealing with:
  
  → [problem 1]
  
  → [problem 2]
  
  → [problem 3]
  
  In that situation, it helps by:
  
  → [help 1]
  
  → [help 2]
  
  → [help 3]
  
  The strongest fit is when [best-fit condition].
  
  It is a weaker fit when [poor-fit condition].
  
  This is not designed to [wrong expectation].
  
  It is designed to [right expectation].
  
  The value comes from using it at the right moment for the right problem.
  
  [cta]`,

    variables: [
      "product, service, or approach",
      "trigger situation",
      "audience",
      "problem 1",
      "problem 2",
      "problem 3",
      "help 1",
      "help 2",
      "help 3",
      "best-fit condition",
      "poor-fit condition",
      "wrong expectation",
      "right expectation",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What product, service, method, or approach are you explaining?",
        fills: ["product, service, or approach"],
      },
      {
        question: "Who is it for, and what situation usually signals that they may need it?",
        fills: ["audience", "trigger situation"],
      },
      {
        question: "What three specific problems are usually present in that situation?",
        fills: ["problem 1", "problem 2", "problem 3"],
      },
      {
        question: "How does your product, service, or approach help with each of those problems?",
        fills: ["help 1", "help 2", "help 3"],
      },
      {
        question: "What condition makes someone an especially strong fit?",
        fills: ["best-fit condition"],
      },
      {
        question: "What condition makes this a weaker fit or suggests they should wait?",
        fills: ["poor-fit condition"],
      },
      {
        question: "What unrealistic expectation should the audience avoid, and what realistic outcome should they expect instead?",
        fills: ["wrong expectation", "right expectation"],
      },
    ],

    ctaStyles: ["use_case", "offer_bridge", "soft_lead", "diagnostic"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not claim the product, service, or approach is useful in every situation.",
      "Do not describe broad audience pain without naming a clear trigger.",
      "Do not list benefits that are disconnected from the stated problems.",
      "Do not hide poor-fit conditions.",
      "Do not frame a limitation as a benefit.",
      "Do not promise outcomes the offer cannot reliably produce.",
      "Do not turn the post into a generic feature list.",
    ],
  }),

  t({
    id: "use_case_story_02",
    name: "For and Not For",
    archetype: "Use Case Story",
    variant: "Expectation-led fit positioning",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Promote my product/service", "Get inbound leads"],

    bestForPillars: ["Product / service education", "Objection handling", "Audience belief shift"],

    template: `[product, service, or approach] is a strong fit for [right-fit audience].
  
  Especially when they want to:
  
  → [right-fit desire 1]
  
  → [right-fit desire 2]
  
  → [right-fit desire 3]
  
  And they are willing to [required commitment].
  
  It is probably not the right fit for people who want:
  
  → [bad-fit desire 1]
  
  → [bad-fit desire 2]
  
  → [bad-fit desire 3]
  
  Or who cannot currently [missing prerequisite].
  
  This is not about [wrong expectation].
  
  It is about [right expectation].
  
  The best results happen when the offer, expectations, and working conditions match.
  
  Fit matters more than persuasion.
  
  [cta]`,

    variables: [
      "product, service, or approach",
      "right-fit audience",
      "right-fit desire 1",
      "right-fit desire 2",
      "right-fit desire 3",
      "required commitment",
      "bad-fit desire 1",
      "bad-fit desire 2",
      "bad-fit desire 3",
      "missing prerequisite",
      "wrong expectation",
      "right expectation",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What product, service, or approach are you positioning?",
        fills: ["product, service, or approach"],
      },
      {
        question: "Who is the strongest-fit audience for it?",
        fills: ["right-fit audience"],
      },
      {
        question: "What three outcomes or improvements does the right-fit audience genuinely want?",
        fills: ["right-fit desire 1", "right-fit desire 2", "right-fit desire 3"],
      },
      {
        question: "What effort, participation, time, decision, or behavior is required from the customer for the work to succeed?",
        fills: ["required commitment"],
      },
      {
        question: "What three expectations or desires indicate a poor fit?",
        fills: ["bad-fit desire 1", "bad-fit desire 2", "bad-fit desire 3"],
      },
      {
        question: "What prerequisite should someone have before buying or using this?",
        fills: ["missing prerequisite"],
      },
      {
        question: "What false expectation should you correct, and what realistic expectation should replace it?",
        fills: ["wrong expectation", "right expectation"],
      },
    ],

    ctaStyles: ["offer_bridge", "use_case", "soft_lead", "diagnostic"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use exclusion to manufacture status or scarcity.",
      "Do not insult or shame poor-fit prospects.",
      "Do not describe poor fit only as people who are unwilling to pay.",
      "Do not hide the effort required from the customer.",
      "Do not make the right-fit criteria so broad that everyone qualifies.",
      "Do not make the bad-fit criteria so extreme that they provide no useful guidance.",
      "Do not imply that poor fit is a character flaw.",
    ],
  }),

  t({
    id: "use_case_story_03",
    name: "Day-in-the-Life Use Case",
    archetype: "Use Case Story",
    variant: "Moment-led real-life use case",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Promote my product/service", "Get inbound leads"],

    bestForPillars: ["Product / service education", "Problem education", "Behind the scenes"],

    template: `[problem] rarely announces itself as a major problem.
  
  It shows up in moments like this:
  
  [daily moment].
  
  At that point, [audience] often have to:
  
  → [friction 1]
  
  → [friction 2]
  
  → [friction 3]
  
  That is where [product, service, or approach] becomes useful.
  
  In the moment, it helps them:
  
  → [help 1]
  
  → [help 2]
  
  → [help 3]
  
  The immediate benefit is [immediate benefit].
  
  The longer-term benefit is [long-term benefit].
  
  The value is not abstract.
  
  It appears at the exact moment [problem consequence] would otherwise happen.
  
  [cta]`,

    variables: [
      "problem",
      "daily moment",
      "audience",
      "friction 1",
      "friction 2",
      "friction 3",
      "product, service, or approach",
      "help 1",
      "help 2",
      "help 3",
      "immediate benefit",
      "long-term benefit",
      "problem consequence",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What recurring problem does your audience experience?",
        fills: ["problem"],
      },
      {
        question: "Who experiences it, and what exact moment during their day or week makes the problem visible?",
        fills: ["audience", "daily moment"],
      },
      {
        question: "What three specific points of friction happen in that moment?",
        fills: ["friction 1", "friction 2", "friction 3"],
      },
      {
        question: "What product, service, or approach helps in that situation?",
        fills: ["product, service, or approach"],
      },
      {
        question: "What three practical actions or improvements does it enable in that moment?",
        fills: ["help 1", "help 2", "help 3"],
      },
      {
        question: "What immediate benefit does the user notice?",
        fills: ["immediate benefit"],
      },
      {
        question: "What longer-term benefit can follow when the moment is handled better repeatedly?",
        fills: ["long-term benefit"],
      },
      {
        question: "What negative consequence would usually happen without support?",
        fills: ["problem consequence"],
      },
    ],

    ctaStyles: ["use_case", "problem_solution", "offer_bridge", "soft_lead"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not invent a daily scenario that the audience does not actually experience.",
      "Do not describe emotions or thoughts you cannot reasonably know.",
      "Do not turn the moment into a dramatic crisis.",
      "Do not list abstract benefits instead of actions in context.",
      "Do not claim a long-term benefit without explaining how repeated use creates it.",
      "Do not make the product or service appear before the problem is clear.",
      "Do not write the scenario like an advertisement.",
    ],
  }),

  t({
    id: "use_case_story_04",
    name: "Underrated Use Case",
    archetype: "Use Case Story",
    variant: "Evidence-led overlooked value",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Promote my product/service", "Build authority"],

    bestForPillars: ["Product / service education", "Audience belief shift", "Problem education"],

    template: `The most overlooked use case for [product, service, or approach] is [underrated use case].
  
  Most people associate it with [common use case].
  
  That is useful.
  
  But [underrated use case] can also create:
  
  → [benefit 1]
  
  → [benefit 2]
  
  → [benefit 3]
  
  This matters most when [relevant situation].
  
  The reason it works is [mechanism].
  
  The clearest example is [proof or example].
  
  The common use case gets more attention because [reason common use dominates].
  
  The overlooked use case may create more value when [value condition].
  
  Use cases become powerful when they solve a problem people were not connecting to the solution.
  
  [cta]`,

    variables: [
      "product, service, or approach",
      "underrated use case",
      "common use case",
      "benefit 1",
      "benefit 2",
      "benefit 3",
      "relevant situation",
      "mechanism",
      "proof or example",
      "reason common use dominates",
      "value condition",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What product, service, method, or approach are you discussing?",
        fills: ["product, service, or approach"],
      },
      {
        question: "What is the most common way people currently use or understand it?",
        fills: ["common use case"],
      },
      {
        question: "What valuable but overlooked use case have you observed?",
        fills: ["underrated use case"],
      },
      {
        question: "What three specific benefits can the overlooked use case create?",
        fills: ["benefit 1", "benefit 2", "benefit 3"],
      },
      {
        question: "In what situation does this overlooked use case matter most?",
        fills: ["relevant situation"],
      },
      {
        question: "Why does the product, service, or approach create those benefits in that situation?",
        fills: ["mechanism"],
      },
      {
        question: "Do you have a real example, observation, customer pattern, or result that supports this use case?",
        fills: ["proof or example"],
      },
      {
        question: "Why does the common use case receive more attention?",
        fills: ["reason common use dominates"],
      },
      {
        question: "Under what condition might the overlooked use case create more value?",
        fills: ["value condition"],
      },
    ],

    ctaStyles: ["use_case", "authority_reframe", "offer_bridge", "industry_prompt"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not call a use case underrated without evidence or experience.",
      "Do not claim the overlooked use case produces a higher return without support.",
      "Do not invent customer stories, usage patterns, or results.",
      "Do not dismiss the common use case to make the new one appear stronger.",
      "Do not list benefits without explaining the mechanism.",
      "Do not describe an edge case as broadly useful.",
      "Do not force an unexpected use case that the offer was not designed to support.",
    ],
  }),

  t({
    id: "use_case_story_05",
    name: "Feature to Outcome",
    archetype: "Use Case Story",
    variant: "Mechanism-led capability translation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Promote my product/service", "Get inbound leads", "Get job opportunities"],

    bestForPillars: ["Product / service education", "Career / credibility proof", "Problem education"],

    template: `[feature, capability, or skill] sounds like [surface description].
  
  That describes what it is.
  
  It does not explain why it matters.
  
  The real value is [real outcome].
  
  The connection works like this:
  
  Because [feature, capability, or skill] enables [capability in action], [audience] can:
  
  → [practical benefit 1]
  
  → [practical benefit 2]
  
  → [practical benefit 3]
  
  That matters when [real-world situation].
  
  Without it, [negative consequence].
  
  The capability is [feature, capability, or skill].
  
  The outcome is [real outcome].
  
  The mechanism between them is [value mechanism].
  
  That is the part buyers, employers, and clients need to understand.
  
  [cta]`,

    variables: [
      "feature, capability, or skill",
      "surface description",
      "real outcome",
      "capability in action",
      "audience",
      "practical benefit 1",
      "practical benefit 2",
      "practical benefit 3",
      "real-world situation",
      "negative consequence",
      "value mechanism",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What product feature, service capability, professional skill, or area of expertise do you want to explain?",
        fills: ["feature, capability, or skill"],
      },
      {
        question: "How do people usually describe it at a surface level?",
        fills: ["surface description"],
      },
      {
        question: "Who benefits from it?",
        fills: ["audience"],
      },
      {
        question: "What meaningful outcome does it help create?",
        fills: ["real outcome"],
      },
      {
        question: "What does the feature, capability, or skill allow someone to do in practice?",
        fills: ["capability in action"],
      },
      {
        question: "What three practical benefits follow from that capability?",
        fills: ["practical benefit 1", "practical benefit 2", "practical benefit 3"],
      },
      {
        question: "In what real-world situation do those benefits matter most?",
        fills: ["real-world situation"],
      },
      {
        question: "What negative consequence is more likely when this capability is missing?",
        fills: ["negative consequence"],
      },
      {
        question: "What mechanism connects the capability to the final outcome?",
        fills: ["value mechanism"],
      },
    ],

    ctaStyles: ["offer_bridge", "career_signal", "use_case", "soft_lead"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not treat a feature as valuable without connecting it to a user outcome.",
      "Do not claim the feature directly causes the outcome when other conditions are required.",
      "Do not repeat the same phrase for the capability, benefit, and outcome.",
      "Do not use abstract benefits such as efficiency, clarity, or growth without explaining what changes.",
      "Do not invent technical capabilities or performance claims.",
      "Do not ignore the audience or situation in which the capability matters.",
      "Do not overstate a professional skill as a guaranteed business result.",
    ],
  }),
  //
  t({
    id: "honest_question_01",
    name: "Question I Keep Coming Back To",
    archetype: "Honest Question",
    variant: "Tension-led thoughtful question",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build network", "Grow my audience"],

    bestForPillars: ["Community / network conversation", "Point of view", "Audience belief shift"],

    template: `I keep coming back to one question about [topic]:
  
  "[question]"
  
  The question keeps surfacing because [observation].
  
  One side says [side 1].
  
  That makes sense when [condition supporting side 1].
  
  The other side says [side 2].
  
  That makes sense when [condition supporting side 2].
  
  The real tension is [core tension].
  
  It matters because the answer changes [decision affected].
  
  My current view is [current perspective].
  
  But I am still unsure about [unresolved part].
  
  For people dealing with this directly:
  
  What evidence or experience is shaping your view?
  
  [cta]`,

    variables: [
      "topic",
      "question",
      "observation",
      "side 1",
      "condition supporting side 1",
      "side 2",
      "condition supporting side 2",
      "core tension",
      "decision affected",
      "current perspective",
      "unresolved part",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What topic have you been thinking about repeatedly?",
        fills: ["topic"],
      },
      {
        question: "What specific question keeps coming back to you?",
        fills: ["question"],
      },
      {
        question: "What repeated observation, event, or pattern keeps raising this question?",
        fills: ["observation"],
      },
      {
        question: "What is the strongest case for the first side, and when does that view make sense?",
        fills: ["side 1", "condition supporting side 1"],
      },
      {
        question: "What is the strongest case for the second side, and when does that view make sense?",
        fills: ["side 2", "condition supporting side 2"],
      },
      {
        question: "What is the real tension between the two positions?",
        fills: ["core tension"],
      },
      {
        question: "What decision, behavior, or strategy changes depending on the answer?",
        fills: ["decision affected"],
      },
      {
        question: "What is your current perspective, and what part are you still unsure about?",
        fills: ["current perspective", "unresolved part"],
      },
    ],

    ctaStyles: ["peer_question", "shared_learning", "conversation", "industry_prompt"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not pretend to be undecided when you already have a firm conclusion.",
      "Do not ask a broad question that can be answered with yes or no.",
      "Do not present one side as obviously foolish.",
      "Do not create a false balance when one side lacks credible support.",
      "Do not use a question only to disguise a strong opinion.",
      "Do not ask the audience to solve a problem you have not explained.",
      "Do not end with a generic question such as 'Thoughts?'",
    ],
  }),

  t({
    id: "honest_question_02",
    name: "How Are Others Handling This",
    archetype: "Honest Question",
    variant: "Trade-off-led peer input",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build network", "Grow my audience"],

    bestForPillars: ["Community / network conversation", "Problem education", "Market / industry observation"],

    template: `[audience] are making very different choices about [challenge].
  
  The three approaches I see most often are:
  
  → [option 1]
  
  → [option 2]
  
  → [option 3]
  
  Each solves one problem and creates another.
  
  [option 1] improves [benefit 1], but creates [tradeoff 1].
  
  [option 2] improves [benefit 2], but creates [tradeoff 2].
  
  [option 3] improves [benefit 3], but creates [tradeoff 3].
  
  The hardest part seems to be [hardest decision].
  
  My current approach is [current approach].
  
  It works well when [condition where current approach works].
  
  It becomes weaker when [condition where current approach breaks].
  
  For people handling [challenge] right now:
  
  What approach are you using, and what trade-off have you accepted?
  
  [cta]`,

    variables: [
      "audience",
      "challenge",
      "option 1",
      "option 2",
      "option 3",
      "benefit 1",
      "benefit 2",
      "benefit 3",
      "tradeoff 1",
      "tradeoff 2",
      "tradeoff 3",
      "hardest decision",
      "current approach",
      "condition where current approach works",
      "condition where current approach breaks",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is facing the challenge, and what recurring challenge are you seeing?",
        fills: ["audience", "challenge"],
      },
      {
        question: "What three approaches are people currently using?",
        fills: ["option 1", "option 2", "option 3"],
      },
      {
        question: "What benefit does each option provide?",
        fills: ["benefit 1", "benefit 2", "benefit 3"],
      },
      {
        question: "What trade-off or downside comes with each option?",
        fills: ["tradeoff 1", "tradeoff 2", "tradeoff 3"],
      },
      {
        question: "What is the hardest decision people have to make when choosing between these options?",
        fills: ["hardest decision"],
      },
      {
        question: "What approach are you currently using or leaning toward?",
        fills: ["current approach"],
      },
      {
        question: "When does your current approach work well, and when does it become less effective?",
        fills: ["condition where current approach works", "condition where current approach breaks"],
      },
    ],

    ctaStyles: ["peer_question", "collaboration", "conversation", "shared_learning"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not claim that more people are struggling unless you have observed a real pattern.",
      "Do not invent options merely to create a three-part list.",
      "Do not describe trade-offs that are unrealistic or trivial.",
      "Do not ask for peer input when you are actually promoting one option.",
      "Do not hide your own current approach when it would add useful context.",
      "Do not frame every option as equally strong.",
      "Do not ask a question so broad that useful answers are unlikely.",
    ],
  }),

  t({
    id: "honest_question_03",
    name: "Torn Between Two Views",
    archetype: "Honest Question",
    variant: "Decision-led balanced tension",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build network", "Grow my audience", "Build authority"],

    bestForPillars: ["Community / network conversation", "Point of view", "Audience belief shift"],

    template: `I am torn between two defensible views on [topic].
  
  View 1:
  
  [view 1].
  
  The strongest argument for it is [reason 1].
  
  It works best when [condition 1].
  
  View 2:
  
  [view 2].
  
  The strongest argument for it is [reason 2].
  
  It works best when [condition 2].
  
  The conflict is not really about [surface disagreement].
  
  It is about [deeper tension].
  
  Right now, I am leaning toward [current leaning].
  
  That is mainly because [reason for leaning].
  
  The part I have not resolved is [unresolved question].
  
  What evidence would change your mind on this?
  
  [cta]`,

    variables: [
      "topic",
      "view 1",
      "reason 1",
      "condition 1",
      "view 2",
      "reason 2",
      "condition 2",
      "surface disagreement",
      "deeper tension",
      "current leaning",
      "reason for leaning",
      "unresolved question",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What topic are you genuinely torn about?",
        fills: ["topic"],
      },
      {
        question: "What is the first view, and what is the strongest argument supporting it?",
        fills: ["view 1", "reason 1"],
      },
      {
        question: "Under what conditions does the first view work best?",
        fills: ["condition 1"],
      },
      {
        question: "What is the second view, and what is the strongest argument supporting it?",
        fills: ["view 2", "reason 2"],
      },
      {
        question: "Under what conditions does the second view work best?",
        fills: ["condition 2"],
      },
      {
        question: "What surface-level disagreement do people focus on?",
        fills: ["surface disagreement"],
      },
      {
        question: "What deeper trade-off or tension is the disagreement really about?",
        fills: ["deeper tension"],
      },
      {
        question: "Which view are you currently leaning toward, and why?",
        fills: ["current leaning", "reason for leaning"],
      },
      {
        question: "What important question or piece of evidence remains unresolved?",
        fills: ["unresolved question"],
      },
    ],

    ctaStyles: ["shared_learning", "peer_question", "industry_prompt", "conversation"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not claim to be torn when one view clearly matches your position.",
      "Do not weaken one side to make the other easier to defend.",
      "Do not create a false binary when other credible options exist.",
      "Do not present unsupported claims as equally valid views.",
      "Do not confuse uncertainty with lack of preparation.",
      "Do not hide your current leaning.",
      "Do not ask 'What am I missing?' without naming the unresolved issue.",
    ],
  }),

  t({
    id: "honest_question_04",
    name: "What's Changed For You",
    archetype: "Honest Question",
    variant: "Evidence-led perspective shift prompt",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build network", "Grow my audience"],

    bestForPillars: ["Community / network conversation", "Market / industry observation", "Audience belief shift"],

    template: `[field or topic] works differently now than it did [comparison period].
  
  Back then, [old reality].
  
  Today, [new reality].
  
  The clearest signals are:
  
  → [evidence of change 1]
  
  → [evidence of change 2]
  
  → [evidence of change 3]
  
  That shift changes how [audience] approach:
  
  → [change 1]
  
  → [change 2]
  
  → [change 3]
  
  My current take is [current take].
  
  But I am still watching [uncertain development].
  
  For people working directly in this area:
  
  What have you stopped doing because the environment changed?
  
  And what are you doing instead?
  
  [cta]`,

    variables: [
      "field or topic",
      "comparison period",
      "old reality",
      "new reality",
      "evidence of change 1",
      "evidence of change 2",
      "evidence of change 3",
      "audience",
      "change 1",
      "change 2",
      "change 3",
      "current take",
      "uncertain development",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What field, market, role, or topic has changed?",
        fills: ["field or topic"],
      },
      {
        question: "What time period are you comparing with the present?",
        fills: ["comparison period"],
      },
      {
        question: "What was true during the earlier period?",
        fills: ["old reality"],
      },
      {
        question: "What is different now?",
        fills: ["new reality"],
      },
      {
        question: "What three observations, behaviors, data points, or market signals show that the change is real?",
        fills: ["evidence of change 1", "evidence of change 2", "evidence of change 3"],
      },
      {
        question: "Who is most affected by this change?",
        fills: ["audience"],
      },
      {
        question: "What three decisions, habits, or strategies does the shift affect?",
        fills: ["change 1", "change 2", "change 3"],
      },
      {
        question: "What is your current interpretation of the change?",
        fills: ["current take"],
      },
      {
        question: "What part of the shift is still uncertain or developing?",
        fills: ["uncertain development"],
      },
    ],

    ctaStyles: ["peer_question", "industry_prompt", "conversation", "shared_learning"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim an industry has changed without supporting observations.",
      "Do not use vague periods such as 'a few years ago' when a clearer comparison is available.",
      "Do not confuse a personal experience with a broad market shift.",
      "Do not invent trends, data, or industry behavior.",
      "Do not present a developing change as settled fact.",
      "Do not ask what changed for others without first providing a useful perspective.",
      "Do not make all three implications versions of the same change.",
    ],
  }),

  t({
    id: "honest_question_05",
    name: "Looking for Better Examples",
    archetype: "Honest Question",
    variant: "Criteria-led community sourcing",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build network", "Grow my audience"],

    bestForPillars: ["Community / network conversation", "Market / industry observation"],

    template: `I am looking for strong examples of [thing].
  
  Most examples I find fall into one of three categories:
  
  → [weak example type 1]
  
  → [weak example type 2]
  
  → [weak example type 3]
  
  What I am trying to find is something that:
  
  → [desired example trait 1]
  
  → [desired example trait 2]
  
  → [desired example trait 3]
  
  The strongest example I have found so far is [current best example].
  
  It is useful because [why current example is useful].
  
  But it still falls short on [remaining gap].
  
  This matters because [reason it matters].
  
  Have you seen an example that meets these criteria?
  
  A link, name, or brief explanation would be useful.
  
  [cta]`,

    variables: [
      "thing",
      "weak example type 1",
      "weak example type 2",
      "weak example type 3",
      "desired example trait 1",
      "desired example trait 2",
      "desired example trait 3",
      "current best example",
      "why current example is useful",
      "remaining gap",
      "reason it matters",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What are you looking for examples of?",
        fills: ["thing"],
      },
      {
        question: "What three types of weak or unhelpful examples do you keep finding?",
        fills: ["weak example type 1", "weak example type 2", "weak example type 3"],
      },
      {
        question: "What three specific qualities would make an example genuinely useful?",
        fills: ["desired example trait 1", "desired example trait 2", "desired example trait 3"],
      },
      {
        question: "What is the strongest example you have found so far?",
        fills: ["current best example"],
      },
      {
        question: "What makes that example useful?",
        fills: ["why current example is useful"],
      },
      {
        question: "What important criterion does the current example still fail to meet?",
        fills: ["remaining gap"],
      },
      {
        question: "Why does finding a stronger example matter to your work, decision, research, or audience?",
        fills: ["reason it matters"],
      },
    ],

    ctaStyles: ["peer_question", "collaboration", "shared_learning", "conversation"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not ask the community to do research you have not attempted yourself.",
      "Do not use vague criteria such as good, creative, strong, or authentic without defining them.",
      "Do not criticize existing examples without explaining what is missing.",
      "Do not invent a current best example.",
      "Do not ask for examples that violate privacy, confidentiality, or intellectual property.",
      "Do not make the request so narrow that no useful answer is possible.",
      "Do not hide a promotional request inside a community-sourcing post.",
    ],
  }),
  //
  t({
    id: "hiring_philosophy_01",
    name: "We Don't Hire for X",
    archetype: "Hiring Philosophy",
    variant: "Evidence-led hiring signal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Recruit / hire talent", "Build authority"],

    bestForPillars: ["Hiring / culture", "Values / philosophy", "Mistakes and misconceptions"],

    template: `[surface trait] gets too much attention in hiring.
  
  We care more about [deeper trait].
  
  In our work, [work context].
  
  That means people regularly need to:
  
  → [trait in action 1]
  
  → [trait in action 2]
  
  → [trait in action 3]
  
  Skills still matter.
  
  But skills can be difficult to use well without [deeper trait].
  
  The strongest evidence is [proof signal].
  
  A poor fit tends to [wrong-fit behavior].
  
  A strong fit tends to [right-fit behavior].
  
  We are not lowering the standard.
  
  We are measuring the signal that matters most for the work.
  
  [cta]`,

    variables: [
      "surface trait",
      "deeper trait",
      "work context",
      "trait in action 1",
      "trait in action 2",
      "trait in action 3",
      "proof signal",
      "wrong-fit behavior",
      "right-fit behavior",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What credential, personality trait, background, or surface-level signal do people overvalue when hiring for this work?",
        fills: ["surface trait"],
      },
      {
        question: "What deeper capability or behavior matters more in your environment?",
        fills: ["deeper trait"],
      },
      {
        question: "What is it about the actual work that makes this deeper trait important?",
        fills: ["work context"],
      },
      {
        question: "What three observable behaviors show the deeper trait in action?",
        fills: ["trait in action 1", "trait in action 2", "trait in action 3"],
      },
      {
        question: "What evidence from past work, interviews, exercises, or references helps you assess this trait?",
        fills: ["proof signal"],
      },
      {
        question: "What behavior suggests someone may struggle in the role?",
        fills: ["wrong-fit behavior"],
      },
      {
        question: "What contrasting behavior suggests someone is likely to thrive?",
        fills: ["right-fit behavior"],
      },
    ],

    ctaStyles: ["hiring_signal", "culture_invite", "belief_statement", "role_invite"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not dismiss relevant skills, credentials, or experience merely to sound contrarian.",
      "Do not use vague traits such as hunger, passion, attitude, or culture fit without behavioral evidence.",
      "Do not describe personality preferences as job requirements.",
      "Do not imply that one background or career path is inherently superior.",
      "Do not use coded language that could exclude qualified candidates unfairly.",
      "Do not claim to assess a deeper trait without naming the evidence used.",
      "Do not frame a poor fit as a flaw in the candidate's character.",
    ],
  }),

  t({
    id: "hiring_philosophy_02",
    name: "Who Thrives Here",
    archetype: "Hiring Philosophy",
    variant: "Environment-led fit signal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Recruit / hire talent"],

    bestForPillars: ["Hiring / culture", "Values / philosophy", "Behind the scenes"],

    template: `The people who thrive at [company or team] usually share a few working habits.
  
  They:
  
  → [thriving behavior 1]
  
  → [thriving behavior 2]
  
  → [thriving behavior 3]
  
  → [thriving behavior 4]
  
  Those habits matter because this environment includes [environment reality].
  
  People tend to enjoy the work when they value [positive environment trait].
  
  They may struggle when they need [poor-fit need].
  
  That does not make either working style better.
  
  It means the environment and the person may not match.
  
  We try to make that clear before anyone accepts the role.
  
  Good hiring is not only about whether someone can do the work.
  
  It is also about whether they can do it well in the environment that actually exists.
  
  [cta]`,

    variables: [
      "company or team",
      "thriving behavior 1",
      "thriving behavior 2",
      "thriving behavior 3",
      "thriving behavior 4",
      "environment reality",
      "positive environment trait",
      "poor-fit need",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What company, team, practice, or working environment are you describing?",
        fills: ["company or team"],
      },
      {
        question: "What four observable working habits are common among people who thrive there?",
        fills: ["thriving behavior 1", "thriving behavior 2", "thriving behavior 3", "thriving behavior 4"],
      },
      {
        question: "What honest feature of the environment makes those habits important?",
        fills: ["environment reality"],
      },
      {
        question: "What type of working environment or responsibility do successful team members tend to enjoy?",
        fills: ["positive environment trait"],
      },
      {
        question: "What type of support, structure, pace, certainty, or supervision may be difficult for the environment to provide?",
        fills: ["poor-fit need"],
      },
    ],

    ctaStyles: ["hiring_signal", "culture_invite", "role_invite", "work_style"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not use culture fit as a substitute for similarity or personal preference.",
      "Do not describe overwork, constant urgency, or poor management as positive fit signals.",
      "Do not imply that people who need structure, feedback, or support are weak.",
      "Do not hide difficult features of the working environment.",
      "Do not describe personality traits when observable work behaviors are available.",
      "Do not present one working style as morally superior.",
      "Do not make the environment sound more flexible or supportive than it is.",
    ],
  }),

  t({
    id: "hiring_philosophy_03",
    name: "The Work Is Not for Everyone",
    archetype: "Hiring Philosophy",
    variant: "Reality-led role expectations",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Recruit / hire talent"],

    bestForPillars: ["Hiring / culture", "Behind the scenes", "Product / service education"],

    template: `[role or work] has a demanding side that candidates should understand upfront.
  
  The work requires:
  
  → [requirement 1]
  
  → [requirement 2]
  
  → [requirement 3]
  
  On a difficult day, that may mean [hard reality 1].
  
  On another day, it may mean [hard reality 2].
  
  The challenge is balanced by [support or positive reality].
  
  This role tends to suit people who enjoy [energizing challenge].
  
  It may drain people who prefer [poor-fit preference].
  
  Neither preference is wrong.
  
  But pretending the role offers a different reality creates a bad hire for everyone.
  
  I would rather describe the work accurately than sell an opportunity someone will regret accepting.
  
  [cta]`,

    variables: [
      "role or work",
      "requirement 1",
      "requirement 2",
      "requirement 3",
      "hard reality 1",
      "hard reality 2",
      "support or positive reality",
      "energizing challenge",
      "poor-fit preference",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What role, responsibility, or type of work are you describing?",
        fills: ["role or work"],
      },
      {
        question: "What three real capabilities, behaviors, or responsibilities does the work require?",
        fills: ["requirement 1", "requirement 2", "requirement 3"],
      },
      {
        question: "What are two difficult but accurate realities someone may experience in the role?",
        fills: ["hard reality 1", "hard reality 2"],
      },
      {
        question: "What support, autonomy, learning, compensation, teamwork, or positive feature balances those demands?",
        fills: ["support or positive reality"],
      },
      {
        question: "What kind of challenge tends to energize people who enjoy this work?",
        fills: ["energizing challenge"],
      },
      {
        question: "What reasonable working preference may indicate that this role is not a strong fit?",
        fills: ["poor-fit preference"],
      },
    ],

    ctaStyles: ["hiring_signal", "culture_invite", "role_invite", "belief_statement"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not make the role sound toxic, heroic, or unnecessarily extreme.",
      "Do not glorify burnout, long hours, constant urgency, or poor boundaries.",
      "Do not frame weak management as a need for independence.",
      "Do not describe preventable organizational problems as unavoidable parts of the work.",
      "Do not list demands without explaining the support available.",
      "Do not shame candidates whose preferences do not match the role.",
      "Do not hide material expectations involving schedule, workload, travel, compensation, or availability.",
    ],
  }),

  t({
    id: "hiring_philosophy_04",
    name: "What We Look for in Interviews",
    archetype: "Hiring Philosophy",
    variant: "Evidence-led interview signals",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Recruit / hire talent", "Build authority"],

    bestForPillars: ["Hiring / culture", "Process / how-I-work", "Career / credibility proof"],

    template: `The interview signal I trust most is [signal].
  
  Not because [wrong reason].
  
  Because it reveals [real reason].
  
  Strong evidence usually sounds like:
  
  → [strong signal 1]
  
  → [strong signal 2]
  
  → [strong signal 3]
  
  Signals that require more investigation include:
  
  → [weak signal 1]
  
  → [weak signal 2]
  
  → [weak signal 3]
  
  None of these should decide the interview alone.
  
  So we test them through [assessment method].
  
  The goal is not to reward the most polished speaker.
  
  It is to understand how someone [job-relevant behavior].
  
  A strong interview process looks for evidence.
  
  It does not rely on instinct dressed up as judgment.
  
  [cta]`,

    variables: [
      "signal",
      "wrong reason",
      "real reason",
      "strong signal 1",
      "strong signal 2",
      "strong signal 3",
      "weak signal 1",
      "weak signal 2",
      "weak signal 3",
      "assessment method",
      "job-relevant behavior",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What interview signal do you pay close attention to?",
        fills: ["signal"],
      },
      {
        question: "What shallow or incorrect reason might people assume you value that signal?",
        fills: ["wrong reason"],
      },
      {
        question: "What job-relevant capability does the signal actually help reveal?",
        fills: ["real reason", "job-relevant behavior"],
      },
      {
        question: "What three specific answers, examples, or behaviors provide strong evidence?",
        fills: ["strong signal 1", "strong signal 2", "strong signal 3"],
      },
      {
        question: "What three signals require additional investigation rather than immediate rejection?",
        fills: ["weak signal 1", "weak signal 2", "weak signal 3"],
      },
      {
        question: "What structured exercise, work sample, reference check, or follow-up question do you use to verify the signal?",
        fills: ["assessment method"],
      },
    ],

    ctaStyles: ["hiring_signal", "belief_statement", "culture_invite", "career_signal"],

    proofRequirement: "none",

    antiPatterns: [
      "Do not treat confidence, charisma, eye contact, accent, or similarity as proof of competence.",
      "Do not use instinct as the only hiring method.",
      "Do not describe a weak signal as an automatic reason for rejection.",
      "Do not rely on questions unrelated to the actual work.",
      "Do not use unpaid assignments that require unreasonable effort or produce usable company work.",
      "Do not imply that polished communication is irrelevant when the role genuinely requires it.",
      "Do not use interview signals that may unfairly disadvantage candidates with different communication styles or disabilities.",
      "Do not claim to know how someone thinks from one answer alone.",
    ],
  }),

  t({
    id: "hiring_philosophy_05",
    name: "Culture Is Behavior",
    archetype: "Hiring Philosophy",
    variant: "Accountability-led culture standards",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Recruit / hire talent", "Build authority"],

    bestForPillars: ["Hiring / culture", "Values / philosophy", "Behind the scenes"],

    template: `Culture becomes visible when a value costs something.
  
  It is not [fake culture signal].
  
  It is what happens when:
  
  → [behavior 1]
  
  → [behavior 2]
  
  → [behavior 3]
  
  → [behavior 4]
  
  We say we value [value].
  
  That claim is only credible if we [supporting action].
  
  If leaders tolerate [opposite behavior], the written value stops mattering.
  
  The real test is [pressure situation].
  
  That is when people learn whether the value is a standard or a slogan.
  
  Culture is shaped by what gets rewarded, corrected, protected, and repeated.
  
  [cta]`,

    variables: [
      "fake culture signal",
      "behavior 1",
      "behavior 2",
      "behavior 3",
      "behavior 4",
      "value",
      "supporting action",
      "opposite behavior",
      "pressure situation",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What surface-level signal do companies often mistake for culture?",
        fills: ["fake culture signal"],
      },
      {
        question: "What value matters most in your team or organization?",
        fills: ["value"],
      },
      {
        question: "What four observable behaviors show that the value is practiced?",
        fills: ["behavior 1", "behavior 2", "behavior 3", "behavior 4"],
      },
      {
        question: "What policy, decision, leadership behavior, or resource commitment supports the value?",
        fills: ["supporting action"],
      },
      {
        question: "What tolerated behavior would directly contradict the stated value?",
        fills: ["opposite behavior"],
      },
      {
        question: "What difficult or high-pressure situation provides the clearest test of whether the value is real?",
        fills: ["pressure situation"],
      },
    ],

    ctaStyles: ["culture_invite", "hiring_signal", "belief_statement", "conversation"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not describe perks, slogans, office design, or social events as complete evidence of culture.",
      "Do not claim a value is real without naming supporting behavior or decisions.",
      "Do not invent cultural practices that the organization does not consistently follow.",
      "Do not present leadership intentions as employee experience.",
      "Do not use culture language to excuse poor pay, weak management, or excessive workload.",
      "Do not claim zero tolerance for behavior that is routinely accepted.",
      "Do not describe culture as fixed or universally experienced by every employee.",
      "Do not use values language without acknowledging how the standard is enforced.",
    ],
  }),
  //
  t({
    id: "career_proof_01",
    name: "One Project Taught Me",
    archetype: "Career Proof",
    variant: "Challenge-led project proof",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get job opportunities", "Build authority"],

    bestForPillars: ["Career / credibility proof", "Process / how-I-work", "Personal story"],

    template: `[project outcome or challenge] tested my ability to [skill] more than any course had.
  
  The project involved [project context].
  
  My responsibility was [responsibility].
  
  At first, the obvious challenge looked like [obvious difficulty].
  
  The real difficulty was [real difficulty].
  
  To move the project forward, I:
  
  → [action 1]
  
  → [action 2]
  
  → [action 3]
  
  The most important decision was [key decision].
  
  That led to [observable result].
  
  The project taught me [lesson].
  
  More importantly, it proved that I can [capability proved] when [difficult condition].
  
  That is the kind of work I want to keep doing.
  
  [cta]`,

    variables: [
      "project outcome or challenge",
      "skill",
      "project context",
      "responsibility",
      "obvious difficulty",
      "real difficulty",
      "action 1",
      "action 2",
      "action 3",
      "key decision",
      "observable result",
      "lesson",
      "capability proved",
      "difficult condition",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real project, assignment, campaign, launch, or initiative are you discussing?",
        fills: ["project context"],
      },
      {
        question: "What outcome or challenge made the project important?",
        fills: ["project outcome or challenge"],
      },
      {
        question: "What skill did the project test or strengthen?",
        fills: ["skill"],
      },
      {
        question: "What were you personally responsible for?",
        fills: ["responsibility"],
      },
      {
        question: "What looked like the obvious difficulty at first?",
        fills: ["obvious difficulty"],
      },
      {
        question: "What turned out to be the real difficulty?",
        fills: ["real difficulty"],
      },
      {
        question: "What three specific actions did you take?",
        fills: ["action 1", "action 2", "action 3"],
      },
      {
        question: "What decision had the greatest effect on the project?",
        fills: ["key decision"],
      },
      {
        question: "What measurable or clearly observable result followed?",
        fills: ["observable result"],
      },
      {
        question: "What lesson did you take from the experience?",
        fills: ["lesson"],
      },
      {
        question: "What capability did the project prove, and under what difficult condition?",
        fills: ["capability proved", "difficult condition"],
      },
    ],

    ctaStyles: ["career_signal", "work_style", "open_to_conversation", "collaboration"],

    proofRequirement: "required",

    antiPatterns: [
      "Do not invent a project, responsibility, decision, or result.",
      "Do not claim credit for work completed by other people.",
      "Do not describe team results as individual results without context.",
      "Do not exaggerate the difficulty to make the work sound more impressive.",
      "Do not use a vague lesson such as communication matters or never give up.",
      "Do not sound desperate for an opportunity.",
      "Do not reveal confidential or identifying project information.",
    ],
  }),

  t({
    id: "career_proof_02",
    name: "How I Solve Problems",
    archetype: "Career Proof",
    variant: "Method-led problem-solving proof",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get job opportunities", "Build authority", "Get inbound leads"],

    bestForPillars: ["Career / credibility proof", "Process / how-I-work", "Problem education"],

    template: `The problems I solve best rarely arrive in a clean format.
  
  They usually involve [problem type].
  
  At the start, that often means:
  
  → [messy element 1]
  
  → [messy element 2]
  
  → [messy element 3]
  
  My first move is [approach step 1].
  
  That helps me establish [first output].
  
  Then I [approach step 2].
  
  That reveals [key insight].
  
  Only then do I [approach step 3].
  
  That is where [desired outcome] becomes possible.
  
  My strongest contribution is [strength].
  
  It is especially useful when [ideal context].
  
  The proof is [proof example].
  
  I do my best work when the problem needs structure before it needs speed.
  
  [cta]`,

    variables: [
      "problem type",
      "messy element 1",
      "messy element 2",
      "messy element 3",
      "approach step 1",
      "first output",
      "approach step 2",
      "key insight",
      "approach step 3",
      "desired outcome",
      "strength",
      "ideal context",
      "proof example",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What type of problem are you especially good at solving?",
        fills: ["problem type"],
      },
      {
        question: "What three forms of confusion, ambiguity, risk, or complexity usually appear at the beginning?",
        fills: ["messy element 1", "messy element 2", "messy element 3"],
      },
      {
        question: "What is the first step in your approach, and what does it establish?",
        fills: ["approach step 1", "first output"],
      },
      {
        question: "What is the second step, and what important insight does it reveal?",
        fills: ["approach step 2", "key insight"],
      },
      {
        question: "What is the third step, and what outcome does it support?",
        fills: ["approach step 3", "desired outcome"],
      },
      {
        question: "What specific strength do you bring to this kind of problem?",
        fills: ["strength"],
      },
      {
        question: "Under what conditions is that strength most valuable?",
        fills: ["ideal context"],
      },
      {
        question: "What real example, project, result, or repeated pattern supports this claim?",
        fills: ["proof example"],
      },
    ],

    ctaStyles: ["work_style", "career_signal", "soft_lead", "open_to_conversation"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim to be good at a problem without evidence or a clear method.",
      "Do not use broad strengths such as strategic, creative, analytical, or hardworking without qualification.",
      "Do not make all three process steps generic.",
      "Do not describe messiness without explaining how you create structure.",
      "Do not invent proof, projects, or results.",
      "Do not present one problem-solving style as suitable for every context.",
      "Do not turn the post into a list of personal adjectives.",
    ],
  }),

  t({
    id: "career_proof_03",
    name: "What I Want More Of",
    archetype: "Career Proof",
    variant: "Fit-led opportunity signal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get job opportunities", "Build network"],

    bestForPillars: ["Career / credibility proof", "Personal story", "Values / philosophy"],

    template: `I want to do more work involving [work type].
  
  The best versions of that work combine:
  
  → [energizing element 1]
  
  → [energizing element 2]
  
  → [energizing element 3]
  
  I have already done versions of it through [past experience].
  
  One example was [specific example].
  
  My favorite part was [specific part].
  
  It allowed me to use [relevant strength] to create [useful outcome].
  
  The strongest fit would include [fit signal].
  
  A weaker fit would involve [poor-fit condition].
  
  I am not looking for every possible opportunity.
  
  I am looking for work where my strengths match the problem and the environment.
  
  [cta]`,

    variables: [
      "work type",
      "energizing element 1",
      "energizing element 2",
      "energizing element 3",
      "past experience",
      "specific example",
      "specific part",
      "relevant strength",
      "useful outcome",
      "fit signal",
      "poor-fit condition",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What specific type of work, project, responsibility, or problem do you want more of?",
        fills: ["work type"],
      },
      {
        question: "What three elements make that work especially engaging or meaningful to you?",
        fills: ["energizing element 1", "energizing element 2", "energizing element 3"],
      },
      {
        question: "What past role, project, client work, volunteer work, or personal project gave you relevant experience?",
        fills: ["past experience"],
      },
      {
        question: "What specific example best demonstrates that experience?",
        fills: ["specific example"],
      },
      {
        question: "What part of that work did you enjoy most?",
        fills: ["specific part"],
      },
      {
        question: "What strength did you use, and what useful outcome did it help create?",
        fills: ["relevant strength", "useful outcome"],
      },
      {
        question: "What project conditions, team environment, scope, or responsibility would signal a strong fit?",
        fills: ["fit signal"],
      },
      {
        question: "What condition would make an opportunity a weaker fit?",
        fills: ["poor-fit condition"],
      },
    ],

    ctaStyles: ["career_signal", "open_to_conversation", "collaboration", "role_invite"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not sound desperate for any opportunity.",
      "Do not describe the desired work so broadly that it provides no useful signal.",
      "Do not list only what you want without showing what you can contribute.",
      "Do not invent prior experience or outcomes.",
      "Do not criticize past roles, clients, or employers.",
      "Do not imply that less preferred work is beneath you.",
      "Do not use vague fit language such as great culture or exciting challenges without defining it.",
    ],
  }),

  t({
    id: "career_proof_04",
    name: "Skill Built the Hard Way",
    archetype: "Career Proof",
    variant: "Experience-led earned capability",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get job opportunities", "Build authority"],

    bestForPillars: ["Career / credibility proof", "Personal story", "Process / how-I-work"],

    template: `I built [skill] through [hard context].
  
  There was no [easy path].
  
  I had to learn how to:
  
  → [learned behavior 1]
  
  → [learned behavior 2]
  
  → [learned behavior 3]
  
  The hardest part was [hardest part].
  
  The mistake I made early was [early mistake].
  
  The turning point came when [turning point].
  
  That changed how I [changed behavior].
  
  Now the skill helps me [current value].
  
  You can see it when I [observable proof].
  
  Some skills are difficult to capture in one line on a resume.
  
  They become obvious in how someone handles pressure, ambiguity, and decisions.
  
  [cta]`,

    variables: [
      "skill",
      "hard context",
      "easy path",
      "learned behavior 1",
      "learned behavior 2",
      "learned behavior 3",
      "hardest part",
      "early mistake",
      "turning point",
      "changed behavior",
      "current value",
      "observable proof",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What professional skill did you build primarily through real experience?",
        fills: ["skill"],
      },
      {
        question: "What difficult role, project, environment, or recurring challenge forced you to develop it?",
        fills: ["hard context"],
      },
      {
        question: "What easier path, formal preparation, support, or shortcut was unavailable?",
        fills: ["easy path"],
      },
      {
        question: "What three practical behaviors did you have to learn?",
        fills: ["learned behavior 1", "learned behavior 2", "learned behavior 3"],
      },
      {
        question: "What was the hardest part of developing the skill?",
        fills: ["hardest part"],
      },
      {
        question: "What mistake did you make early in the process?",
        fills: ["early mistake"],
      },
      {
        question: "What event, feedback, or realization changed your approach?",
        fills: ["turning point"],
      },
      {
        question: "What do you now do differently?",
        fills: ["changed behavior"],
      },
      {
        question: "How does the skill create value in your work today?",
        fills: ["current value"],
      },
      {
        question: "What observable behavior, decision, or result proves that you have developed the skill?",
        fills: ["observable proof"],
      },
    ],

    ctaStyles: ["career_signal", "work_style", "belief_statement", "open_to_conversation"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not glorify hardship, burnout, poor management, or lack of support.",
      "Do not imply that formal education or easier learning paths are less valuable.",
      "Do not invent a difficult context, mistake, or turning point.",
      "Do not claim a skill without observable proof.",
      "Do not use hardship as a substitute for competence.",
      "Do not make the story unnecessarily dramatic.",
      "Do not reveal confidential details about past employers, clients, or colleagues.",
    ],
  }),

  t({
    id: "career_proof_05",
    name: "What People Come to Me For",
    archetype: "Career Proof",
    variant: "Pattern-led peer recognition",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get job opportunities", "Build authority"],

    bestForPillars: ["Career / credibility proof", "Process / how-I-work", "Personal story"],

    template: `I noticed a pattern in the problems people bring me.
  
  They often ask for help with [thing people ask for].
  
  The request usually starts as [surface request].
  
  But what they need most is [deeper need].
  
  I tend to help by:
  
  → [strength 1]
  
  → [strength 2]
  
  → [strength 3]
  
  A recent example involved [short example].
  
  The key move was [key action].
  
  That led to [example result].
  
  The pattern taught me [realization].
  
  Sometimes your strongest professional signal is repeated trust around the same type of problem.
  
  Pay attention to what people consistently ask you to help untangle.
  
  [cta]`,

    variables: [
      "thing people ask for",
      "surface request",
      "deeper need",
      "strength 1",
      "strength 2",
      "strength 3",
      "short example",
      "key action",
      "example result",
      "realization",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What type of problem or task do colleagues, clients, managers, or peers repeatedly ask you to help with?",
        fills: ["thing people ask for"],
      },
      {
        question: "How do they usually describe the request at first?",
        fills: ["surface request"],
      },
      {
        question: "What do they usually need beneath that initial request?",
        fills: ["deeper need"],
      },
      {
        question: "What three distinct strengths do you use when helping with this problem?",
        fills: ["strength 1", "strength 2", "strength 3"],
      },
      {
        question: "What recent real example can you describe without sharing confidential information?",
        fills: ["short example"],
      },
      {
        question: "What action, decision, or contribution made the biggest difference?",
        fills: ["key action"],
      },
      {
        question: "What honest and observable result followed?",
        fills: ["example result"],
      },
      {
        question: "What did this repeated pattern help you understand about your professional strengths?",
        fills: ["realization"],
      },
    ],

    ctaStyles: ["career_signal", "work_style", "open_to_conversation", "soft_lead"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim that people often seek your help unless there is a genuine repeated pattern.",
      "Do not invent requests, examples, or results.",
      "Do not use peer recognition as a substitute for showing the work.",
      "Do not make the example so vague that it provides no proof.",
      "Do not describe ordinary responsibilities as rare expertise without evidence.",
      "Do not reveal confidential or identifying information.",
      "Do not use false modesty such as 'I do not have all the answers' unless it adds useful context.",
    ],
  }),
  //
  t({
    id: "trend_reframe_01",
    name: "Everyone Is Talking About X",
    archetype: "Trend Reframe",
    variant: "Signal-led trend reframe",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Build network"],

    bestForPillars: ["Market / industry observation", "Point of view", "Audience belief shift"],

    template: `[trend] is getting most of the attention.
  
  But the headline is hiding the more important shift.
  
  The surface story is [surface story].
  
  The deeper shift is [deeper shift].
  
  You can see it in:
  
  → [signal 1]
  
  → [signal 2]
  
  → [signal 3]
  
  Those signals matter because they change [decision or behavior affected].
  
  For [audience], the practical implication is [implication].
  
  Not because [hype reason].
  
  Because [practical reason].
  
  The trend may be temporary.
  
  The behavior underneath it could last much longer.
  
  [cta]`,

    variables: [
      "trend",
      "surface story",
      "deeper shift",
      "signal 1",
      "signal 2",
      "signal 3",
      "decision or behavior affected",
      "audience",
      "implication",
      "hype reason",
      "practical reason",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What trend, development, tool, behavior, or market shift is receiving a lot of attention?",
        fills: ["trend"],
      },
      {
        question: "What surface-level story are most people focusing on?",
        fills: ["surface story"],
      },
      {
        question: "What deeper change do you think the trend represents?",
        fills: ["deeper shift"],
      },
      {
        question: "What three observable signals support your interpretation?",
        fills: ["signal 1", "signal 2", "signal 3"],
      },
      {
        question: "What decision or behavior changes if your interpretation is correct?",
        fills: ["decision or behavior affected"],
      },
      {
        question: "Who is most affected, and what should they understand or do differently?",
        fills: ["audience", "implication"],
      },
      {
        question: "What hype-driven reason are people giving for the trend?",
        fills: ["hype reason"],
      },
      {
        question: "What practical reason makes the deeper shift important?",
        fills: ["practical reason"],
      },
    ],

    ctaStyles: ["industry_prompt", "authority_reframe", "conversation", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not use hype language.",
      "Do not claim everyone is discussing the trend unless it is genuinely widespread.",
      "Do not invent market signals, adoption patterns, or behavioral changes.",
      "Do not present a prediction as an established fact.",
      "Do not call something a deeper shift without explaining the mechanism.",
      "Do not dismiss the surface story if it still explains part of the trend.",
      "Do not make the implication broader than the evidence supports.",
    ],
  }),

  t({
    id: "trend_reframe_02",
    name: "Trend Is Not About X",
    archetype: "Trend Reframe",
    variant: "Decision-led deeper interpretation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Market / industry observation", "Audience belief shift", "Point of view"],

    template: `[trend] is being interpreted as [surface interpretation].
  
  I think that reading is too narrow.
  
  The deeper interpretation is [deeper interpretation].
  
  The distinction matters because each interpretation leads to a different response.
  
  If [audience] treat the trend as [surface interpretation], they will focus on:
  
  → [wrong focus 1]
  
  → [wrong focus 2]
  
  → [wrong focus 3]
  
  If they treat it as [deeper interpretation], they will focus on:
  
  → [better focus 1]
  
  → [better focus 2]
  
  → [better focus 3]
  
  The strongest evidence for this reading is [supporting evidence].
  
  The trend is the same.
  
  The decision it produces depends on how you interpret it.
  
  [cta]`,

    variables: [
      "trend",
      "surface interpretation",
      "deeper interpretation",
      "audience",
      "wrong focus 1",
      "wrong focus 2",
      "wrong focus 3",
      "better focus 1",
      "better focus 2",
      "better focus 3",
      "supporting evidence",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What trend do you want to reinterpret?",
        fills: ["trend"],
      },
      {
        question: "How are most people currently interpreting it?",
        fills: ["surface interpretation"],
      },
      {
        question: "What deeper interpretation do you believe is more useful or accurate?",
        fills: ["deeper interpretation"],
      },
      {
        question: "Who needs to respond to this trend?",
        fills: ["audience"],
      },
      {
        question: "What three areas will they focus on if they follow the surface interpretation?",
        fills: ["wrong focus 1", "wrong focus 2", "wrong focus 3"],
      },
      {
        question: "What three areas should receive more attention under the deeper interpretation?",
        fills: ["better focus 1", "better focus 2", "better focus 3"],
      },
      {
        question: "What evidence, observation, behavior, or mechanism supports your deeper interpretation?",
        fills: ["supporting evidence"],
      },
    ],

    ctaStyles: ["authority_reframe", "industry_prompt", "belief_statement", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not use 'not really about' when the surface interpretation remains materially important.",
      "Do not create a false binary between two interpretations.",
      "Do not invent supporting evidence.",
      "Do not make the deeper interpretation vague or philosophical.",
      "Do not use three wrong focuses that merely repeat the surface interpretation.",
      "Do not recommend better focuses without showing how they follow from the reframe.",
      "Do not present one interpretation as universally correct for every audience.",
    ],
  }),

  t({
    id: "trend_reframe_03",
    name: "Boring Part of the Trend",
    archetype: "Trend Reframe",
    variant: "Execution-led operational reality",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Market / industry observation", "Audience belief shift", "Process / how-I-work"],

    template: `The exciting part of [trend] gets the attention.
  
  The operational part determines whether it creates value.
  
  Most conversations focus on [exciting part].
  
  Far fewer focus on:
  
  → [operational reality 1]
  
  → [operational reality 2]
  
  → [operational reality 3]
  
  Those are the parts that require [required capability].
  
  Without them, the trend tends to produce [failure outcome].
  
  With them, it can produce [useful outcome].
  
  The condition that matters most is [success condition].
  
  The visible innovation may start the conversation.
  
  The operational discipline decides whether the result lasts.
  
  [cta]`,

    variables: [
      "trend",
      "exciting part",
      "operational reality 1",
      "operational reality 2",
      "operational reality 3",
      "required capability",
      "failure outcome",
      "useful outcome",
      "success condition",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What trend is receiving attention in your field?",
        fills: ["trend"],
      },
      {
        question: "What exciting, visible, or highly discussed part gets most of the attention?",
        fills: ["exciting part"],
      },
      {
        question: "What three less visible operational realities determine whether it works?",
        fills: ["operational reality 1", "operational reality 2", "operational reality 3"],
      },
      {
        question: "What capability, process, discipline, or resource is required to handle those realities?",
        fills: ["required capability"],
      },
      {
        question: "What tends to happen when the operational work is ignored?",
        fills: ["failure outcome"],
      },
      {
        question: "What useful outcome becomes possible when the operational work is handled well?",
        fills: ["useful outcome"],
      },
      {
        question: "What condition matters most for turning the trend into durable value?",
        fills: ["success condition"],
      },
    ],

    ctaStyles: ["authority_reframe", "conversation", "belief_statement", "industry_prompt"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not call important work boring in a dismissive way.",
      "Do not imply that operational complexity automatically creates value.",
      "Do not invent implementation problems or outcomes.",
      "Do not glorify unnecessary process, bureaucracy, or manual work.",
      "Do not dismiss innovation merely because execution is difficult.",
      "Do not use operational realities that are unrelated to the trend.",
      "Do not imply that one condition guarantees success.",
    ],
  }),

  t({
    id: "trend_reframe_04",
    name: "What This Changes for Your Audience",
    archetype: "Trend Reframe",
    variant: "Implication-led audience response",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Build network"],

    bestForPillars: ["Market / industry observation", "Problem education", "Audience belief shift"],

    template: `[change] has made three old assumptions less reliable for [audience].
  
  They can no longer assume:
  
  → [old assumption 1]
  
  → [old assumption 2]
  
  → [old assumption 3]
  
  The evidence is showing up through [evidence of change].
  
  That means they need to give more attention to:
  
  → [new focus 1]
  
  → [new focus 2]
  
  → [new focus 3]
  
  The mistake would be treating [change] as [surface interpretation].
  
  The deeper implication is [deeper implication].
  
  The most immediate decision affected is [immediate decision].
  
  The longer-term risk is [long-term risk].
  
  A market change becomes useful when you translate it into a better decision.
  
  [cta]`,

    variables: [
      "change",
      "audience",
      "old assumption 1",
      "old assumption 2",
      "old assumption 3",
      "evidence of change",
      "new focus 1",
      "new focus 2",
      "new focus 3",
      "surface interpretation",
      "deeper implication",
      "immediate decision",
      "long-term risk",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What market, industry, technology, customer, or workplace change are you discussing?",
        fills: ["change"],
      },
      {
        question: "Who is most affected by the change?",
        fills: ["audience"],
      },
      {
        question: "What three assumptions can this audience no longer rely on as confidently?",
        fills: ["old assumption 1", "old assumption 2", "old assumption 3"],
      },
      {
        question: "What evidence, behavior, data, or repeated observation shows that the change is real?",
        fills: ["evidence of change"],
      },
      {
        question: "What three areas need more attention now?",
        fills: ["new focus 1", "new focus 2", "new focus 3"],
      },
      {
        question: "What shallow interpretation of the change could lead people in the wrong direction?",
        fills: ["surface interpretation"],
      },
      {
        question: "What deeper implication should they understand instead?",
        fills: ["deeper implication"],
      },
      {
        question: "What immediate decision does this change affect?",
        fills: ["immediate decision"],
      },
      {
        question: "What longer-term risk could grow if the audience ignores the change?",
        fills: ["long-term risk"],
      },
    ],

    ctaStyles: ["industry_prompt", "diagnostic", "peer_question", "soft_lead"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not declare old assumptions obsolete when they are only becoming less reliable.",
      "Do not invent evidence, market behavior, or long-term risks.",
      "Do not list implications that are too broad to guide action.",
      "Do not use fear to exaggerate the cost of ignoring the change.",
      "Do not imply that every member of the audience should respond in the same way.",
      "Do not confuse a temporary disruption with a permanent shift.",
      "Do not recommend new priorities without connecting them to the evidence.",
    ],
  }),

  t({
    id: "trend_reframe_05",
    name: "Trend I'm Skeptical About",
    archetype: "Trend Reframe",
    variant: "Evidence-led balanced skepticism",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Market / industry observation", "Point of view", "Mistakes and misconceptions"],

    template: `I am skeptical of how [trend] is being applied.
  
  Not because [wrong reason].
  
  Because I keep seeing three problems:
  
  → [concern 1]
  
  → [concern 2]
  
  → [concern 3]
  
  The strongest warning signal is [warning signal].
  
  That said, [trend] can still be useful when:
  
  → [useful condition 1]
  
  → [useful condition 2]
  
  → [useful condition 3]
  
  The key distinction is [key distinction].
  
  My view is not:
  
  "[extreme rejection]"
  
  It is:
  
  "[balanced take]"
  
  A trend deserves neither automatic trust nor automatic rejection.
  
  It deserves clear conditions for use.
  
  [cta]`,

    variables: [
      "trend",
      "wrong reason",
      "concern 1",
      "concern 2",
      "concern 3",
      "warning signal",
      "useful condition 1",
      "useful condition 2",
      "useful condition 3",
      "key distinction",
      "extreme rejection",
      "balanced take",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What trend, practice, tool, or popular idea are you skeptical about?",
        fills: ["trend"],
      },
      {
        question: "What shallow reason might people wrongly assume explains your skepticism?",
        fills: ["wrong reason"],
      },
      {
        question: "What three specific concerns have you observed?",
        fills: ["concern 1", "concern 2", "concern 3"],
      },
      {
        question: "What evidence or warning signal best supports your concern?",
        fills: ["warning signal"],
      },
      {
        question: "Under what three conditions can the trend still be useful?",
        fills: ["useful condition 1", "useful condition 2", "useful condition 3"],
      },
      {
        question: "What key distinction separates responsible use from poor use?",
        fills: ["key distinction"],
      },
      {
        question: "What extreme rejection of the trend do you want to avoid implying?",
        fills: ["extreme rejection"],
      },
      {
        question: "What balanced position best captures your actual view?",
        fills: ["balanced take"],
      },
    ],

    ctaStyles: ["agree_disagree", "industry_prompt", "authority_reframe", "peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not make the skepticism sound like rage-bait.",
      "Do not criticize a trend merely because it is popular.",
      "Do not invent warning signals, failures, or market observations.",
      "Do not present isolated examples as proof of a broad pattern.",
      "Do not make the useful conditions so narrow that the balanced view becomes dishonest.",
      "Do not use an extreme rejection that nobody credible is making.",
      "Do not confuse skepticism with certainty that the trend will fail.",
      "Do not attack people who use or support the trend.",
    ],
  }),
  //
  t({
    id: "customer_pattern_01",
    name: "I Keep Seeing This Pattern",
    archetype: "Customer / Client Pattern",
    variant: "Evidence-led repeated observation",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority"],

    bestForPillars: ["Problem education", "Market / industry observation", "Audience belief shift"],

    template: `[audience] keep chasing [desired outcome] through the same three activities.
  
  They focus on:
  
  → [wrong focus 1]
  
  → [wrong focus 2]
  
  → [wrong focus 3]
  
  Those activities feel productive because [reason wrong focus feels useful].
  
  But across [observation context], I keep seeing a different pattern.
  
  The people who make consistent progress focus on:
  
  → [better focus 1]
  
  → [better focus 2]
  
  → [better focus 3]
  
  The strongest signal is [supporting observation].
  
  The difference is not more [surface activity].
  
  It is better [deeper activity].
  
  That shift leads to [practical outcome].
  
  [cta]`,

    variables: [
      "audience",
      "desired outcome",
      "wrong focus 1",
      "wrong focus 2",
      "wrong focus 3",
      "reason wrong focus feels useful",
      "observation context",
      "better focus 1",
      "better focus 2",
      "better focus 3",
      "supporting observation",
      "surface activity",
      "deeper activity",
      "practical outcome",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is the audience, and what result are they trying to achieve?",
        fills: ["audience", "desired outcome"],
      },
      {
        question: "What three activities or priorities do they commonly over-focus on?",
        fills: ["wrong focus 1", "wrong focus 2", "wrong focus 3"],
      },
      {
        question: "Why do those activities feel productive or logical?",
        fills: ["reason wrong focus feels useful"],
      },
      {
        question: "Where have you observed this pattern, such as client work, customer conversations, projects, or market data?",
        fills: ["observation context"],
      },
      {
        question: "What three priorities distinguish the people who make stronger progress?",
        fills: ["better focus 1", "better focus 2", "better focus 3"],
      },
      {
        question: "What specific observation, result, or repeated behavior best supports this pattern?",
        fills: ["supporting observation"],
      },
      {
        question: "What surface-level activity receives too much attention, and what deeper activity matters more?",
        fills: ["surface activity", "deeper activity"],
      },
      {
        question: "What practical outcome improves when people make that shift?",
        fills: ["practical outcome"],
      },
    ],

    ctaStyles: ["soft_lead", "authority_reframe", "specific_peer_question", "diagnostic"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim a repeated pattern based on one isolated example.",
      "Do not invent client behavior, market observations, or results.",
      "Do not make the wrong focuses sound irrational.",
      "Do not use better focuses that merely reword the desired outcome.",
      "Do not present correlation as proven causation.",
      "Do not compare groups without explaining the observation context.",
      "Do not reduce the conclusion to a vague contrast such as quality over quantity.",
    ],
  }),

  t({
    id: "customer_pattern_02",
    name: "Same Problem in Different Clothes",
    archetype: "Customer / Client Pattern",
    variant: "Mechanism-led shared root cause",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority"],

    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `These three problems often look unrelated:
  
  → [surface problem 1]
  
  → [surface problem 2]
  
  → [surface problem 3]
  
  But they frequently begin with the same breakdown:
  
  [root issue].
  
  The connection works like this:
  
  [root cause mechanism].
  
  When people treat each symptom separately, they usually:
  
  → [separate fix 1]
  
  → [separate fix 2]
  
  → [separate fix 3]
  
  That creates:
  
  → [bad result 1]
  
  → [bad result 2]
  
  → [bad result 3]
  
  The better first move is [root-level intervention].
  
  Once [root issue] improves, the surface problems become easier to address.
  
  Three visible problems can still be one system problem.
  
  [cta]`,

    variables: [
      "surface problem 1",
      "surface problem 2",
      "surface problem 3",
      "root issue",
      "root cause mechanism",
      "separate fix 1",
      "separate fix 2",
      "separate fix 3",
      "bad result 1",
      "bad result 2",
      "bad result 3",
      "root-level intervention",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What three surface problems repeatedly appear together or across similar clients?",
        fills: ["surface problem 1", "surface problem 2", "surface problem 3"],
      },
      {
        question: "What root issue may be contributing to all three?",
        fills: ["root issue"],
      },
      {
        question: "How does that root issue create or worsen each surface problem?",
        fills: ["root cause mechanism"],
      },
      {
        question: "What separate fix do people commonly apply to each surface problem?",
        fills: ["separate fix 1", "separate fix 2", "separate fix 3"],
      },
      {
        question: "What three negative results come from treating the symptoms separately?",
        fills: ["bad result 1", "bad result 2", "bad result 3"],
      },
      {
        question: "What root-level intervention should happen before or alongside the surface-level fixes?",
        fills: ["root-level intervention"],
      },
    ],

    ctaStyles: ["diagnostic", "soft_lead", "authority_reframe", "problem_solution"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not force unrelated problems under one root cause.",
      "Do not use a vague root issue such as strategy, mindset, clarity, or communication without defining it.",
      "Do not imply that fixing the root issue automatically removes every surface problem.",
      "Do not invent customer patterns or outcomes.",
      "Do not recommend ignoring urgent surface symptoms.",
      "Do not claim a causal mechanism without explaining it.",
      "Do not use three bad results that describe the same consequence.",
    ],
  }),

  t({
    id: "customer_pattern_03",
    name: "What the Best Do Differently",
    archetype: "Customer / Client Pattern",
    variant: "Behavior-led strong performer comparison",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Grow my audience", "Recruit / hire talent"],

    bestForPillars: ["Audience belief shift", "Market / industry observation", "Hiring / culture"],

    template: `The strongest [audience] I have worked with approach [topic] differently.
  
  Less effective performers tend to:
  
  → [common behavior 1]
  
  → [common behavior 2]
  
  → [common behavior 3]
  
  Strong performers tend to:
  
  → [strong behavior 1]
  
  → [strong behavior 2]
  
  → [strong behavior 3]
  
  The biggest difference is not [surface difference].
  
  It is [real difference].
  
  You can see it most clearly when [pressure situation].
  
  That is when strong performers [behavior under pressure].
  
  Over time, that shows up in [outcome].
  
  The useful lesson is not to copy their personality.
  
  It is to study the decisions they repeat.
  
  [cta]`,

    variables: [
      "audience",
      "topic",
      "common behavior 1",
      "common behavior 2",
      "common behavior 3",
      "strong behavior 1",
      "strong behavior 2",
      "strong behavior 3",
      "surface difference",
      "real difference",
      "pressure situation",
      "behavior under pressure",
      "outcome",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What type of customer, professional, team, or performer are you comparing?",
        fills: ["audience"],
      },
      {
        question: "What area of work or performance do they approach differently?",
        fills: ["topic"],
      },
      {
        question: "What three behaviors are common among less effective performers?",
        fills: ["common behavior 1", "common behavior 2", "common behavior 3"],
      },
      {
        question: "What three contrasting behaviors are common among strong performers?",
        fills: ["strong behavior 1", "strong behavior 2", "strong behavior 3"],
      },
      {
        question: "What surface-level difference do people often credit incorrectly?",
        fills: ["surface difference"],
      },
      {
        question: "What deeper behavioral or decision-making difference matters more?",
        fills: ["real difference"],
      },
      {
        question: "In what difficult or high-pressure situation does the difference become clearest?",
        fills: ["pressure situation"],
      },
      {
        question: "What do strong performers do in that situation?",
        fills: ["behavior under pressure"],
      },
      {
        question: "What observable outcome tends to improve over time?",
        fills: ["outcome"],
      },
    ],

    ctaStyles: ["belief_statement", "conversation", "hiring_signal", "authority_reframe"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not use 'average' as an insult or character judgment.",
      "Do not compare groups based on one isolated experience.",
      "Do not invent performer behavior or outcomes.",
      "Do not confuse personality, charisma, confidence, or working style with performance.",
      "Do not imply that strong performers never make mistakes.",
      "Do not use behaviors that depend on inaccessible resources without acknowledging them.",
      "Do not present observed correlation as a guaranteed formula for success.",
    ],
  }),

  t({
    id: "customer_pattern_04",
    name: "Underrated Signal",
    archetype: "Customer / Client Pattern",
    variant: "Evidence-led predictive signal",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Recruit / hire talent", "Get inbound leads"],

    bestForPillars: ["Problem education", "Hiring / culture", "Market / industry observation"],

    template: `One early signal tells me a lot about how [future outcome] may unfold:
  
  [underrated signal].
  
  It looks minor at first.
  
  But across [observation context], it often appears before [prediction].
  
  You can see the signal when someone:
  
  → [behavior 1]
  
  → [behavior 2]
  
  → [behavior 3]
  
  The likely mechanism is [predictive mechanism].
  
  The contrasting signal is [opposite signal].
  
  That tends to appear before [negative prediction].
  
  This is not a guarantee.
  
  It is a prompt to investigate [diagnostic area] earlier.
  
  Small signals become valuable when they improve the next question you ask.
  
  [cta]`,

    variables: [
      "future outcome",
      "underrated signal",
      "observation context",
      "prediction",
      "behavior 1",
      "behavior 2",
      "behavior 3",
      "predictive mechanism",
      "opposite signal",
      "negative prediction",
      "diagnostic area",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What future result, working relationship, project outcome, or customer behavior are you trying to anticipate?",
        fills: ["future outcome"],
      },
      {
        question: "What subtle early signal do you pay attention to?",
        fills: ["underrated signal"],
      },
      {
        question: "Where have you repeatedly observed this signal?",
        fills: ["observation context"],
      },
      {
        question: "What later outcome does it appear to precede?",
        fills: ["prediction"],
      },
      {
        question: "What three observable behaviors demonstrate the signal?",
        fills: ["behavior 1", "behavior 2", "behavior 3"],
      },
      {
        question: "Why might those behaviors be connected to the later outcome?",
        fills: ["predictive mechanism"],
      },
      {
        question: "What contrasting signal do you watch for?",
        fills: ["opposite signal"],
      },
      {
        question: "What negative outcome may follow that contrasting signal?",
        fills: ["negative prediction"],
      },
      {
        question: "What should someone investigate when either signal appears?",
        fills: ["diagnostic area"],
      },
    ],

    ctaStyles: ["belief_statement", "hiring_signal", "diagnostic", "specific_peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not describe a signal as predictive based on one anecdote.",
      "Do not present correlation as certainty.",
      "Do not use protected characteristics, personality stereotypes, or personal similarity as predictive signals.",
      "Do not invent customer, employee, or candidate behavior.",
      "Do not treat the opposite signal as automatic proof of a negative outcome.",
      "Do not use vague behaviors that cannot be observed.",
      "Do not make high-stakes decisions from one signal without further investigation.",
    ],
  }),

  t({
    id: "customer_pattern_05",
    name: "What Struggling People Have in Common",
    archetype: "Customer / Client Pattern",
    variant: "System-led stuck pattern",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],

    bestForGoals: ["Get inbound leads", "Build authority"],

    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],

    template: `[audience] who feel stuck with [topic] often share the same operating pattern.
  
  They tend to:
  
  → [pattern 1]
  
  → [pattern 2]
  
  → [pattern 3]
  
  → [pattern 4]
  
  These behaviors do not mean they lack [misjudged trait].
  
  They usually signal [system reframe].
  
  The pattern keeps repeating because [reinforcing mechanism].
  
  The wrong first move is [wrong first step].
  
  That only adds [unhelpful consequence].
  
  The better first move is [better first step].
  
  It helps reveal [useful insight].
  
  The goal is not to work harder inside the same pattern.
  
  It is to change the system producing it.
  
  [cta]`,

    variables: [
      "audience",
      "topic",
      "pattern 1",
      "pattern 2",
      "pattern 3",
      "pattern 4",
      "misjudged trait",
      "system reframe",
      "reinforcing mechanism",
      "wrong first step",
      "unhelpful consequence",
      "better first step",
      "useful insight",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "Who is struggling, and what area or outcome are they stuck on?",
        fills: ["audience", "topic"],
      },
      {
        question: "What four observable behaviors or conditions tend to appear together?",
        fills: ["pattern 1", "pattern 2", "pattern 3", "pattern 4"],
      },
      {
        question: "What personal trait do people unfairly assume is missing, such as discipline, talent, effort, or commitment?",
        fills: ["misjudged trait"],
      },
      {
        question: "What system, process, incentive, constraint, or environment explains the pattern more accurately?",
        fills: ["system reframe"],
      },
      {
        question: "What mechanism keeps the pattern repeating?",
        fills: ["reinforcing mechanism"],
      },
      {
        question: "What do people usually try first that fails to change the system?",
        fills: ["wrong first step"],
      },
      {
        question: "What unhelpful consequence does that first move create?",
        fills: ["unhelpful consequence"],
      },
      {
        question: "What should they do first instead?",
        fills: ["better first step"],
      },
      {
        question: "What useful information or insight will that first step reveal?",
        fills: ["useful insight"],
      },
    ],

    ctaStyles: ["soft_lead", "diagnostic", "authority_reframe", "problem_solution"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not shame or blame the audience.",
      "Do not use struggling as a fixed identity.",
      "Do not assume a system problem when individual skill or effort may also matter.",
      "Do not invent customer patterns or causes.",
      "Do not use vague reframes such as mindset, strategy, or clarity without explanation.",
      "Do not present four behaviors as universal.",
      "Do not promise that one first step will solve the full problem.",
      "Do not frame working harder as always misguided.",
    ],
  }),
  //
  t({
    id: "origin_story_01",
    name: "Why I Started",
    archetype: "Origin Story",
    variant: "Frustration-led founder origin",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Build authority", "Grow my audience", "Promote my product/service"],

    bestForPillars: ["Personal story", "Values / philosophy", "Product / service education"],

    template: `I started [thing] after seeing the same problem too many times.
  
  The frustration was [frustration].
  
  It kept showing up as:
  
  → [problem 1]
  
  → [problem 2]
  
  → [problem 3]
  
  At first, I tried [early response].
  
  But that only addressed [surface issue].
  
  The turning point came when I realized [realization].
  
  So I decided to [decision].
  
  That decision still shapes how I work today.
  
  It is why I prioritize:
  
  → [value 1]
  
  → [value 2]
  
  → [value 3]
  
  The work began because [frustration].
  
  It continues because [mission].
  
  [cta]`,

    variables: [
      "thing",
      "frustration",
      "problem 1",
      "problem 2",
      "problem 3",
      "early response",
      "surface issue",
      "realization",
      "decision",
      "value 1",
      "value 2",
      "value 3",
      "mission",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What business, service, project, community, career path, or body of work did you start?",
        fills: ["thing"],
      },
      {
        question: "What specific frustration pushed you toward starting it?",
        fills: ["frustration"],
      },
      {
        question: "What three recurring problems made the frustration impossible to ignore?",
        fills: ["problem 1", "problem 2", "problem 3"],
      },
      {
        question: "What did you initially try before deciding to build something new?",
        fills: ["early response"],
      },
      {
        question: "What surface-level issue did that early response address without solving the deeper problem?",
        fills: ["surface issue"],
      },
      {
        question: "What realization changed your understanding of the problem?",
        fills: ["realization"],
      },
      {
        question: "What concrete decision did you make after that realization?",
        fills: ["decision"],
      },
      {
        question: "What three values or operating principles still shape the work today?",
        fills: ["value 1", "value 2", "value 3"],
      },
      {
        question: "What larger mission or long-term purpose keeps you committed to the work?",
        fills: ["mission"],
      },
    ],

    ctaStyles: ["relatable", "offer_bridge", "belief_statement", "soft_lead"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent a founder story, frustration, turning point, or mission.",
      "Do not make the origin sound more dramatic than it was.",
      "Do not portray the market or previous providers as incompetent.",
      "Do not use vague values such as excellence, integrity, or impact without showing what they mean.",
      "Do not claim the work began from a mission if it originally began for a different practical reason.",
      "Do not remove commercial motives when they are part of the real story.",
      "Do not turn the origin story into a sales pitch before explaining what happened.",
    ],
  }),

  t({
    id: "origin_story_02",
    name: "Moment It Clicked",
    archetype: "Origin Story",
    variant: "Evidence-led realization moment",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Build authority", "Grow my audience"],

    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Point of view"],

    template: `[topic] clicked for me when [moment].
  
  Before that, I believed [old belief].
  
  That belief kept me [old behavior].
  
  It seemed reasonable because [why old belief made sense].
  
  Then I noticed [revealing evidence].
  
  That made one thing clear:
  
  [realization].
  
  After that, I changed how I worked.
  
  I started:
  
  → [new action 1]
  
  → [new action 2]
  
  → [new action 3]
  
  The immediate difference was [early result].
  
  The larger change was [deeper change].
  
  The moment did not make the work easy.
  
  It made the real problem easier to see.
  
  [cta]`,

    variables: [
      "topic",
      "moment",
      "old belief",
      "old behavior",
      "why old belief made sense",
      "revealing evidence",
      "realization",
      "new action 1",
      "new action 2",
      "new action 3",
      "early result",
      "deeper change",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What topic, problem, skill, or area of work finally became clear to you?",
        fills: ["topic"],
      },
      {
        question: "What specific moment, event, result, conversation, or experience caused the shift?",
        fills: ["moment"],
      },
      {
        question: "What did you believe before that moment?",
        fills: ["old belief"],
      },
      {
        question: "What behavior did that belief cause you to repeat?",
        fills: ["old behavior"],
      },
      {
        question: "Why did the old belief seem reasonable at the time?",
        fills: ["why old belief made sense"],
      },
      {
        question: "What evidence made the old belief harder to defend?",
        fills: ["revealing evidence"],
      },
      {
        question: "What did you realize?",
        fills: ["realization"],
      },
      {
        question: "What three concrete actions changed afterward?",
        fills: ["new action 1", "new action 2", "new action 3"],
      },
      {
        question: "What early result showed that the new approach was useful?",
        fills: ["early result"],
      },
      {
        question: "What deeper change occurred in how you think, decide, or work?",
        fills: ["deeper change"],
      },
    ],

    ctaStyles: ["relatable", "authority_reframe", "conversation", "shared_learning"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent a realization moment or revealing evidence.",
      "Do not present a gradual learning process as one dramatic breakthrough unless it truly was.",
      "Do not make the old belief sound foolish in hindsight.",
      "Do not use a realization that is disconnected from the evidence.",
      "Do not list vague new actions such as work smarter or be more intentional.",
      "Do not claim that one moment solved the full problem.",
      "Do not turn the story into generic motivational advice.",
    ],
  }),

  t({
    id: "origin_story_03",
    name: "Problem I Couldn't Ignore",
    archetype: "Origin Story",
    variant: "Pattern-led conviction story",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Build authority", "Promote my product/service", "Get inbound leads"],

    bestForPillars: ["Personal story", "Problem education", "Values / philosophy"],

    template: `I first noticed [problem] in [first situation].
  
  I assumed it was [early assumption].
  
  Then I saw the same pattern in:
  
  → [situation 1]
  
  → [situation 2]
  
  → [situation 3]
  
  The details changed.
  
  The underlying issue did not.
  
  The pattern was [repeated pattern].
  
  That is when I realized [realization].
  
  Ignoring it would have meant accepting [cost of inaction].
  
  So I started working on [solution or work].
  
  My first step was [first action].
  
  The conviction came from seeing the same problem repeat in different settings.
  
  The work began with observation.
  
  It became a commitment through repetition.
  
  [cta]`,

    variables: [
      "problem",
      "first situation",
      "early assumption",
      "situation 1",
      "situation 2",
      "situation 3",
      "repeated pattern",
      "realization",
      "cost of inaction",
      "solution or work",
      "first action",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What problem kept appearing around you?",
        fills: ["problem"],
      },
      {
        question: "Where did you first notice it?",
        fills: ["first situation"],
      },
      {
        question: "What did you initially assume explained the problem?",
        fills: ["early assumption"],
      },
      {
        question: "What three other situations showed the same problem?",
        fills: ["situation 1", "situation 2", "situation 3"],
      },
      {
        question: "What underlying pattern remained consistent across those situations?",
        fills: ["repeated pattern"],
      },
      {
        question: "What did the repeated pattern make you realize?",
        fills: ["realization"],
      },
      {
        question: "What would have continued happening if nobody addressed it?",
        fills: ["cost of inaction"],
      },
      {
        question: "What work, solution, service, research, or initiative did you begin as a result?",
        fills: ["solution or work"],
      },
      {
        question: "What was the first concrete action you took?",
        fills: ["first action"],
      },
    ],

    ctaStyles: ["offer_bridge", "soft_lead", "belief_statement", "problem_solution"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim a repeated pattern from one isolated example.",
      "Do not invent situations, observations, or costs of inaction.",
      "Do not make the problem sound universally ignored.",
      "Do not portray yourself as the only person willing to address it.",
      "Do not present observation as proof of causation.",
      "Do not exaggerate the cost of inaction to create urgency.",
      "Do not move from problem to offer without explaining the first action taken.",
    ],
  }),

  t({
    id: "origin_story_04",
    name: "Why This Work Matters",
    archetype: "Origin Story",
    variant: "Experience-led personal meaning",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Grow my audience", "Build authority", "Build network"],

    bestForPillars: ["Personal story", "Values / philosophy", "Career / credibility proof"],

    template: `[work or topic] matters to me because [personal reason].
  
  That belief came from [formative experience].
  
  I saw what happened when [problem].
  
  It led to:
  
  → [consequence 1]
  
  → [consequence 2]
  
  → [consequence 3]
  
  Later, I saw what changed when [better path].
  
  That created:
  
  → [positive change 1]
  
  → [positive change 2]
  
  → [positive change 3]
  
  The contrast changed how I understood [work or topic].
  
  Now I care most about [core priority].
  
  For me, the deeper meaning is [deeper meaning].
  
  That is the standard I try to bring to the work.
  
  [cta]`,

    variables: [
      "work or topic",
      "personal reason",
      "formative experience",
      "problem",
      "consequence 1",
      "consequence 2",
      "consequence 3",
      "better path",
      "positive change 1",
      "positive change 2",
      "positive change 3",
      "core priority",
      "deeper meaning",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What work, issue, field, or topic matters deeply to you?",
        fills: ["work or topic"],
      },
      {
        question: "Why does it matter to you personally?",
        fills: ["personal reason"],
      },
      {
        question: "What real experience shaped that personal connection?",
        fills: ["formative experience"],
      },
      {
        question: "What problem did you witness or experience?",
        fills: ["problem"],
      },
      {
        question: "What three specific consequences followed when the problem was not handled well?",
        fills: ["consequence 1", "consequence 2", "consequence 3"],
      },
      {
        question: "What different approach, support, decision, or condition created a better result?",
        fills: ["better path"],
      },
      {
        question: "What three positive changes followed?",
        fills: ["positive change 1", "positive change 2", "positive change 3"],
      },
      {
        question: "What priority now guides how you approach this work?",
        fills: ["core priority"],
      },
      {
        question: "What deeper meaning does the work hold for you today?",
        fills: ["deeper meaning"],
      },
    ],

    ctaStyles: ["relatable", "shared_learning", "belief_statement", "conversation"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not invent personal experiences, consequences, or emotional significance.",
      "Do not say the work is more than work or not just work.",
      "Do not use vague personal meaning without a formative experience.",
      "Do not exploit another person's hardship as content.",
      "Do not reveal sensitive or identifying information without permission.",
      "Do not make the story emotionally dramatic without cause.",
      "Do not claim a better path solved every consequence.",
      "Do not use purpose language to hide the commercial nature of the work.",
    ],
  }),

  t({
    id: "origin_story_05",
    name: "From Annoyance to Offer",
    archetype: "Origin Story",
    variant: "Problem-led offer origin",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Promote my product/service", "Get inbound leads", "Build authority"],

    bestForPillars: ["Product / service education", "Problem education", "Personal story"],

    template: `[offer, product, or service] began with one recurring frustration:
  
  [annoyance].
  
  I kept seeing [audience] struggle with:
  
  → [struggle 1]
  
  → [struggle 2]
  
  → [struggle 3]
  
  The frustrating part was [why it annoyed you].
  
  The available options usually required [painful alternative].
  
  So I started with [first version].
  
  The early feedback showed [early learning].
  
  That led me to build [current solution].
  
  The goal was clear:
  
  Help [audience] achieve [desired outcome] without [painful alternative].
  
  The offer has changed since the first version.
  
  The problem it is designed to solve has not.
  
  [cta]`,

    variables: [
      "offer, product, or service",
      "annoyance",
      "audience",
      "struggle 1",
      "struggle 2",
      "struggle 3",
      "why it annoyed you",
      "painful alternative",
      "first version",
      "early learning",
      "current solution",
      "desired outcome",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What offer, product, service, method, or package are you explaining?",
        fills: ["offer, product, or service"],
      },
      {
        question: "What recurring problem or annoyance motivated you to create it?",
        fills: ["annoyance"],
      },
      {
        question: "Who was experiencing the problem?",
        fills: ["audience"],
      },
      {
        question: "What three specific struggles did they repeatedly face?",
        fills: ["struggle 1", "struggle 2", "struggle 3"],
      },
      {
        question: "Why did this problem frustrate you personally or professionally?",
        fills: ["why it annoyed you"],
      },
      {
        question: "What difficult, expensive, slow, or ineffective alternative did people previously rely on?",
        fills: ["painful alternative"],
      },
      {
        question: "What was the first version of the solution you created?",
        fills: ["first version"],
      },
      {
        question: "What did early users, clients, tests, or results teach you?",
        fills: ["early learning"],
      },
      {
        question: "What does the current version of the solution provide?",
        fills: ["current solution"],
      },
      {
        question: "What realistic outcome is the offer designed to help the audience achieve?",
        fills: ["desired outcome"],
      },
    ],

    ctaStyles: ["offer_bridge", "use_case", "soft_lead", "problem_solution"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not invent an offer origin, early version, feedback, or customer struggle.",
      "Do not claim you built the solution solely to help others if commercial motives also mattered.",
      "Do not portray existing alternatives as useless without evidence.",
      "Do not exaggerate the audience's frustration or the painful alternative.",
      "Do not claim the offer eliminates every difficulty.",
      "Do not skip the early version and learning process if they are central to the story.",
      "Do not turn the story into a direct sales pitch before explaining the problem and evolution.",
    ],
  }),
  //
  t({
    id: "lessons_learned_01",
    name: "Lessons From a Period",
    archetype: "Lessons Learned",
    variant: "Reflection-led timeframe lessons",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority", "Build network"],

    bestForPillars: ["Personal story", "Values / philosophy", "Career / credibility proof"],

    template: `[timeframe] changed how I think about [theme].
  
  Four lessons stayed with me.
  
  1. [lesson 1]
  
  [short explanation 1].
  
  2. [lesson 2]
  
  [short explanation 2].
  
  3. [lesson 3]
  
  [short explanation 3].
  
  4. [lesson 4]
  
  [short explanation 4].
  
  The lesson that changed my behavior most was [biggest lesson].
  
  Before, I tended to [old behavior].
  
  Now, I [new behavior].
  
  That shift matters because [reason].
  
  Some lessons sound obvious until experience forces you to act on them.
  
  [cta]`,

    variables: [
      "timeframe",
      "theme",
      "lesson 1",
      "short explanation 1",
      "lesson 2",
      "short explanation 2",
      "lesson 3",
      "short explanation 3",
      "lesson 4",
      "short explanation 4",
      "biggest lesson",
      "old behavior",
      "new behavior",
      "reason",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What period, project phase, year, quarter, role, or transition should the post reflect on?",
        fills: ["timeframe"],
      },
      {
        question: "What broader theme connects the lessons from that period?",
        fills: ["theme"],
      },
      {
        question: "What four distinct lessons did you learn?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4"],
      },
      {
        question: "What short real explanation, example, or consequence supports each lesson?",
        fills: ["short explanation 1", "short explanation 2", "short explanation 3", "short explanation 4"],
      },
      {
        question: "Which lesson changed your behavior most?",
        fills: ["biggest lesson"],
      },
      {
        question: "What did you tend to do before, and what do you do now?",
        fills: ["old behavior", "new behavior"],
      },
      {
        question: "Why has that behavior change mattered?",
        fills: ["reason"],
      },
    ],

    ctaStyles: ["relatable", "conversation", "shared_learning", "belief_statement"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not list generic lessons that could come from any period.",
      "Do not include four lessons that repeat the same idea.",
      "Do not invent a transformation or behavior change.",
      "Do not use a timeframe without explaining what happened during it.",
      "Do not make every lesson sound equally important.",
      "Do not claim experience taught something without showing how it changed behavior.",
      "Do not turn the post into a vague annual reflection.",
    ],
  }),

  t({
    id: "lessons_learned_02",
    name: "Lessons From a Hard Season",
    archetype: "Lessons Learned",
    variant: "Reality-led difficult period",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Grow my audience", "Build authority", "Build network"],

    bestForPillars: ["Personal story", "Values / philosophy", "Mistakes and misconceptions"],

    template: `[hard season] taught me lessons I would not have chosen to learn that way.
  
  1. [lesson 1]
  
  [short explanation 1].
  
  2. [lesson 2]
  
  [short explanation 2].
  
  3. [lesson 3]
  
  [short explanation 3].
  
  The hardest part was [hardest part].
  
  The part I handled poorly was [mistake or limitation].
  
  The most useful lesson was [most useful lesson].
  
  It changed how I [changed behavior].
  
  I would not romanticize that period.
  
  Pain is not automatically meaningful.
  
  But once the experience happened, I wanted to learn from it honestly.
  
  [cta]`,

    variables: [
      "hard season",
      "lesson 1",
      "short explanation 1",
      "lesson 2",
      "short explanation 2",
      "lesson 3",
      "short explanation 3",
      "hardest part",
      "mistake or limitation",
      "most useful lesson",
      "changed behavior",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What difficult period, setback, transition, or challenge can you discuss honestly?",
        fills: ["hard season"],
      },
      {
        question: "What three distinct lessons came from it?",
        fills: ["lesson 1", "lesson 2", "lesson 3"],
      },
      {
        question: "What specific experience or consequence supports each lesson?",
        fills: ["short explanation 1", "short explanation 2", "short explanation 3"],
      },
      {
        question: "What was genuinely the hardest part?",
        fills: ["hardest part"],
      },
      {
        question: "What did you handle poorly, misunderstand, or fail to do well?",
        fills: ["mistake or limitation"],
      },
      {
        question: "Which lesson became most useful afterward?",
        fills: ["most useful lesson"],
      },
      {
        question: "What behavior or decision changed because of that lesson?",
        fills: ["changed behavior"],
      },
    ],

    ctaStyles: ["relatable", "shared_learning", "conversation", "belief_statement"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not make pain sound like a motivational prop.",
      "Do not imply that hardship was necessary or beneficial.",
      "Do not invent emotional struggle, failure, or recovery.",
      "Do not present private details about other people without permission.",
      "Do not use fake vulnerability to generate engagement.",
      "Do not make yourself the hero of every difficult event.",
      "Do not claim full growth or closure when the experience is still unresolved.",
      "Do not pressure readers to find meaning in their own hardship.",
    ],
  }),

  t({
    id: "lessons_learned_03",
    name: "Lessons From Working With X",
    archetype: "Lessons Learned",
    variant: "Pattern-led audience lessons",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],

    bestForPillars: ["Market / industry observation", "Problem education", "Audience belief shift"],

    template: `Working with [audience or group] has changed how I think about [topic].
  
  Four lessons stand out.
  
  1. [lesson 1]
  
  [short explanation 1].
  
  2. [lesson 2]
  
  [short explanation 2].
  
  3. [lesson 3]
  
  [short explanation 3].
  
  4. [lesson 4]
  
  [short explanation 4].
  
  The strongest repeated pattern is [pattern].
  
  The most common mistake is [mistake].
  
  That mistake usually happens because [reason mistake happens].
  
  The better response is [better response].
  
  The value of working closely with people is seeing where theory stops matching reality.
  
  [cta]`,

    variables: [
      "audience or group",
      "topic",
      "lesson 1",
      "short explanation 1",
      "lesson 2",
      "short explanation 2",
      "lesson 3",
      "short explanation 3",
      "lesson 4",
      "short explanation 4",
      "pattern",
      "mistake",
      "reason mistake happens",
      "better response",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What clients, customers, teams, candidates, students, or professional group have you worked with?",
        fills: ["audience or group"],
      },
      {
        question: "What topic or area did that experience teach you about?",
        fills: ["topic"],
      },
      {
        question: "What four distinct lessons emerged from that work?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4"],
      },
      {
        question: "What brief observation, example, or consequence supports each lesson?",
        fills: ["short explanation 1", "short explanation 2", "short explanation 3", "short explanation 4"],
      },
      {
        question: "What repeated pattern have you observed most consistently?",
        fills: ["pattern"],
      },
      {
        question: "What mistake appears most often?",
        fills: ["mistake"],
      },
      {
        question: "Why does that mistake seem reasonable or keep happening?",
        fills: ["reason mistake happens"],
      },
      {
        question: "What better response have you seen work more effectively?",
        fills: ["better response"],
      },
    ],

    ctaStyles: ["authority_reframe", "soft_lead", "conversation", "specific_peer_question"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not generalize from one client or one isolated interaction.",
      "Do not invent customer behavior, lessons, or patterns.",
      "Do not reveal confidential or identifying information.",
      "Do not portray the audience as naive, difficult, or incompetent.",
      "Do not present correlation as proven causation.",
      "Do not claim to speak for an entire group.",
      "Do not use the lessons only as a setup for a sales pitch.",
    ],
  }),

  t({
    id: "lessons_learned_04",
    name: "Lessons I Keep Relearning",
    archetype: "Lessons Learned",
    variant: "Trigger-led repeated reminder",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],

    bestForGoals: ["Grow my audience", "Build network"],

    bestForPillars: ["Personal story", "Values / philosophy", "Mistakes and misconceptions"],

    template: `I know this lesson.
  
  I still forget it under pressure:
  
  [lesson].
  
  It usually happens when:
  
  → [situation 1]
  
  → [situation 2]
  
  → [situation 3]
  
  In those moments, I fall back into [old behavior].
  
  The cost is usually [cost of forgetting].
  
  The reminder I need is:
  
  "[reminder]"
  
  So now I use [practical safeguard].
  
  It helps me notice the pattern before [negative consequence].
  
  Knowing a lesson once is easy.
  
  Building a system that helps you remember it is harder.
  
  [cta]`,

    variables: [
      "lesson",
      "situation 1",
      "situation 2",
      "situation 3",
      "old behavior",
      "cost of forgetting",
      "reminder",
      "practical safeguard",
      "negative consequence",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What lesson do you understand intellectually but still forget in practice?",
        fills: ["lesson"],
      },
      {
        question: "What three situations make you most likely to forget it?",
        fills: ["situation 1", "situation 2", "situation 3"],
      },
      {
        question: "What old behavior do you fall back into?",
        fills: ["old behavior"],
      },
      {
        question: "What specific cost follows when you forget the lesson?",
        fills: ["cost of forgetting"],
      },
      {
        question: "What short reminder helps you return to the lesson?",
        fills: ["reminder"],
      },
      {
        question: "What practical rule, checklist, habit, or safeguard helps you remember it sooner?",
        fills: ["practical safeguard"],
      },
      {
        question: "What negative consequence does that safeguard help prevent?",
        fills: ["negative consequence"],
      },
    ],

    ctaStyles: ["relatable", "conversation", "shared_learning", "belief_statement"],

    proofRequirement: "optional",

    antiPatterns: [
      "Do not invent a recurring struggle to appear relatable.",
      "Do not use a lesson that has no observable behavior attached to it.",
      "Do not frame ordinary inconsistency as a dramatic personal failure.",
      "Do not stop at a motivational reminder when a practical safeguard exists.",
      "Do not claim the safeguard eliminates the problem completely.",
      "Do not make all three situations versions of being busy.",
      "Do not use self-criticism as the main source of tension.",
    ],
  }),

  t({
    id: "lessons_learned_05",
    name: "Lessons From Doing the Work",
    archetype: "Lessons Learned",
    variant: "Execution-led practical lessons",

    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],

    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities"],

    bestForPillars: ["Process / how-I-work", "Career / credibility proof", "Mistakes and misconceptions"],

    template: `Doing [work] corrected four assumptions I had before I started.
  
  1. [lesson 1]
  
  [practical evidence 1].
  
  2. [lesson 2]
  
  [practical evidence 2].
  
  3. [lesson 3]
  
  [practical evidence 3].
  
  4. [lesson 4]
  
  [practical evidence 4].
  
  Before doing the work, I assumed [old assumption].
  
  Execution showed me [new realization].
  
  The biggest gap between theory and reality was [theory-reality gap].
  
  That changed how I [changed approach].
  
  Theory gave me a starting point.
  
  The work gave me feedback strong enough to improve it.
  
  [cta]`,

    variables: [
      "work",
      "lesson 1",
      "practical evidence 1",
      "lesson 2",
      "practical evidence 2",
      "lesson 3",
      "practical evidence 3",
      "lesson 4",
      "practical evidence 4",
      "old assumption",
      "new realization",
      "theory-reality gap",
      "changed approach",
      "cta",
    ],

    clarifyingQuestions: [
      {
        question: "What real project, product, campaign, role, experiment, or piece of work did you complete?",
        fills: ["work"],
      },
      {
        question: "What four distinct lessons came from actually doing it?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4"],
      },
      {
        question: "What practical evidence, result, mistake, or observation supports each lesson?",
        fills: ["practical evidence 1", "practical evidence 2", "practical evidence 3", "practical evidence 4"],
      },
      {
        question: "What did you assume before starting?",
        fills: ["old assumption"],
      },
      {
        question: "What did execution reveal instead?",
        fills: ["new realization"],
      },
      {
        question: "What was the biggest difference between the theory and the reality?",
        fills: ["theory-reality gap"],
      },
      {
        question: "What do you now do differently because of that experience?",
        fills: ["changed approach"],
      },
    ],

    ctaStyles: ["relatable", "career_signal", "conversation", "work_style"],

    proofRequirement: "recommended",

    antiPatterns: [
      "Do not claim that theory is useless.",
      "Do not invent work, lessons, evidence, or results.",
      "Do not use lessons that could have been written without doing the work.",
      "Do not confuse one experience with a universal rule.",
      "Do not list four lessons without showing the evidence behind them.",
      "Do not make execution sound valuable only because it was difficult.",
      "Do not claim a changed approach without explaining what changed.",
    ],
  }),
]

export function getTemplatesForGoal(goal: Goal): PostTemplate[] {
  return LINKEDIN_POST_TEMPLATES.filter((template) => template.bestForGoals.includes(goal))
}

export function getTemplatesForPillar(pillar: PillarCategory): PostTemplate[] {
  return LINKEDIN_POST_TEMPLATES.filter((template) => template.bestForPillars.includes(pillar))
}

export function getTemplatesForGoalAndPillar(goal: Goal, pillar: PillarCategory): PostTemplate[] {
  return LINKEDIN_POST_TEMPLATES.filter((template) => template.bestForGoals.includes(goal) && template.bestForPillars.includes(pillar))
}

export function getCTAOptionsForGoal(goal: Goal): CTAOption[] {
  return CTA_LIBRARY.filter((cta) => cta.goals.includes(goal))
}

export function getTemplateById(id: string): PostTemplate | undefined {
  return LINKEDIN_POST_TEMPLATES.find((template) => template.id === id)
}

export function getTemplatesRequiringProof(): PostTemplate[] {
  return LINKEDIN_POST_TEMPLATES.filter((template) => template.proofRequirement === "required")
}

export function getTemplatesByProofRequirement(proofRequirement: ProofRequirement): PostTemplate[] {
  return LINKEDIN_POST_TEMPLATES.filter((template) => template.proofRequirement === proofRequirement)
}

export function shouldIncludeCTA(template: PostTemplate): boolean {
  return template.ctaRequirement === "required" || template.ctaRequirement === "recommended"
}

export interface TemplateMatch {
  template: PostTemplate
  score: number
  reasons: string[]
}

export const isGoalEligibleForRole = (role: Role, goal: Goal): boolean => {
  return GOAL_ELIGIBILITY_BY_ROLE[role]?.includes(goal) ?? false
}

export const getRoleGoalFit = (template: PostTemplate, role: Role, goal: Goal): RoleGoalFit | undefined => {
  return template.roleGoalFit?.[role]?.[goal]
}

export const scoreTemplateForRoleGoal = (template: PostTemplate, role: Role, goal: Goal, pillar?: PillarCategory): TemplateMatch => {
  let score = 0
  const reasons: string[] = []

  if (template.bestForRoles.includes(role)) {
    score += 3
    reasons.push("role match")
  }

  if (template.bestForGoals.includes(goal)) {
    score += 4
    reasons.push("goal match")
  }

  if (pillar && template.bestForPillars.includes(pillar)) {
    score += 2
    reasons.push("pillar match")
  }

  const roleGoalFit = getRoleGoalFit(template, role, goal)

  if (roleGoalFit === "native") {
    score += 3
    reasons.push("native role-goal fit")
  }

  if (roleGoalFit === "usable") {
    score += 1
    reasons.push("usable role-goal fit")
  }

  if (roleGoalFit === "avoid") {
    score -= 10
    reasons.push("avoid role-goal fit")
  }

  return {
    template,
    score,
    reasons,
  }
}

export const getScoredTemplatesForRoleAndGoal = (role: Role, goal: Goal, pillar?: PillarCategory): TemplateMatch[] => {
  if (!isGoalEligibleForRole(role, goal)) {
    return []
  }

  return LINKEDIN_POST_TEMPLATES.map((template) => scoreTemplateForRoleGoal(template, role, goal, pillar))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
}

export const getTemplatesForRoleAndGoal = (role: Role, goal: Goal, pillar?: PillarCategory): PostTemplate[] => {
  return getScoredTemplatesForRoleAndGoal(role, goal, pillar).map((match) => match.template)
}

export const getCTAOptionsForGoalAndRole = (goal: Goal, role: Role): CTAOption[] => {
  return CTA_LIBRARY.filter((cta) => {
    const goalMatches = cta.goals.includes(goal)
    const roleMatches = !cta.roles || cta.roles.includes(role)

    return goalMatches && roleMatches
  })
}

export const getCTAOptionsByAction = (goal: Goal, role: Role, action: CTAAction): CTAOption[] => {
  return getCTAOptionsForGoalAndRole(goal, role).filter((cta) => cta.action === action)
}
