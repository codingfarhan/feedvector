import { Injectable } from "@nestjs/common"
import { OpenaiService } from "@gitroom/nestjs-libraries/openai/openai.service"
import {
  LINKEDIN_POST_TEMPLATES,
  type Goal,
  type PillarCategory,
  type PostTemplate,
  type Role,
  getCTAOptionsForGoalAndRole,
  getTemplateById,
} from "@gitroom/nestjs-libraries/onboarding/linkedin.post.templates"

const GOAL_PILLARS: Record<Goal, PillarCategory[]> = {
  "Get inbound leads": ["Problem education", "Objection handling", "Proof / case study", "Process / how-I-work"],
  "Build authority": ["Point of view", "Mistakes and misconceptions", "Market / industry observation", "Audience belief shift"],
  "Grow my audience": ["Personal story", "Community / network conversation", "Behind the scenes", "Values / philosophy"],
  "Promote my product/service": ["Product / service education", "Problem education", "Proof / case study", "Objection handling"],
  "Get job opportunities": ["Career / credibility proof", "Process / how-I-work", "Personal story", "Values / philosophy"],
  "Build network": ["Community / network conversation", "Market / industry observation", "Personal story", "Point of view"],
  "Recruit / hire talent": ["Hiring / culture", "Values / philosophy", "Behind the scenes", "Point of view"],
}

const ROLE_PILLAR_BOOSTS: Record<Role, PillarCategory[]> = {
  Founder: ["Point of view", "Behind the scenes", "Product / service education"],
  "Agency owner": ["Proof / case study", "Problem education", "Process / how-I-work"],
  Consultant: ["Problem education", "Audience belief shift", "Objection handling"],
  Freelancer: ["Process / how-I-work", "Proof / case study", "Personal story"],
  Coach: ["Audience belief shift", "Mistakes and misconceptions", "Personal story"],
  Creator: ["Personal story", "Values / philosophy", "Community / network conversation"],
  Marketer: ["Market / industry observation", "Point of view", "Problem education"],
  "Job seeker / career professional": ["Career / credibility proof", "Process / how-I-work", "Personal story"],
}

type OnboardingSuggestionInput = {
  role: string
  audience: string
  goal: string
  linkedinProfileContext: any
  websiteProfile?: any
}

type RepurposePostInput = {
  sourceType: "website" | "past_posts" | "profile"
  role: string
  audience: string
  goal: string
  allowedPillars: string[]
  additionalContext?: string
  visualContext?: string
  websiteProfile?: any
  websitePages?: any[]
  selectedPosts?: Array<{
    label: string
    date?: string
    total?: number
  }>
  linkedinProfileContext?: any
  profileFocus?: string
}

type WeeklyCampaignAnalyticsHints = {
  bestTopic?: string
  bestHook?: string
  bestFormat?: string
  bestCta?: string
  nextAction?: string
}

type WeeklyCampaignRecommendationInput = {
  role: string
  audience: string
  goal: string
  count: number
  linkedinProfileContext: any
  websiteProfile?: any
  pillar?: string
  usedTemplateIds?: string[]
  excludedTemplateIds?: string[]
  missingFields?: string[]
  avoidRequiredProof?: boolean
  analyticsHints?: WeeklyCampaignAnalyticsHints
}

type WeeklyCampaignAnswer = {
  question: string
  fills: string[]
  answer: string
}

type WeeklyCampaignGenerateInput = {
  role: string
  audience: string
  goal: string
  linkedinProfileContext: any
  websiteProfile?: any
  analyticsHints?: WeeklyCampaignAnalyticsHints
  templates: Array<{
    templateId: string
    pillar: string
    slot?: number
    date?: string
    analyticsRecommended?: boolean
    useContextFromProfileAndWebsite?: boolean
    answers: WeeklyCampaignAnswer[]
  }>
}

