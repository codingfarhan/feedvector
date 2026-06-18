import { HttpException, Injectable } from "@nestjs/common"
import { createHash } from "crypto"
import OpenAI from "openai"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"
import { ioRedis } from "@gitroom/nestjs-libraries/redis/redis.service"
import { Goal, PillarCategory } from "@gitroom/nestjs-libraries/onboarding/linkedin.post.templates"
import { OnboardingPostSuggestionService } from "@gitroom/nestjs-libraries/onboarding/onboarding.post-suggestion.service"

type QueryCategory =
  | "audience_problem"
  | "audience_outcome"
  | "buyer_intent"
  | "expertise_topic"
  | "industry_trend"
  | "peer_conversation"
  | "misconception"
  | "process"
  | "case_study"
  | "personal_story"
  | "behind_the_scenes"
  | "product_education"
  | "objection"
  | "belief_shift"
  | "values"
  | "hiring"
  | "career_proof"

type SearchQuery = {
  category: QueryCategory
  query: string
  topic: string
  audienceTerm?: string
  intentPhrase?: string
  level: 1 | 2 | 3 | 4
  variant: "narrow" | "medium" | "broad"
  dateRange: "d"
}

type LlmGeneratedQuery = {
  category: QueryCategory
  topic: string
  audienceTerm?: string | null
  intentPhrase?: string | null
  query: string
}

type SerpOrganicResult = {
  title?: string
  link?: string
  snippet?: string
  source?: string
  displayed_link?: string
  date?: string
  position?: number
}

type RecommendationReason = {
  matchedGoal: Goal
  matchedTopics: string[]
  matchedAudienceTerms: string[]
  matchedProblems: string[]
  matchedProducts: string[]
  matchedIndustries: string[]
  queryCategory: QueryCategory
  suggestedCommentAngle?: PillarCategory
  explanation: string
}

type RecommendationResult = {
  url: string
  embedUrl: string
  embedUrn: string
  activityId: string
  authorSlug?: string
  title: string
  snippet: string
  source?: string
  displayedLink?: string
  date?: string
  position?: number
  score: number
  query: string
  reason: RecommendationReason
}

type PublicRecommendationResult = Omit<RecommendationResult, "reason">

type CommentOpportunityInput = {
  role: string
  audience: string
  goal: string
  pillars?: string[]
  linkedinProfileSlug?: string | null
  linkedinProfileContext?: any
  websiteProfile?: any
  limit?: number
  refresh?: boolean
}

type SearchExecutionResult = {
  baseQuery: SearchQuery
  executedQueries: SearchQuery[]
  results: SerpOrganicResult[]
}

const QUERY_STRATEGY_VERSION = "llm-v2"
const CACHE_TTL_SECONDS = 60 * 60 * 24
const DEFAULT_TOTAL_QUERIES = 12
const MAX_RESULTS = 20
const MIN_VALID_SERP_RESULTS = 3
const SERP_CONCURRENCY = 4

const ALL_QUERY_CATEGORIES: QueryCategory[] = [
  "audience_problem",
  "audience_outcome",
  "buyer_intent",
  "expertise_topic",
  "industry_trend",
  "peer_conversation",
  "misconception",
  "process",
  "case_study",
  "personal_story",
  "behind_the_scenes",
  "product_education",
  "objection",
  "belief_shift",
  "values",
  "hiring",
  "career_proof",
]

const GOAL_QUERY_PRIORITIES: Record<Goal, QueryCategory[]> = {
  "Get inbound leads": ["audience_problem", "buyer_intent", "objection", "audience_outcome", "product_education"],
  "Build authority": ["expertise_topic", "industry_trend", "misconception", "case_study", "belief_shift"],
  "Grow my audience": ["expertise_topic", "industry_trend", "peer_conversation", "personal_story", "belief_shift"],
  "Promote my product/service": ["product_education", "audience_problem", "buyer_intent", "objection", "case_study"],
  "Get job opportunities": ["career_proof", "process", "industry_trend", "expertise_topic", "peer_conversation"],
  "Build network": ["peer_conversation", "industry_trend", "values", "personal_story", "expertise_topic"],
  "Recruit / hire talent": ["hiring", "values", "behind_the_scenes", "career_proof", "peer_conversation"],
}