type LinkedinProfileOptimizationInput = {
  role: string
  audience: string
  goal: string
  linkedinProfileContext: any
}

@Injectable()
export class OnboardingPostSuggestionService {
  constructor(private _openaiService: OpenaiService) {}

  assignPillars(role: string, goal: string, hasProof: boolean) {
    const typedGoal = goal as Goal
    const typedRole = role as Role
    const goalPillars = GOAL_PILLARS[typedGoal] || GOAL_PILLARS["Build authority"]
    const roleBoosts = ROLE_PILLAR_BOOSTS[typedRole] || []
    const ordered = [...goalPillars, ...roleBoosts]
    const unique = ordered.filter((pillar, index) => ordered.indexOf(pillar) === index)
    const pillars = unique.slice(0, 4)

    if (!hasProof) {
      return pillars
        .map((pillar) => (pillar === "Proof / case study" ? "Process / how-I-work" : pillar))
        .filter((pillar, index, all) => all.indexOf(pillar) === index)
        .concat(["Problem education", "Point of view"])
        .filter((pillar, index, all) => all.indexOf(pillar) === index)
        .slice(0, 4)
    }

    return pillars
  }

  async generateSuggestions(input: OnboardingSuggestionInput) {
    const hasProof = this.hasProof(input.linkedinProfileContext, input.websiteProfile)
    const pillars = this.assignPillars(input.role, input.goal, hasProof)
    const templates = this.selectTemplates(input.role, input.goal, pillars, hasProof)
    const generated = await this._openaiService.generateOnboardingLinkedinPosts({
      role: input.role,
      audience: input.audience,
      goal: input.goal,
      campaignInstructions: [
        "These posts are part of one weekly LinkedIn campaign.",
        "Keep the posts strategically related, but make their structures visibly different.",
        "Do not reuse the same opening pattern across posts.",
        "Do not reuse the same list format across posts.",
        "Vary hook style, sentence rhythm, CTA style, and post shape across the set.",
      ],
      linkedinProfileContext: this.compactLinkedinContext(input.linkedinProfileContext),
      websiteProfile: input.websiteProfile,
      templates: templates.map(({ template, pillar }) => ({
        id: template.id,
        name: template.name,
        pillar,
        archetype: template.archetype,
        hookStyles: template.hookStyles,
        tensionPattern: template.tensionPattern,
        intents: template.intents,
        openingPattern: this.openingPattern(template),
        template: template.template,
        variables: template.variables,
        ctaOptions: getCTAOptionsForGoalAndRole(input.goal as Goal, input.role as Role)
          .filter((cta) => template.ctaStyles.includes(cta.id))
          .map((cta) => ({
            id: cta.id,
            action: cta.action,
            intensity: cta.intensity,
            text: cta.text,
          })),
        proofRequirement: template.proofRequirement,
        generationInstructions: template.generationInstructions,
        antiPatterns: template.antiPatterns,
      })),
    })

    return templates.map(({ template, pillar }, index) => {
      const post = generated.find((item) => item.templateId === template.id)
      const content = this.cleanGeneratedContent(post?.content || "")
      if (!content) {
        throw new Error("Could not generate onboarding post suggestions")
      }

      return {
        id: `${template.id}-${index}`,
        templateId: template.id,
        templateName: template.name,
        pillar,
        role: input.role,
        audience: input.audience,
        goal: input.goal,
        ctaStyle: this.ctaStyleForGoal(template, input.goal, input.role),
        proofRequirement: template.proofRequirement,
        content,
      }
    })
  }

  async generateRepurposedPost(input: RepurposePostInput) {
    const generated = await this._openaiService.generateRepurposedLinkedinPost({
      ...input,
      allowedPillars: input.allowedPillars.length ? input.allowedPillars : this.assignPillars(input.role, input.goal, true),
      linkedinProfileContext: input.linkedinProfileContext ? this.compactLinkedinContext(input.linkedinProfileContext) : undefined,
      websitePages: (input.websitePages || []).slice(0, 5),
    })
    const content = this.cleanGeneratedContent(generated.content || "")

    if (!content) {
      throw new Error("Could not generate a post from this source")
    }

    return {
      content,
      pillar: generated.pillar || input.allowedPillars[0] || "",
      angle: generated.angle || "",
    }
  }

  recommendWeeklyCampaignTemplates(input: WeeklyCampaignRecommendationInput) {
    const hasProof = !input.avoidRequiredProof && this.hasProof(input.linkedinProfileContext, input.websiteProfile)
    const count = Math.max(1, Math.min(input.count || 1, 20))
    const basePillars = input.pillar ? ([input.pillar] as PillarCategory[]) : this.assignPillars(input.role, input.goal, hasProof)
    const selected = this.selectTemplatesForCount(input.role, input.goal, basePillars, hasProof, count, {
      usedTemplateIds: input.usedTemplateIds || [],
      excludedTemplateIds: input.excludedTemplateIds || [],
      missingFields: input.missingFields || [],
      avoidRequiredProof: !!input.avoidRequiredProof,
    })
    const hasAnalyticsGuidance = this.hasAnalyticsGuidance(input.analyticsHints)

    return {
      posts: selected.map(({ template, pillar }, index) =>
        this.templatePlanItem(template, pillar, index + 1, {
          analyticsRecommended: hasAnalyticsGuidance && index === 0,
        }),
      ),
      availablePillars: this.assignPillars(input.role, input.goal, true),
      requiresPillarChange: selected.length === 0,
    }
  }

  async generateWeeklyCampaignPosts(input: WeeklyCampaignGenerateInput) {
    const templates = input.templates.map((item, index) => {
      const template = getTemplateById(item.templateId)
      if (!template) {
        throw new Error(`Template ${item.templateId} was not found`)
      }

      const answers = (item.answers || [])
        .map((answer) => ({
          question: answer.question,
          fills: answer.fills || [],
          answer: String(answer.answer || "").trim(),
        }))
        .filter((answer) => answer.answer)

      if (!answers.length && !item.useContextFromProfileAndWebsite) {
        throw new Error(`Please add the required details for ${template.name}`)
      }

      return {
        template,
        pillar: item.pillar as PillarCategory,
        slot: item.slot || index + 1,
        date: item.date,
        analyticsRecommended: !!item.analyticsRecommended,
        useContextFromProfileAndWebsite: !!item.useContextFromProfileAndWebsite,
        answers,
      }
    })

    const generated = await this._openaiService.generateOnboardingLinkedinPosts({
      role: input.role,
      audience: input.audience,
      goal: input.goal,
      campaignInstructions: [
        "These posts are part of one weekly LinkedIn campaign created from user-confirmed templates.",
        "Use the userAnswers for each template as the source of truth for specific details.",
        "Do not invent missing proof, metrics, clients, revenue, personal stories, or examples.",
        "Keep the posts strategically related, but make their structures visibly different.",
        "Do not reuse the same opening pattern across posts.",
      ],
      linkedinProfileContext: this.compactLinkedinContext(input.linkedinProfileContext),
      websiteProfile: input.websiteProfile,
      templates: templates.map(({ template, pillar, answers, analyticsRecommended, useContextFromProfileAndWebsite }) => ({
        id: template.id,
        name: template.name,
        pillar,
        archetype: template.archetype,
        hookStyles: template.hookStyles,
        tensionPattern: template.tensionPattern,
        intents: template.intents,
        openingPattern: this.openingPattern(template),
        template: template.template,
        variables: template.variables,
        userAnswers: answers,
        analyticsGuidance: analyticsRecommended ? input.analyticsHints || {} : undefined,
        ctaOptions: getCTAOptionsForGoalAndRole(input.goal as Goal, input.role as Role)
          .filter((cta) => template.ctaStyles.includes(cta.id))
          .map((cta) => ({
            id: cta.id,
            action: cta.action,
            intensity: cta.intensity,
            text: cta.text,
        })),
        proofRequirement: template.proofRequirement,
        generationInstructions: [
          ...(template.generationInstructions || []),
          ...(useContextFromProfileAndWebsite
            ? [
                "The user chose to use stored LinkedIn profile and website context for this post. Fill the template using only supplied linkedinProfileContext, websiteProfile, role, audience, goal, and analyticsGuidance. Do not invent missing proof, metrics, clients, revenue, personal stories, or examples.",
              ]
            : []),
        ],
        antiPatterns: template.antiPatterns,
      })),
    })

    return templates.map(({ template, pillar, slot, date, analyticsRecommended }) => {
      const post = generated.find((item) => item.templateId === template.id)
      const content = this.cleanGeneratedContent(post?.content || "")
      if (!content) {
        throw new Error(`Could not generate ${template.name}`)
      }

      return {
        id: `${template.id}-${slot}`,
        templateId: template.id,
        templateName: template.name,
        pillar,
        slot,
        date,
        role: input.role,
        audience: input.audience,
        goal: input.goal,
        ctaStyle: this.ctaStyleForGoal(template, input.goal, input.role),
        proofRequirement: template.proofRequirement,
        analyticsRecommended,
        content,
      }
    })
  }