const LinkedinCommentOpportunityQueriesPrompt = z.object({
  queries: z.array(
    z.object({
      category: z.enum([
        "audience_problem",
        "audience_outcome",
        "buyer_intent",
        "expertise_topic",
        "industry_trend",
        "peer_conversation",
        "misconception",
        "process",
        "case_study",
        "personal_story",
        "behind_the_scenes",
        "product_education",
        "objection",
        "belief_shift",
        "values",
        "hiring",
        "career_proof",
      ]),
      topic: z.string(),
      audienceTerm: z.string().nullable(),
      intentPhrase: z.string().nullable(),
      query: z.string(),
    }),
  ),
})

const COMMENT_ANGLE_SIGNALS: Array<{
  pillar: PillarCategory
  patterns: RegExp[]
}> = [
  {
    pillar: "Problem education",
    patterns: [/\bproblem\b/i, /\bchallenge\b/i, /\bstruggling\b/i, /\bbottleneck\b/i, /\bfriction\b/i, /\broot cause\b/i],
  },
  {
    pillar: "Mistakes and misconceptions",
    patterns: [/\bmistake\b/i, /\bmyth\b/i, /\bmisconception\b/i, /\bwrong about\b/i, /\bbad advice\b/i],
  },
  {
    pillar: "Process / how-I-work",
    patterns: [/\bworkflow\b/i, /\bprocess\b/i, /\bstep by step\b/i, /\bhow we\b/i, /\bhow i\b/i, /\bsystem\b/i],
  },
  {
    pillar: "Proof / case study",
    patterns: [/\bcase study\b/i, /\bresults?\b/i, /\boutcome\b/i, /\bbefore and after\b/i, /\bwhat worked\b/i],
  },
  {
    pillar: "Market / industry observation",
    patterns: [/\btrend\b/i, /\bindustry\b/i, /\bmarket\b/i, /\bshift\b/i, /\bfuture of\b/i],
  },
  {
    pillar: "Point of view",
    patterns: [/\bmy take\b/i, /\bopinion\b/i, /\bagree or disagree\b/i, /\bunpopular opinion\b/i, /\bperspective\b/i],
  },
  {
    pillar: "Product / service education",
    patterns: [/\buse case\b/i, /\bhow it works\b/i, /\bwhen to use\b/i, /\btool\b/i, /\bsolution\b/i],
  },
  {
    pillar: "Objection handling",
    patterns: [/\btoo expensive\b/i, /\bworth it\b/i, /\bbuild vs buy\b/i, /\bnot ready\b/i, /\balternative\b/i],
  },
  {
    pillar: "Community / network conversation",
    patterns: [/\bwhat do you think\b/i, /\bcurious how\b/i, /\bhow are others\b/i, /\bwho has seen\b/i, /\bdiscussion\b/i],
  },
  {
    pillar: "Hiring / culture",
    patterns: [/\bhiring\b/i, /\bcandidate\b/i, /\binterview\b/i, /\bteam culture\b/i, /\bwho thrives\b/i],
  },
]

@Injectable()
export class LinkedinCommentOpportunityService {
  constructor(private _onboardingPostSuggestionService: OnboardingPostSuggestionService) {}

  async getRecommendations(input: CommentOpportunityInput) {
    if (!process.env.SERPER_API_KEY && !process.env.SERPAPI_API_KEY) {
      throw new HttpException("SERP search API is not configured", 500)
    }

    const goal = this.normalizeGoal(input.goal)
    const limit = Math.min(Math.max(input.limit || MAX_RESULTS, 1), 12)

    const pillars = this.resolvePillars(input.pillars, input.role, goal, input.linkedinProfileContext, input.websiteProfile)

    const cacheKey = this.cacheKey({
      strategyVersion: QUERY_STRATEGY_VERSION,
      goal,
      role: input.role,
      audience: input.audience,
      pillars,
      linkedinProfileSlug: input.linkedinProfileSlug,
      linkedinProfileContext: input.linkedinProfileContext,
      websiteProfile: input.websiteProfile,
      limit,
    })

    if (!input.refresh) {
      const cached = await ioRedis.get(cacheKey)

      if (cached) {
        try {
          return this.toPublicResponse(JSON.parse(cached))
        } catch {
          // Ignore invalid cached JSON and regenerate.
        }
      }
    }

    const queries = await this.generateQueriesWithLlm({
      role: input.role,
      goal,
      audience: input.audience,
      linkedinProfileContext: input.linkedinProfileContext,
      websiteProfile: input.websiteProfile,
      totalQueries: DEFAULT_TOTAL_QUERIES,
    })

    const executions = await this.mapWithConcurrency(queries, SERP_CONCURRENCY, async (query) => {
      try {
        return await this.fetchSerpResultsWithFallbacks(query)
      } catch (error) {
        console.error("LinkedIn SERP search failed", {
          query: query.query,
          error: error instanceof Error ? error.message : String(error),
        })

        return undefined
      }
    })

    const completedExecutions = executions.filter((execution): execution is SearchExecutionResult => !!execution)

    if (!completedExecutions.length) {
      throw new HttpException("All LinkedIn post searches failed", 502)
    }

    const deduped = new Map<string, RecommendationResult>()

    for (const execution of completedExecutions) {
      for (const organicResult of execution.results) {
        const recommendation = this.toRecommendationCandidate(organicResult, execution.baseQuery, goal, pillars, input.linkedinProfileSlug)

        if (!recommendation) {
          continue
        }

        const normalizedUrl = this.normalizeLinkedinPostUrl(recommendation.url)

        if (!normalizedUrl) {
          continue
        }

        const existing = deduped.get(normalizedUrl)

        if (!existing || recommendation.score > existing.score) {
          deduped.set(normalizedUrl, recommendation)
        }
      }
    }

    const recommendations = this.selectDiverseRecommendations(
      Array.from(deduped.values()).sort((a, b) => b.score - a.score),
      limit,
    )

    const response = {
      generatedAt: new Date().toISOString(),
      goal,
      pillars,
      queries,
      recommendations: this.toPublicRecommendations(recommendations),
    }

    await ioRedis.set(cacheKey, JSON.stringify(response), "EX", CACHE_TTL_SECONDS)

    return response
  }

  private toPublicResponse(response: any) {
    return {
      ...response,
      recommendations: this.toPublicRecommendations(Array.isArray(response?.recommendations) ? response.recommendations : []),
    }
  }

  private toPublicRecommendations(recommendations: RecommendationResult[]): PublicRecommendationResult[] {
    return recommendations.map(({ reason, ...recommendation }) => recommendation)
  }

  private resolvePillars(pillars: string[] | undefined, role: string, goal: Goal, linkedinProfileContext?: any, websiteProfile?: any) {
    const validPillars = (pillars || []).filter(
      (pillar): pillar is PillarCategory =>
        COMMENT_ANGLE_SIGNALS.some((config) => config.pillar === pillar) ||
        ["Personal story", "Behind the scenes", "Audience belief shift", "Values / philosophy", "Career / credibility proof"].includes(pillar),
    )

    if (validPillars.length) {
      return validPillars
    }

    const hasProof = !!linkedinProfileContext?.credibilityPoints?.length || !!websiteProfile?.proofPoints?.length

    return this._onboardingPostSuggestionService.assignPillars(role, goal, hasProof) as PillarCategory[]
  }

  private normalizeGoal(goal: string): Goal {
    if (Object.prototype.hasOwnProperty.call(GOAL_QUERY_PRIORITIES, goal)) {
      return goal as Goal
    }

    throw new HttpException("Unsupported onboarding goal", 400)
  }