  async optimizeLinkedinProfile(input: LinkedinProfileOptimizationInput) {
    if (input.linkedinProfileContext?.type === "company-page") {
      const currentDescription = String(input.linkedinProfileContext?.company?.description || input.linkedinProfileContext?.about || "").trim()
      const desiredPositioning = this.linkedinDesiredPositioning(input.role, input.audience, input.goal)
      const optimized = await this._openaiService.optimizeLinkedinCompanyDescription({
        role: input.role,
        audience: input.audience,
        goal: input.goal,
        desiredPositioning,
        currentDescription,
        companyData: this.compactLinkedinContext(input.linkedinProfileContext),
      })

      return {
        currentHeadline: "",
        currentAbout: currentDescription,
        suggestedHeadline: "",
        suggestedAbout: this.cleanProfileText(optimized.description),
        desiredPositioning,
        type: "company-page",
      }
    }

    const currentHeadline = String(input.linkedinProfileContext?.headline || "").trim()
    const currentAbout = String(input.linkedinProfileContext?.about || "").trim()
    const desiredPositioning = this.linkedinDesiredPositioning(input.role, input.audience, input.goal)
    const optimized = await this._openaiService.optimizeLinkedinProfile({
      role: input.role,
      audience: input.audience,
      goal: input.goal,
      desiredPositioning,
      currentHeadline,
      currentAbout,
      profileData: this.compactLinkedinContext(input.linkedinProfileContext),
    })

    return {
      currentHeadline,
      currentAbout,
      suggestedHeadline: this.cleanProfileText(optimized.headline),
      suggestedAbout: this.cleanProfileText(optimized.about),
      desiredPositioning,
    }
  }