  private async generateQueriesWithLlm(input: {
    role: string
    goal: Goal
    audience: string
    linkedinProfileContext?: any
    websiteProfile?: any
    totalQueries: number
  }): Promise<SearchQuery[]> {
    const apiKey = process.env.OPENAI_API_KEY

    const apiUrl = "https://api.openai.com/v1/chat/completions"

    const model = "gpt-5.2"

    if (!apiKey || !model) {
      throw new HttpException("LLM query generation is not configured", 500)
    }

    const allowedCategories = GOAL_QUERY_PRIORITIES[input.goal]
    const baseURL = apiUrl.replace(/\/chat\/completions\/?$/, "")
    const client = new OpenAI({
      apiKey,
      baseURL,
    })

    let parsed: {
      queries?: Array<Partial<LlmGeneratedQuery>>
    } | null

    try {
      parsed = (
        await client.chat.completions.parse({
          model,
          temperature: 0.3,
          response_format: zodResponseFormat(LinkedinCommentOpportunityQueriesPrompt, "linkedinCommentOpportunityQueries"),
          messages: [
            {
              role: "system",
              content: this.buildQueryGenerationSystemPrompt(input.goal, allowedCategories),
            },
            {
              role: "user",
              content: JSON.stringify({
                currentRole: input.role,
                goal: input.goal,
                targetAudience: input.audience,
                linkedinProfile: input.linkedinProfileContext || null,
                websiteProfile: input.websiteProfile || null,
                requestedQueryCount: input.totalQueries,
              }),
            },
          ],
        })
      ).choices[0].message.parsed
    } catch (error) {
      throw new HttpException(`LLM query generation failed: ${error instanceof Error ? error.message : String(error)}`, 502)
    }

    if (!parsed) {
      throw new HttpException("LLM returned no query-generation output", 502)
    }

    const generatedQueries = Array.isArray(parsed.queries) ? parsed.queries : []

    const validated = generatedQueries
      .map((query) => this.validateLlmGeneratedQuery(query, allowedCategories))
      .filter((query): query is SearchQuery => !!query)

    const unique = this.uniqueBy(validated, (query) => query.query.toLowerCase())

    if (unique.length < 5) {
      throw new HttpException("LLM did not generate enough valid search queries", 502)
    }

    return unique.slice(0, input.totalQueries)
  }

  private buildQueryGenerationSystemPrompt(goal: Goal, allowedCategories: QueryCategory[]) {
    return `
You generate Google queries that find LinkedIn posts a user can comment on.

Return valid JSON only.

Required output:

{
  "queries": [
    {
      "category": "audience_problem",
      "topic": "social media automation",
      "audienceTerm": "marketer",
      "intentPhrase": null,
      "query": "site:linkedin.com/posts/ \\"social media automation\\" marketer"
    }
  ]
}

The user's goal is:

${goal}

Only use these categories:

${allowedCategories.join(", ")}

Generate exactly the requested number of queries.

Use the user's role, target audience, LinkedIn profile, expertise, experience, product, website, customer problems, outcomes, industry, and technologies.

Do not use the user's content pillars.

Important rules:

- Generate queries for posts the user can credibly comment on.
- Generate queries that support the user's stated goal.
- Match each topic to the target audience.
- Use natural language people actually write on LinkedIn.
- Prefer concrete problems, workflows, decisions, tools, outcomes, and industry conversations.
- Do not copy broad database labels directly.
- Convert broad labels into natural search phrases.
- Never insert the full target-audience description into a query.
- Convert audience descriptions into short terms such as founder, marketer, engineering team, recruiter, agency, creator, or SaaS company.
- Use one main topic per query.
- Use zero or one short audience term.
- Use an intent phrase only when it sounds natural.
- Do not force intent phrases into every query.
- Use no more than two quoted phrases.
- Avoid exact phrases longer than five words.
- Keep each query broad enough to return posts from the last day.
- Generate at least four distinct topic clusters.
- Do not repeat one topic across most queries.
- Do not add qdr:d to the query.
- Every query must begin with site:linkedin.com/posts/
- Do not generate searches for LinkedIn profiles, jobs, events, or company pages.
- Do not include explanations outside the JSON.

The topic field is used to create broader fallback queries.

The topic field must:

- Be the short primary search phrase.
- Contain two to five words.
- Match the first quoted phrase in the query exactly.
- Not contain framing such as "challenges with", "looking for", "improving", "debating", "learning to", or "thoughts about".

Good:

{
  "topic": "social media automation",
  "query": "site:linkedin.com/posts/ \\"social media automation\\" marketer"
}

Bad:

{
  "topic": "looking for social media automation tools",
  "query": "site:linkedin.com/posts/ \\"social media automation\\" marketer"
}

Goal guidance:

Get inbound leads:
Prioritize target-audience problems, buying decisions, objections, product categories, workflows, and desired outcomes.

Build authority:
Prioritize technical topics, industry debates, misconceptions, trends, frameworks, and professional problems.

Grow my audience:
Prioritize broad relevant conversations, questions, trends, strong opinions, and topics where the user can add expertise.

Promote my product/service:
Prioritize product-category problems, use cases, alternatives, objections, customer outcomes, and buying triggers.

Get job opportunities:
Prioritize relevant technologies, projects, technical challenges, target industries, engineering leadership, and career conversations.

Build network:
Prioritize peers, adjacent experts, collaborators, shared industries, communities, and discussion-oriented posts.

Recruit / hire talent:
Prioritize role expectations, candidate problems, hiring practices, team culture, leadership, and professional communities.
`
  }