  private selectTemplates(role: string, goal: string, pillars: PillarCategory[], hasProof: boolean) {
    const selected: Array<{ template: PostTemplate; pillar: PillarCategory }> = []
    const used = new Set<string>()

    for (const pillar of pillars) {
      const candidates = LINKEDIN_POST_TEMPLATES.filter((template) => {
        if (used.has(template.id)) {
          return false
        }

        if (!template.bestForGoals.includes(goal as Goal)) {
          return false
        }

        if (!template.bestForPillars.includes(pillar)) {
          return false
        }

        if (template.proofRequirement === "required" && !hasProof) {
          return false
        }

        return true
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(a, role, goal, hasProof, selected)
        const bScore = this.campaignTemplateScore(b, role, goal, hasProof, selected)
        return bScore - aScore || a.id.localeCompare(b.id)
      })

      const template = candidates[0]
      if (template) {
        selected.push({ template, pillar })
        used.add(template.id)
      }
    }

    if (selected.length < 4) {
      const fallback = LINKEDIN_POST_TEMPLATES.filter((template) => {
        return !used.has(template.id) && template.bestForGoals.includes(goal as Goal) && (hasProof || template.proofRequirement !== "required")
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(a, role, goal, hasProof, selected)
        const bScore = this.campaignTemplateScore(b, role, goal, hasProof, selected)
        return bScore - aScore || a.id.localeCompare(b.id)
      })

      for (const template of fallback) {
        const pillar = template.bestForPillars.find((item) => pillars.includes(item)) || template.bestForPillars[0]
        selected.push({ template, pillar })
        used.add(template.id)
        if (selected.length >= 4) {
          break
        }
      }
    }

    return selected.slice(0, 4)
  }

  private selectTemplatesForCount(
    role: string,
    goal: string,
    pillars: PillarCategory[],
    hasProof: boolean,
    count: number,
    options: {
      usedTemplateIds: string[]
      excludedTemplateIds: string[]
      missingFields: string[]
      avoidRequiredProof: boolean
    },
  ) {
    const selected: Array<{ template: PostTemplate; pillar: PillarCategory }> = []
    const used = new Set(options.usedTemplateIds)
    const excluded = new Set(options.excludedTemplateIds)
    const missingFields = new Set(options.missingFields.map((field) => field.toLowerCase()))

    for (let index = 0; index < count; index++) {
      const pillar = pillars[index % Math.max(pillars.length, 1)]
      const candidates = LINKEDIN_POST_TEMPLATES.filter((template) => {
        if (used.has(template.id) || excluded.has(template.id)) {
          return false
        }

        if (!template.bestForGoals.includes(goal as Goal)) {
          return false
        }

        if (pillar && !template.bestForPillars.includes(pillar)) {
          return false
        }

        if ((options.avoidRequiredProof || !hasProof) && template.proofRequirement === "required") {
          return false
        }

        if (this.templateUsesMissingFields(template, missingFields)) {
          return false
        }

        return true
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(a, role, goal, hasProof, selected)
        const bScore = this.campaignTemplateScore(b, role, goal, hasProof, selected)
        return bScore - aScore || a.id.localeCompare(b.id)
      })

      const template = candidates[0]
      if (template) {
        selected.push({ template, pillar })
        used.add(template.id)
        continue
      }

      const fallback = LINKEDIN_POST_TEMPLATES.filter((template) => {
        return (
          !used.has(template.id) &&
          !excluded.has(template.id) &&
          template.bestForGoals.includes(goal as Goal) &&
          (!options.avoidRequiredProof || template.proofRequirement !== "required") &&
          (hasProof || template.proofRequirement !== "required") &&
          !this.templateUsesMissingFields(template, missingFields)
        )
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(a, role, goal, hasProof, selected)
        const bScore = this.campaignTemplateScore(b, role, goal, hasProof, selected)
        return bScore - aScore || a.id.localeCompare(b.id)
      })[0]

      if (!fallback) {
        break
      }

      selected.push({
        template: fallback,
        pillar: fallback.bestForPillars[0],
      })
      used.add(fallback.id)
    }

    return selected
  }

  private templateScore(template: PostTemplate, role: string, goal: string, hasProof: boolean) {
    return (
      (template.bestForGoals.includes(goal as Goal) ? 8 : 0) +
      (template.bestForRoles.includes(role as Role) ? 5 : 0) +
      (template.proofRequirement === "none" ? 2 : 0) +
      (template.proofRequirement === "optional" ? 1 : 0) +
      (template.proofRequirement === "recommended" && hasProof ? 1 : 0)
    )
  }