  private validateLlmGeneratedQuery(value: Partial<LlmGeneratedQuery>, allowedCategories: QueryCategory[]): SearchQuery | undefined {
    if (!value || typeof value !== "object") {
      return undefined
    }

    const category = value.category

    if (!category || !ALL_QUERY_CATEGORIES.includes(category) || !allowedCategories.includes(category)) {
      return undefined
    }

    let query = String(value.query || "")
      .replace(/\s+/g, " ")
      .trim()

    if (!query) {
      return undefined
    }

    if (!query.startsWith("site:linkedin.com/posts/")) {
      query = `site:linkedin.com/posts/ ${query}`
    }

    if (query.includes("qdr:") || query.length > 220) {
      return undefined
    }

    const queryBody = query.replace("site:linkedin.com/posts/", "").trim()

    if (this.wordCount(queryBody) > 12) {
      return undefined
    }

    const primaryQuotedPhrase = this.extractPrimaryQuotedPhrase(query)

    const topic = this.normalizeSearchPhrase(primaryQuotedPhrase || value.topic)

    if (!topic || this.wordCount(topic) < 2 || this.wordCount(topic) > 5) {
      return undefined
    }

    const audienceTerm = this.normalizeSearchPhrase(value.audienceTerm || "")

    const intentPhrase = this.normalizeSearchPhrase(value.intentPhrase || "")

    const variant: SearchQuery["variant"] = intentPhrase && audienceTerm ? "narrow" : audienceTerm ? "medium" : "broad"

    return {
      category,
      query,
      topic,
      audienceTerm: audienceTerm || undefined,
      intentPhrase: intentPhrase || undefined,
      level: 1,
      variant,
      dateRange: "d",
    }
  }

  private async fetchSerpResultsWithFallbacks(baseQuery: SearchQuery): Promise<SearchExecutionResult> {
    const fallbackQueries = this.buildFallbackQueries(baseQuery)

    const mergedResults: SerpOrganicResult[] = []
    const executedQueries: SearchQuery[] = []

    for (const query of fallbackQueries) {
      executedQueries.push(query)

      const results = await this.fetchSerpResults(query)

      const usableResults = results.filter((item) => this.isUsableSerpResult(item))

      mergedResults.push(...usableResults)

      const dedupedResults = this.uniqueBy(mergedResults, (item) => this.normalizeLinkedinPostUrl(item.link)).filter((item) => !!item.link)

      if (dedupedResults.length >= MIN_VALID_SERP_RESULTS) {
        return {
          baseQuery,
          executedQueries,
          results: dedupedResults,
        }
      }
    }

    return {
      baseQuery,
      executedQueries,
      results: this.uniqueBy(mergedResults, (item) => this.normalizeLinkedinPostUrl(item.link)).filter((item) => !!item.link),
    }
  }