  private campaignTemplateScore(
    template: PostTemplate,
    role: string,
    goal: string,
    hasProof: boolean,
    selected: Array<{ template: PostTemplate; pillar: PillarCategory }>,
  ) {
    return this.templateScore(template, role, goal, hasProof) + this.diversityBonus(template, selected) - this.diversityPenalty(template, selected)
  }

  private diversityBonus(template: PostTemplate, selected: Array<{ template: PostTemplate; pillar: PillarCategory }>) {
    if (selected.length === 0) {
      return 0
    }

    const usedIntents = new Set(selected.flatMap((item) => item.template.intents))
    const addsNewIntent = template.intents.some((intent) => !usedIntents.has(intent))

    return addsNewIntent ? 3 : 0
  }

  private diversityPenalty(template: PostTemplate, selected: Array<{ template: PostTemplate; pillar: PillarCategory }>) {
    if (selected.length === 0) {
      return 0
    }

    let penalty = 0
    const usedArchetypes = new Set(selected.map((item) => item.template.archetype))
    const usedPrimaryHookStyles = new Set(selected.map((item) => item.template.hookStyles[0]).filter(Boolean))
    const usedHookStyles = new Set(selected.flatMap((item) => item.template.hookStyles))
    const usedTensionPatterns = new Set(selected.map((item) => item.template.tensionPattern))
    const usedOpeningPatterns = new Set(selected.map((item) => this.openingPattern(item.template)))
    const usedListLikeCount = selected.filter((item) => this.isListLikeTemplate(item.template)).length

    if (usedArchetypes.has(template.archetype)) {
      penalty += 8
    }

    if (template.hookStyles[0] && usedPrimaryHookStyles.has(template.hookStyles[0])) {
      penalty += 6
    } else if (template.hookStyles.some((style) => usedHookStyles.has(style))) {
      penalty += 3
    }

    if (template.tensionPattern !== "none" && usedTensionPatterns.has(template.tensionPattern)) {
      penalty += 3
    }

    if (usedOpeningPatterns.has(this.openingPattern(template))) {
      penalty += 7
    }

    if (this.isListLikeTemplate(template) && usedListLikeCount >= 1) {
      penalty += 5
    }

    return penalty
  }