  private async fetchSerpResults(query: SearchQuery): Promise<SerpOrganicResult[]> {
    const apiKey = process.env.SERPER_API_KEY || process.env.SERPAPI_API_KEY

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query.query,
        tbs: `qdr:${query.dateRange}`,
        gl: "us",
        hl: "en",
        num: 10,
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")

      throw new Error(`SERP API request failed: ${response.status}${errorText ? ` - ${errorText}` : ""}`)
    }

    const json = await response.json()

    const results = json?.organic || json?.organic_results || []

    return Array.isArray(results) ? (results as SerpOrganicResult[]) : []
  }

  private toRecommendationCandidate(
    result: SerpOrganicResult,
    query: SearchQuery,
    goal: Goal,
    pillars: PillarCategory[],
    linkedinProfileSlug?: string | null,
  ): RecommendationResult | undefined {
    const url = String(result.link || "").trim()
    const title = String(result.title || "").trim()
    const snippet = String(result.snippet || "").trim()

    if (!url || !title) {
      return undefined
    }

    const parsedUrl = this.safeUrl(url)

    if (!parsedUrl) {
      return undefined
    }

    const hostname = parsedUrl.hostname.toLowerCase()

    const isLinkedinHostname = hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")

    if (!isLinkedinHostname) {
      return undefined
    }

    const isPostUrl = parsedUrl.pathname.includes("/posts/") || parsedUrl.pathname.includes("/feed/update/")

    if (!isPostUrl) {
      return undefined
    }

    if (linkedinProfileSlug && parsedUrl.pathname.toLowerCase().includes(`/${linkedinProfileSlug.toLowerCase()}`)) {
      return undefined
    }

    const embedUrn = this.extractLinkedinEmbedUrn(url)

    if (!embedUrn) {
      return undefined
    }

    const normalizedText = `${title} ${snippet}`.toLowerCase()

    const noisePenalty = this.calculateNoisePenalty(normalizedText)

    if (noisePenalty >= 0.35) {
      return undefined
    }

    const position = typeof result.position === "number" ? result.position : 10

    const score = Math.max(0, 1 - Math.max(0, position - 1) * 0.03 - noisePenalty)

    const activityId = embedUrn.split(":").pop() || ""

    const suggestedCommentAngle = this.suggestCommentAngle(normalizedText, pillars, query.category)

    return {
      url: this.normalizeLinkedinPostUrl(url) || url,
      embedUrl: `https://www.linkedin.com/embed/feed/update/${embedUrn}`,
      embedUrn,
      activityId,
      authorSlug: this.extractAuthorSlug(parsedUrl.pathname),
      title,
      snippet,
      source: result.source,
      displayedLink: result.displayed_link,
      date: result.date,
      position: result.position,
      score,
      query: query.query,
      reason: {
        matchedGoal: goal,
        matchedTopics: [query.topic],
        matchedAudienceTerms: query.audienceTerm ? [query.audienceTerm] : [],
        matchedProblems: [],
        matchedProducts: [],
        matchedIndustries: [],
        queryCategory: query.category,
        suggestedCommentAngle,
        explanation: `This post was found through the ${query.category} topic "${query.topic}" for your ${goal} goal.`,
      },
    }
  }

  private selectDiverseRecommendations(results: RecommendationResult[], limit: number) {
    const selected: RecommendationResult[] = []
    const authorSlugs = new Set<string>()
    const categoryCounts = new Map<QueryCategory, number>()
    const topicCounts = new Map<string, number>()
    const angleCounts = new Map<string, number>()

    for (const result of results) {
      const authorSlug = result.authorSlug || ""

      const category = result.reason.queryCategory

      const topic = result.reason.matchedTopics[0] || "unknown"

      const angle = result.reason.suggestedCommentAngle || "none"

      if (authorSlug && authorSlugs.has(authorSlug)) {
        continue
      }

      if ((categoryCounts.get(category) || 0) >= 2) {
        continue
      }

      if ((topicCounts.get(topic) || 0) >= 2) {
        continue
      }

      if (angle !== "none" && (angleCounts.get(angle) || 0) >= 2) {
        continue
      }

      selected.push(result)

      if (authorSlug) {
        authorSlugs.add(authorSlug)
      }

      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)

      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)

      if (angle !== "none") {
        angleCounts.set(angle, (angleCounts.get(angle) || 0) + 1)
      }

      if (selected.length >= limit) {
        break
      }
    }

    if (selected.length < limit) {
      for (const result of results) {
        if (selected.some((item) => item.url === result.url)) {
          continue
        }

        selected.push(result)

        if (selected.length >= limit) {
          break
        }
      }
    }

    return selected.slice(0, limit)
  }

  private suggestCommentAngle(text: string, pillars: PillarCategory[], category: QueryCategory): PillarCategory | undefined {
    const allowedPillars = new Set(pillars)

    for (const config of COMMENT_ANGLE_SIGNALS) {
      if (!allowedPillars.has(config.pillar)) {
        continue
      }

      if (config.patterns.some((pattern) => pattern.test(text))) {
        return config.pillar
      }
    }

    const categoryDefaults: Partial<Record<QueryCategory, PillarCategory>> = {
      audience_problem: "Problem education",
      audience_outcome: "Audience belief shift",
      buyer_intent: "Product / service education",
      expertise_topic: "Point of view",
      industry_trend: "Market / industry observation",
      peer_conversation: "Community / network conversation",
      misconception: "Mistakes and misconceptions",
      process: "Process / how-I-work",
      case_study: "Proof / case study",
      personal_story: "Personal story",
      behind_the_scenes: "Behind the scenes",
      product_education: "Product / service education",
      objection: "Objection handling",
      belief_shift: "Audience belief shift",
      values: "Values / philosophy",
      hiring: "Hiring / culture",
      career_proof: "Career / credibility proof",
    }

    const fallback = categoryDefaults[category]

    if (fallback && allowedPillars.has(fallback)) {
      return fallback
    }

    return pillars[0]
  }

  private buildFallbackQueries(query: SearchQuery) {
    const topicQuoted = this.quote(query.topic)

    const audience = query.audienceTerm || ""

    const broadTopic = query.topic

    return this.uniqueBy(
      [
        {
          ...query,
          level: 1 as const,
          query: query.query,
        },
        {
          ...query,
          level: 2 as const,
          variant: audience ? ("medium" as const) : ("broad" as const),
          query: ["site:linkedin.com/posts/", topicQuoted, audience].filter(Boolean).join(" ").trim(),
        },
        {
          ...query,
          level: 3 as const,
          variant: "broad" as const,
          audienceTerm: undefined,
          intentPhrase: undefined,
          query: ["site:linkedin.com/posts/", topicQuoted].join(" ").trim(),
        },
        {
          ...query,
          level: 4 as const,
          variant: "broad" as const,
          audienceTerm: undefined,
          intentPhrase: undefined,
          query: ["site:linkedin.com/posts/", broadTopic].join(" ").trim(),
        },
      ],
      (item) => item.query.toLowerCase(),
    )
  }

  private isUsableSerpResult(result: SerpOrganicResult) {
    const url = String(result.link || "").trim()

    const title = String(result.title || "").trim()

    if (!url || !title) {
      return false
    }

    if (!this.looksLikeLinkedinPostUrl(url)) {
      return false
    }

    if (!this.extractLinkedinEmbedUrn(url)) {
      return false
    }

    return true
  }

  private calculateNoisePenalty(text: string) {
    const strongNoisePatterns = [
      /\bjob description\b/i,
      /\bapply now\b/i,
      /\bjob opening\b/i,
      /\bvacancy\b/i,
      /\bhiring immediately\b/i,
      /\breport this comment\b/i,
      /\bclose menu\b/i,
      /\bsee more comments\b/i,
      /\bevent registration\b/i,
      /\bregister now\b/i,
      /\blimited seats\b/i,
    ]

    const mediumNoisePatterns = [/\bsalary\b/i, /\bsponsored\b/i, /\badvertisement\b/i, /\bwebinar\b/i, /\btickets?\b/i, /\btraining course\b/i]

    const strongMatches = strongNoisePatterns.filter((pattern) => pattern.test(text)).length

    if (strongMatches > 0) {
      return 0.35
    }

    const mediumMatches = mediumNoisePatterns.filter((pattern) => pattern.test(text)).length

    return Math.min(0.3, mediumMatches * 0.12)
  }

  private extractLinkedinEmbedUrn(url: string) {
    const decoded = decodeURIComponent(url)

    const urnMatch = decoded.match(/urn:li:(activity|share|ugcPost):(\d+)/i)

    if (urnMatch) {
      return `urn:li:${urnMatch[1]}:${urnMatch[2]}`
    }

    const activityMatch = decoded.match(/activity-(\d+)/i)

    if (activityMatch) {
      return `urn:li:activity:${activityMatch[1]}`
    }

    return undefined
  }

  private extractAuthorSlug(pathname: string) {
    const match = pathname.match(/\/posts\/([^/_?]+)_/i)

    return match?.[1]?.toLowerCase()
  }

  private normalizeLinkedinPostUrl(value?: string) {
    try {
      const url = new URL(String(value || ""))

      const hostname = url.hostname.toLowerCase()

      const isLinkedin = hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")

      if (!isLinkedin) {
        return ""
      }

      if (!url.pathname.includes("/posts/") && !url.pathname.includes("/feed/update/")) {
        return ""
      }

      url.search = ""
      url.hash = ""

      return `${url.origin}${url.pathname}`.replace(/\/$/, "").toLowerCase()
    } catch {
      return ""
    }
  }

  private looksLikeLinkedinPostUrl(value?: string) {
    const normalized = this.normalizeLinkedinPostUrl(value)

    return !!normalized
  }

  private extractPrimaryQuotedPhrase(query: string) {
    const match = query.match(/"([^"]+)"/)

    return match?.[1]?.trim()
  }

  private normalizeSearchPhrase(value: string) {
    return String(value || "")
      .replace(/[()[\]{}]/g, " ")
      .replace(/[|]/g, " ")
      .replace(/[^\w\s+.#/&'-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }

  private safeUrl(value: string) {
    try {
      return new URL(value)
    } catch {
      return undefined
    }
  }

  private wordCount(value: string) {
    return value.split(/\s+/).filter(Boolean).length
  }

  private quote(value?: string) {
    const cleaned = String(value || "")
      .replace(/"/g, "")
      .trim()

    return cleaned ? `"${cleaned}"` : ""
  }

  private uniqueBy<T>(values: T[], keyFn: (value: T) => string) {
    const seen = new Set<string>()

    return values.filter((value) => {
      const key = keyFn(value)

      if (!key || seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
  }

  private async mapWithConcurrency<T, R>(values: T[], concurrency: number, mapper: (value: T, index: number) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(values.length)

    let nextIndex = 0

    const workers = Array.from(
      {
        length: Math.min(concurrency, values.length),
      },
      async () => {
        while (true) {
          const currentIndex = nextIndex
          nextIndex += 1

          if (currentIndex >= values.length) {
            return
          }

          results[currentIndex] = await mapper(values[currentIndex], currentIndex)
        }
      },
    )

    await Promise.all(workers)

    return results
  }

  private cacheKey(input: {
    strategyVersion: string
    goal: Goal
    role: string
    audience: string
    pillars: PillarCategory[]
    linkedinProfileSlug?: string | null
    linkedinProfileContext?: any
    websiteProfile?: any
    limit: number
  }) {
    const hash = createHash("sha1").update(JSON.stringify(input)).digest("hex")

    return `linkedin-comment-opportunities:${hash}`
  }
}