  private openingPattern(template: PostTemplate) {
    const firstLine = template.template
      .trim()
      .split("\n")
      .find((line) => line.trim())
      ?.trim()
      .toLowerCase()
      .replace(/[`"'“”]/g, "")

    if (!firstLine) {
      return "empty"
    }

    if (firstLine.startsWith("before ")) return "before"
    if (firstLine.startsWith("when ")) return "when"
    if (firstLine.startsWith("if ")) return "if"
    if (firstLine.startsWith("why ")) return "why"
    if (firstLine.startsWith("how ")) return "how"
    if (firstLine.includes("mistake")) return "mistake"
    if (firstLine.includes("myth")) return "myth"
    if (firstLine.includes("everyone")) return "everyone"
    if (firstLine.includes("most people")) return "most_people"

    return firstLine.split(/\s+/).slice(0, 3).join(" ")
  }

  private isListLikeTemplate(template: PostTemplate) {
    return template.hookStyles.includes("list_led") || /^\s*(?:1\.|- )/m.test(template.template)
  }

  private templateUsesMissingFields(template: PostTemplate, missingFields: Set<string>) {
    if (!missingFields.size) {
      return false
    }

    const fields = [...template.variables, ...template.clarifyingQuestions.flatMap((question) => question.fills)].map((field) => field.toLowerCase())

    return fields.some((field) => missingFields.has(field))
  }

  private hasProof(linkedinProfileContext: any, websiteProfile?: any) {
    return (linkedinProfileContext?.credibilityPoints || []).length > 0 || (websiteProfile?.proofPoints || []).length > 0
  }

  private ctaStyleForGoal(template: PostTemplate, goal: string, role: string) {
    const ctaOptions = getCTAOptionsForGoalAndRole(goal as Goal, role as Role)

    return template.ctaStyles.find((style) => ctaOptions.some((cta) => cta.id === style)) || template.ctaStyles[0]
  }

  private templatePlanItem(template: PostTemplate, pillar: PillarCategory, slot: number, options: { analyticsRecommended: boolean }) {
    const variables = template.variables.filter((variable) => !["cta", "optional cta"].includes(variable))
    const questions = template.clarifyingQuestions.length
      ? template.clarifyingQuestions
      : [
          {
            question: `What specific details should this ${template.name} post include?`,
            fills: variables,
          },
        ]

    return {
      id: `${template.id}-${slot}`,
      slot,
      templateId: template.id,
      templateName: template.name,
      pillar,
      archetype: template.archetype,
      hookStyles: template.hookStyles,
      proofRequirement: template.proofRequirement,
      variables,
      questions,
      analyticsRecommended: options.analyticsRecommended,
      why: options.analyticsRecommended
        ? "We will use your strongest detected patterns while keeping this template distinct."
        : `${template.name} fits ${pillar} and adds a different post structure to the week.`,
    }
  }

  private hasAnalyticsGuidance(analyticsHints?: WeeklyCampaignAnalyticsHints) {
    if (!analyticsHints) {
      return false
    }

    return Object.values(analyticsHints).some((value) => {
      if (!value) {
        return false
      }
      const text = String(value).toLowerCase()
      return !text.includes("not enough data") && !text.includes("upgrade")
    })
  }

  private compactLinkedinContext(context: any) {
    return {
      fullName: context?.fullName,
      headline: context?.headline,
      about: context?.about,
      location: context?.location,
      currentRole: context?.currentRole,
      skills: (context?.skills || []).slice(0, 20),
      experiences: (context?.experiences || []).slice(0, 8),
      educationHighlights: (context?.educationHighlights || []).slice(0, 6),
      professionalSummary: context?.professionalSummary,
      expertiseAreas: (context?.expertiseAreas || []).slice(0, 8),
      credibilityPoints: (context?.credibilityPoints || []).slice(0, 8),
      contentAngles: (context?.contentAngles || []).slice(0, 8),
      audienceSignals: (context?.audienceSignals || []).slice(0, 8),
    }
  }

  private linkedinDesiredPositioning(role: string, audience: string, goal: string) {
    const normalizedRole = String(role || "").trim()
    const normalizedAudience = String(audience || "").trim()
    const normalizedGoal = String(goal || "")
      .trim()
      .toLowerCase()

    if (normalizedGoal === "get inbound leads") {
      return `${normalizedRole} helping ${normalizedAudience} solve meaningful business problems with clear delivery credibility`
    }

    if (normalizedGoal === "get job opportunities") {
      return `${normalizedRole} with clear proof of impact, strong role fit, and a credible next-step story`
    }

    if (normalizedGoal === "build authority") {
      return `${normalizedRole} known for informed, experience-backed views that matter to ${normalizedAudience}`
    }

    if (normalizedGoal === "build network") {
      return `${normalizedRole} worth connecting with for people in ${normalizedAudience}`
    }

    if (normalizedGoal === "recruit / hire talent") {
      return `${normalizedRole} with a clear mission, standards, and an honest view of the people they want to attract`
    }

    return `${normalizedRole} helping ${normalizedAudience} make better decisions and get stronger outcomes`
  }

  private cleanProfileText(content: string) {
    return String(content || "")
      .trim()
      .replace(/[ \t]{2,}/g, " ")
  }

  private cleanGeneratedContent(content: string) {
    const cleaned = content
      .trim()
      .replace(/\s*\u2014\s*/g, ", ")
      .replace(/\.{2,}/g, ".")
      .replace(/[ \t]{2,}/g, " ")
    if (!cleaned || /\[[^\]]+\]/.test(cleaned)) {
      return ""
    }

    return cleaned
  }
}
