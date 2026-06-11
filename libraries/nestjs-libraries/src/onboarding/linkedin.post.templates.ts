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
  archetype: string
  variant: string
  bestForRoles: Role[]
  bestForGoals: Goal[]
  roleGoalFit?: Partial<Record<Role, Partial<Record<Goal, RoleGoalFit>>>>
  bestForPillars: PillarCategory[]
  template: string
  variables: string[]
  clarifyingQuestions: ClarifyingQuestion[]
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
]

const t = (template: PostTemplate): PostTemplate => ({
  ...template,
  antiPatterns: [...DEFAULT_ANTI_PATTERNS, ...template.antiPatterns],
})

export const LINKEDIN_POST_TEMPLATES: PostTemplate[] = [
  t({
    id: "pain_diagnosis_01",
    name: "Surface Problem vs Root Problem",
    archetype: "Pain Diagnosis",
    variant: "X is not the real problem",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],
    bestForPillars: ["Problem education", "Audience belief shift", "Mistakes and misconceptions"],
    template: `Most [audience] think they have a [surface problem] problem.

Usually, they don’t.

They have a [deeper problem] problem.

You can see it when:

1. [symptom 1]
2. [symptom 2]
3. [symptom 3]

So they try to fix it by [common wrong fix].

But that only fixes [surface symptom].

It doesn’t fix [root cause].

The better question is:

“Where is [deeper problem] showing up before [surface problem] becomes obvious?”

[cta]`,
    variables: [
      "audience",
      "surface problem",
      "deeper problem",
      "symptom 1",
      "symptom 2",
      "symptom 3",
      "common wrong fix",
      "surface symptom",
      "root cause",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What problem does your audience think they have, and what is usually causing it underneath?",
        fills: ["surface problem", "deeper problem", "root cause"],
      },
      {
        question: "What are 2–3 signs this problem is showing up?",
        fills: ["symptom 1", "symptom 2", "symptom 3"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead", "problem_solution"],
    proofRequirement: "optional",
    antiPatterns: ["Do not turn this into a long educational essay."],
  }),

  t({
    id: "pain_diagnosis_02",
    name: "Symptoms of a Deeper Issue",
    archetype: "Pain Diagnosis",
    variant: "Symptoms before diagnosis",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Audience belief shift"],
    template: `If you’re seeing:

1. [symptom 1]
2. [symptom 2]
3. [symptom 3]
4. [symptom 4]

The problem may not be [surface diagnosis].

It may be [deeper diagnosis].

That matters because [surface diagnosis] makes you fix [wrong area].

But [deeper diagnosis] makes you fix [right area].

Before you try [next tactic], ask:

“Is this a [surface diagnosis] issue, or a [deeper diagnosis] issue?”

[cta]`,
    variables: [
      "symptom 1",
      "symptom 2",
      "symptom 3",
      "symptom 4",
      "surface diagnosis",
      "deeper diagnosis",
      "wrong area",
      "right area",
      "next tactic",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What symptoms would your audience recognize immediately?",
        fills: ["symptom 1", "symptom 2", "symptom 3", "symptom 4"],
      },
      {
        question: "What do people usually misdiagnose this as?",
        fills: ["surface diagnosis", "deeper diagnosis"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "pain_diagnosis_03",
    name: "The Expensive Wrong Fix",
    archetype: "Pain Diagnosis",
    variant: "Wrong fix",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Problem education", "Objection handling", "Product / service education"],
    template: `A lot of [audience] try to fix [problem] by doing [wrong fix].

It makes sense.

[wrong fix] feels like the obvious move.

But if the real issue is [root cause], then [wrong fix] only creates:

1. [bad outcome 1]
2. [bad outcome 2]
3. [bad outcome 3]

The better first move is [better first move].

Not because it’s more impressive.

Because it gets closer to the source.

Don’t spend more on [wrong fix] before checking [root cause].

[cta]`,
    variables: ["audience", "problem", "wrong fix", "root cause", "bad outcome 1", "bad outcome 2", "bad outcome 3", "better first move", "cta"],
    clarifyingQuestions: [
      {
        question: "What wrong fix does your audience often try first?",
        fills: ["wrong fix"],
      },
      {
        question: "What should they check before spending time or money on that?",
        fills: ["root cause", "better first move"],
      },
    ],
    ctaStyles: ["problem_solution", "soft_lead", "offer_bridge"],
    proofRequirement: "optional",
    antiPatterns: ["Do not shame the audience for making the mistake."],
  }),

  t({
    id: "pain_diagnosis_04",
    name: "Nobody Checks This First",
    archetype: "Pain Diagnosis",
    variant: "Ignored diagnostic",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Process / how-I-work"],
    template: `Before you try to fix [problem], check [ignored check].

Most people skip this.

They jump straight to:

1. [premature action 1]
2. [premature action 2]
3. [premature action 3]

But if [ignored check] is broken, those actions won’t solve much.

They’ll only make the system noisier.

The question I’d ask first:

“Is [ignored check] strong enough to support [desired outcome]?”

Start there.

[cta]`,
    variables: ["problem", "ignored check", "premature action 1", "premature action 2", "premature action 3", "desired outcome", "cta"],
    clarifyingQuestions: [
      {
        question: "What important check does your audience usually skip?",
        fills: ["ignored check"],
      },
      {
        question: "What actions do they jump into too early?",
        fills: ["premature action 1", "premature action 2", "premature action 3"],
      },
    ],
    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "pain_diagnosis_05",
    name: "Problem Beneath the Problem",
    archetype: "Pain Diagnosis",
    variant: "Layered diagnosis",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Audience belief shift"],
    template: `[surface problem] is usually not where the problem starts.

It’s where the problem becomes visible.

The real issue often starts with [hidden issue].

That shows up as:

1. [early sign 1]
2. [early sign 2]
3. [early sign 3]

By the time you notice [surface problem], the issue has already been alive for a while.

So the goal is not to react faster to [surface problem].

The goal is to notice [hidden issue] earlier.

That changes the whole conversation.

[cta]`,
    variables: ["surface problem", "hidden issue", "early sign 1", "early sign 2", "early sign 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What surface problem does your audience notice too late?",
        fills: ["surface problem"],
      },
      {
        question: "What hidden issue usually comes before it?",
        fills: ["hidden issue", "early sign 1", "early sign 2", "early sign 3"],
      },
    ],
    ctaStyles: ["diagnostic", "authority_reframe", "soft_lead"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "checklist_01",
    name: "Before You Do X",
    archetype: "Checklist",
    variant: "Pre-action checklist",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority", "Grow my audience"],
    bestForPillars: ["Problem education", "Process / how-I-work"],
    template: `Before you [do action], check these first:

1. [check 1]
2. [check 2]
3. [check 3]
4. [check 4]
5. [check 5]

Most people skip [important check].

That’s why they end up with [bad outcome].

A better question is:

“Have we solved [core issue] before trying to [next action]?”

[cta]`,
    variables: [
      "do action",
      "check 1",
      "check 2",
      "check 3",
      "check 4",
      "check 5",
      "important check",
      "bad outcome",
      "core issue",
      "next action",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What action does your audience usually rush into?",
        fills: ["do action", "next action"],
      },
      {
        question: "What should they check before doing that?",
        fills: ["check 1", "check 2", "check 3", "check 4", "check 5", "important check"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead", "conversation"],
    proofRequirement: "none",
    antiPatterns: ["Do not explain every checklist item unless necessary."],
  }),

  t({
    id: "checklist_02",
    name: "Signs You Need to Fix X",
    archetype: "Checklist",
    variant: "Warning signs",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Get inbound leads", "Grow my audience", "Build authority"],
    bestForPillars: ["Problem education", "Audience belief shift"],
    template: `You probably need to fix [problem area] if:

1. [sign 1]
2. [sign 2]
3. [sign 3]
4. [sign 4]
5. [sign 5]

The biggest warning sign is [biggest sign].

Because it usually means [deeper meaning].

Don’t wait until [late consequence].

Fix [problem area] while the signals are still small.

[cta]`,
    variables: ["problem area", "sign 1", "sign 2", "sign 3", "sign 4", "sign 5", "biggest sign", "deeper meaning", "late consequence", "cta"],
    clarifyingQuestions: [
      {
        question: "What are the signs that your audience has this problem?",
        fills: ["sign 1", "sign 2", "sign 3", "sign 4", "sign 5"],
      },
      {
        question: "Which sign is the most important warning sign?",
        fills: ["biggest sign", "deeper meaning"],
      },
    ],
    ctaStyles: ["diagnostic", "conversation", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "checklist_03",
    name: "Decision Questions",
    archetype: "Checklist",
    variant: "Questions before decision",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Build network"],
    bestForPillars: ["Problem education", "Process / how-I-work"],
    template: `Before deciding on [decision], ask these questions:

1. [question 1]
2. [question 2]
3. [question 3]
4. [question 4]
5. [question 5]

Most people only ask [shallow question].

That’s why they choose based on [weak basis].

The better decision usually comes from [strong basis].

Don’t ask:

“[shallow question]”

Ask:

“[better question]”

[cta]`,
    variables: [
      "decision",
      "question 1",
      "question 2",
      "question 3",
      "question 4",
      "question 5",
      "shallow question",
      "weak basis",
      "strong basis",
      "better question",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What decision does your audience struggle with?",
        fills: ["decision"],
      },
      {
        question: "What questions would help them make a better decision?",
        fills: ["question 1", "question 2", "question 3", "question 4", "question 5", "better question"],
      },
    ],
    ctaStyles: ["diagnostic", "peer_question", "authority_reframe"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "checklist_04",
    name: "What Good Looks Like",
    archetype: "Checklist",
    variant: "Quality standards",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get job opportunities", "Promote my product/service"],
    bestForPillars: ["Process / how-I-work", "Problem education", "Career / credibility proof"],
    template: `Everyone says they want better [topic].

But “better” is too vague.

Better [topic] usually means:

1. [standard 1]
2. [standard 2]
3. [standard 3]
4. [standard 4]
5. [standard 5]

If you don’t define the standard, you end up chasing [wrong metric].

The real question is:

“What would good actually look like here?”

Start there.

[cta]`,
    variables: ["topic", "standard 1", "standard 2", "standard 3", "standard 4", "standard 5", "wrong metric", "cta"],
    clarifyingQuestions: [
      {
        question: "What does your audience vaguely want to improve?",
        fills: ["topic"],
      },
      {
        question: "What does ‘good’ actually look like in that area?",
        fills: ["standard 1", "standard 2", "standard 3", "standard 4", "standard 5"],
      },
    ],
    ctaStyles: ["belief_statement", "work_style", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "checklist_05",
    name: "Quick Audit",
    archetype: "Checklist",
    variant: "Self-audit",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority", "Grow my audience"],
    bestForPillars: ["Problem education", "Process / how-I-work"],
    template: `Quick audit for [topic]:

1. Is [audit question 1]?
2. Is [audit question 2]?
3. Is [audit question 3]?
4. Is [audit question 4]?
5. Is [audit question 5]?

If the answer is “no” to [important question], that’s where I’d start.

Because without [foundation], [desired outcome] gets much harder.

Don’t fix everything.

Fix the constraint.

[cta]`,
    variables: [
      "topic",
      "audit question 1",
      "audit question 2",
      "audit question 3",
      "audit question 4",
      "audit question 5",
      "important question",
      "foundation",
      "desired outcome",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What should your audience audit?",
        fills: ["topic"],
      },
      {
        question: "What are the 5 checks in that audit?",
        fills: ["audit question 1", "audit question 2", "audit question 3", "audit question 4", "audit question 5"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead", "conversation"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "contrarian_take_01",
    name: "Most People Have This Backwards",
    archetype: "Contrarian Take",
    variant: "Backwards belief",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ["Point of view", "Audience belief shift"],
    template: `Most people think [common belief].

I don’t.

I think [opposite belief].

Because when you believe [common belief], you tend to:

1. [bad behavior 1]
2. [bad behavior 2]
3. [bad behavior 3]

But when you believe [opposite belief], you start to:

1. [better behavior 1]
2. [better behavior 2]
3. [better behavior 3]

That’s the shift.

Not [old frame].

[new frame].

[cta]`,
    variables: [
      "common belief",
      "opposite belief",
      "bad behavior 1",
      "bad behavior 2",
      "bad behavior 3",
      "better behavior 1",
      "better behavior 2",
      "better behavior 3",
      "old frame",
      "new frame",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What common belief in your space do you disagree with?",
        fills: ["common belief", "old frame"],
      },
      {
        question: "What do you believe instead?",
        fills: ["opposite belief", "new frame"],
      },
    ],
    ctaStyles: ["authority_reframe", "industry_prompt", "agree_disagree"],
    proofRequirement: "recommended",
    antiPatterns: ["Do not make the take extreme just for attention."],
  }),

  t({
    id: "contrarian_take_02",
    name: "The Uncomfortable Truth",
    archetype: "Contrarian Take",
    variant: "Uncomfortable truth",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Point of view", "Mistakes and misconceptions"],
    template: `Uncomfortable truth about [topic]:

[uncomfortable truth]

Most people avoid saying this because [reason people avoid it].

But avoiding it creates:

1. [bad outcome 1]
2. [bad outcome 2]
3. [bad outcome 3]

The kinder thing is to be honest:

[honest reframe]

That doesn’t mean [misinterpretation].

It means [clarification].

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
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What uncomfortable truth does your audience need to hear?",
        fills: ["uncomfortable truth"],
      },
      {
        question: "What might people misunderstand about this take?",
        fills: ["misinterpretation", "clarification"],
      },
    ],
    ctaStyles: ["authority_reframe", "agree_disagree", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: ["Do not insult the audience."],
  }),

  t({
    id: "contrarian_take_03",
    name: "Stop Optimizing the Wrong Thing",
    archetype: "Contrarian Take",
    variant: "Wrong focus",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],
    bestForPillars: ["Point of view", "Problem education", "Audience belief shift"],
    template: `Too many [audience] optimize for [wrong thing].

It feels useful because [why it feels useful].

But it often leads to:

1. [bad outcome 1]
2. [bad outcome 2]
3. [bad outcome 3]

The better thing to optimize for is [right thing].

Because [right thing] leads to:

1. [better outcome 1]
2. [better outcome 2]
3. [better outcome 3]

The goal is not more [wrong thing].

The goal is better [right thing].

[cta]`,
    variables: [
      "audience",
      "wrong thing",
      "why it feels useful",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "right thing",
      "better outcome 1",
      "better outcome 2",
      "better outcome 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What does your audience over-optimize for?",
        fills: ["wrong thing"],
      },
      {
        question: "What should they optimize for instead?",
        fills: ["right thing", "better outcome 1", "better outcome 2", "better outcome 3"],
      },
    ],
    ctaStyles: ["diagnostic", "authority_reframe", "conversation"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "contrarian_take_04",
    name: "Everyone Says X, I See Y",
    archetype: "Contrarian Take",
    variant: "Public narrative vs reality",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ["Point of view", "Market / industry observation"],
    template: `Everyone keeps saying [popular narrative].

But I keep seeing [observed reality].

You can see it in:

1. [signal 1]
2. [signal 2]
3. [signal 3]

The public conversation is about [surface conversation].

The real issue is [real issue].

That matters because [practical consequence].

So instead of asking [old question], I’d ask:

“[better question]”

[cta]`,
    variables: [
      "popular narrative",
      "observed reality",
      "signal 1",
      "signal 2",
      "signal 3",
      "surface conversation",
      "real issue",
      "practical consequence",
      "old question",
      "better question",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What does everyone in your space keep saying?",
        fills: ["popular narrative", "surface conversation"],
      },
      {
        question: "What are you seeing instead?",
        fills: ["observed reality", "real issue", "signal 1", "signal 2", "signal 3"],
      },
    ],
    ctaStyles: ["industry_prompt", "peer_question", "authority_reframe"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "contrarian_take_05",
    name: "Advice I No Longer Give",
    archetype: "Contrarian Take",
    variant: "Outgrown advice",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ["Point of view", "Personal story", "Mistakes and misconceptions"],
    template: `Advice I no longer give:

“[old advice]”

I used to believe it because [why it seemed right].

But over time, I saw it create:

1. [problem 1]
2. [problem 2]
3. [problem 3]

Now I’d say:

“[new advice]”

Because [reason].

Sometimes better advice is not louder.

It’s more specific.

[cta]`,
    variables: ["old advice", "why it seemed right", "problem 1", "problem 2", "problem 3", "new advice", "reason", "cta"],
    clarifyingQuestions: [
      {
        question: "What advice did you used to give or believe?",
        fills: ["old advice", "why it seemed right"],
      },
      {
        question: "What would you say now instead?",
        fills: ["new advice", "reason"],
      },
    ],
    ctaStyles: ["authority_reframe", "relatable", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "mini_case_study_01",
    name: "Hidden Bottleneck",
    archetype: "Mini Case Study",
    variant: "Root cause case",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority", "Promote my product/service"],
    bestForPillars: ["Proof / case study", "Problem education", "Process / how-I-work"],
    template: `A [client/customer/project/team] came in with [surface problem].

At first, it looked like [obvious diagnosis].

But after looking closer, the real issue was [root cause].

So instead of [wrong fix], we focused on [actual fix].

That changed:

1. [change 1]
2. [change 2]
3. [change 3]

The lesson:

Don’t solve [surface problem] before you understand [root cause].

[cta]`,
    variables: [
      "client/customer/project/team",
      "surface problem",
      "obvious diagnosis",
      "root cause",
      "wrong fix",
      "actual fix",
      "change 1",
      "change 2",
      "change 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Can you describe one client, customer, project, or team situation anonymously?",
        fills: ["client/customer/project/team", "surface problem", "obvious diagnosis"],
      },
      {
        question: "What turned out to be the real issue?",
        fills: ["root cause", "actual fix", "change 1", "change 2", "change 3"],
      },
    ],
    ctaStyles: ["soft_lead", "diagnostic", "problem_solution"],
    proofRequirement: "required",
    antiPatterns: ["Do not invent a case if no case exists."],
  }),

  t({
    id: "mini_case_study_02",
    name: "Small Change, Big Difference",
    archetype: "Mini Case Study",
    variant: "Small intervention",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service", "Build authority"],
    bestForPillars: ["Proof / case study", "Process / how-I-work"],
    template: `One small change made [outcome] much easier.

Before:

1. [before 1]
2. [before 2]
3. [before 3]

The change:

[small change]

After:

1. [after 1]
2. [after 2]
3. [after 3]

The important part wasn’t that the change was big.

It was that it fixed [specific constraint].

Small changes work when they touch the right constraint.

[cta]`,
    variables: ["outcome", "before 1", "before 2", "before 3", "small change", "after 1", "after 2", "after 3", "specific constraint", "cta"],
    clarifyingQuestions: [
      {
        question: "What small change made a meaningful difference?",
        fills: ["small change", "specific constraint"],
      },
      {
        question: "What was different before and after?",
        fills: ["before 1", "before 2", "before 3", "after 1", "after 2", "after 3"],
      },
    ],
    ctaStyles: ["soft_lead", "offer_bridge", "belief_statement"],
    proofRequirement: "required",
    antiPatterns: ["Do not exaggerate the outcome."],
  }),

  t({
    id: "mini_case_study_03",
    name: "First Attempt Failed",
    archetype: "Mini Case Study",
    variant: "Failed first attempt",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads"],
    bestForPillars: ["Proof / case study", "Mistakes and misconceptions"],
    template: `The first thing we tried didn’t work.

We tried [first attempt] because [why it made sense].

But it created:

1. [problem 1]
2. [problem 2]
3. [problem 3]

That’s when we realized [insight].

So we changed the approach to [new approach].

The result was [result or lesson].

The lesson:

A failed first attempt is useful if it shows you what the real problem is.

[cta]`,
    variables: ["first attempt", "why it made sense", "problem 1", "problem 2", "problem 3", "insight", "new approach", "result or lesson", "cta"],
    clarifyingQuestions: [
      {
        question: "What did you try first that didn’t work?",
        fills: ["first attempt", "why it made sense"],
      },
      {
        question: "What did that failed attempt reveal?",
        fills: ["insight", "new approach", "result or lesson"],
      },
    ],
    ctaStyles: ["relatable", "diagnostic", "authority_reframe"],
    proofRequirement: "required",
    antiPatterns: ["Do not make failure sound like fake humility."],
  }),

  t({
    id: "mini_case_study_04",
    name: "Pattern Behind the Result",
    archetype: "Mini Case Study",
    variant: "Outcome breakdown",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Promote my product/service", "Get job opportunities"],
    bestForPillars: ["Proof / case study", "Career / credibility proof"],
    template: `[result] did not happen because of one big move.

It happened because of a few repeated actions:

1. [action 1]
2. [action 2]
3. [action 3]
4. [action 4]

The visible result was [visible result].

The invisible work was [invisible work].

That’s the part people usually miss.

Outcomes are easier to understand when you look at the pattern behind them.

[cta]`,
    variables: ["result", "action 1", "action 2", "action 3", "action 4", "visible result", "invisible work", "cta"],
    clarifyingQuestions: [
      {
        question: "What result or project outcome can you honestly mention?",
        fills: ["result", "visible result"],
      },
      {
        question: "What repeated actions created that result?",
        fills: ["action 1", "action 2", "action 3", "action 4", "invisible work"],
      },
    ],
    ctaStyles: ["belief_statement", "career_signal", "offer_bridge"],
    proofRequirement: "required",
    antiPatterns: ["Do not invent metrics."],
  }),

  t({
    id: "mini_case_study_05",
    name: "Came for X, Needed Y",
    archetype: "Mini Case Study",
    variant: "Reframed request",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service", "Build authority"],
    bestForPillars: ["Proof / case study", "Problem education", "Audience belief shift"],
    template: `A [client/customer/team/person] asked for [initial request].

That made sense from the outside.

They were trying to solve [surface goal].

But the real need was [actual need].

So instead of giving them [requested thing], we worked on [better thing].

That helped them see:

1. [realization 1]
2. [realization 2]
3. [realization 3]

Sometimes the first request is not the real problem.

It’s just the language people use before the diagnosis is clear.

[cta]`,
    variables: [
      "client/customer/team/person",
      "initial request",
      "surface goal",
      "actual need",
      "requested thing",
      "better thing",
      "realization 1",
      "realization 2",
      "realization 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What do clients or your audience often ask for first?",
        fills: ["initial request", "requested thing", "surface goal"],
      },
      {
        question: "What do they actually need?",
        fills: ["actual need", "better thing", "realization 1", "realization 2", "realization 3"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead", "problem_solution"],
    proofRequirement: "required",
    antiPatterns: [],
  }),

  t({
    id: "before_after_01",
    name: "Before and After Shift",
    archetype: "Before / After",
    variant: "Clear transformation",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service", "Get job opportunities"],
    bestForPillars: ["Proof / case study", "Career / credibility proof"],
    template: `Before [change]:

1. [before state 1]
2. [before state 2]
3. [before state 3]

After [change]:

1. [after state 1]
2. [after state 2]
3. [after state 3]

The biggest difference wasn’t [obvious change].

It was [deeper change].

That’s what made the result stick.

[cta]`,
    variables: [
      "change",
      "before state 1",
      "before state 2",
      "before state 3",
      "after state 1",
      "after state 2",
      "after state 3",
      "obvious change",
      "deeper change",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What changed, and what was the situation like before?",
        fills: ["change", "before state 1", "before state 2", "before state 3"],
      },
      {
        question: "What looked different afterward?",
        fills: ["after state 1", "after state 2", "after state 3", "deeper change"],
      },
    ],
    ctaStyles: ["soft_lead", "offer_bridge", "career_signal"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "before_after_02",
    name: "Messy to Clear",
    archetype: "Before / After",
    variant: "Clarity transformation",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority", "Get job opportunities"],
    bestForPillars: ["Process / how-I-work", "Proof / case study"],
    template: `At first, [situation] was messy.

There was:

1. [messy part 1]
2. [messy part 2]
3. [messy part 3]

The turning point was [clarifying move].

Once that was clear, we could see:

1. [clear insight 1]
2. [clear insight 2]
3. [clear insight 3]

Clarity did not solve everything.

But it made the next decision obvious.

That’s usually where progress starts.

[cta]`,
    variables: [
      "situation",
      "messy part 1",
      "messy part 2",
      "messy part 3",
      "clarifying move",
      "clear insight 1",
      "clear insight 2",
      "clear insight 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Where was there confusion or messiness?",
        fills: ["situation", "messy part 1", "messy part 2", "messy part 3"],
      },
      {
        question: "What created clarity?",
        fills: ["clarifying move", "clear insight 1", "clear insight 2", "clear insight 3"],
      },
    ],
    ctaStyles: ["diagnostic", "belief_statement", "work_style"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "before_after_03",
    name: "Reactive to Intentional",
    archetype: "Before / After",
    variant: "Operating system shift",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads"],
    bestForPillars: ["Process / how-I-work", "Problem education"],
    template: `Before, [audience/team/person] was reacting to [trigger].

That looked like:

1. [reactive behavior 1]
2. [reactive behavior 2]
3. [reactive behavior 3]

The shift was [new system or mindset].

After that, they started:

1. [intentional behavior 1]
2. [intentional behavior 2]
3. [intentional behavior 3]

Same problem space.

Different operating system.

That’s the difference between reacting to [trigger] and managing [deeper system].

[cta]`,
    variables: [
      "audience/team/person",
      "trigger",
      "reactive behavior 1",
      "reactive behavior 2",
      "reactive behavior 3",
      "new system or mindset",
      "intentional behavior 1",
      "intentional behavior 2",
      "intentional behavior 3",
      "deeper system",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Where was the person or team reacting too much?",
        fills: ["trigger", "reactive behavior 1", "reactive behavior 2", "reactive behavior 3"],
      },
      {
        question: "What system or mindset made the work more intentional?",
        fills: ["new system or mindset", "intentional behavior 1", "intentional behavior 2", "intentional behavior 3"],
      },
    ],
    ctaStyles: ["authority_reframe", "soft_lead", "diagnostic"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "before_after_04",
    name: "Invisible Before and After",
    archetype: "Before / After",
    variant: "Internal transformation",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Build authority", "Grow my audience", "Get job opportunities"],
    bestForPillars: ["Personal story", "Proof / case study", "Career / credibility proof"],
    template: `The visible change was [visible change].

But the real change was quieter.

Before:

1. [internal before 1]
2. [internal before 2]
3. [internal before 3]

After:

1. [internal after 1]
2. [internal after 2]
3. [internal after 3]

Most people noticed [visible change].

But [internal change] is what made it possible.

The outside result was just the evidence.

[cta]`,
    variables: [
      "visible change",
      "internal before 1",
      "internal before 2",
      "internal before 3",
      "internal after 1",
      "internal after 2",
      "internal after 3",
      "internal change",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What external change did people notice?",
        fills: ["visible change"],
      },
      {
        question: "What internal shift made it possible?",
        fills: [
          "internal before 1",
          "internal before 2",
          "internal before 3",
          "internal after 1",
          "internal after 2",
          "internal after 3",
          "internal change",
        ],
      },
    ],
    ctaStyles: ["relatable", "belief_statement", "career_signal"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "before_after_05",
    name: "What Changed When We Stopped",
    archetype: "Before / After",
    variant: "Removal-based progress",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],
    bestForPillars: ["Mistakes and misconceptions", "Process / how-I-work", "Audience belief shift"],
    template: `Things got better when we stopped [old behavior].

Before, [old behavior] created:

1. [bad outcome 1]
2. [bad outcome 2]
3. [bad outcome 3]

So we stopped [old behavior] and started [new behavior].

That created:

1. [better outcome 1]
2. [better outcome 2]
3. [better outcome 3]

Sometimes progress is not adding more.

Sometimes it is removing the thing that keeps creating noise.

[cta]`,
    variables: [
      "old behavior",
      "bad outcome 1",
      "bad outcome 2",
      "bad outcome 3",
      "new behavior",
      "better outcome 1",
      "better outcome 2",
      "better outcome 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What did you or the client stop doing?",
        fills: ["old behavior"],
      },
      {
        question: "What improved after stopping it?",
        fills: ["better outcome 1", "better outcome 2", "better outcome 3", "new behavior"],
      },
    ],
    ctaStyles: ["authority_reframe", "relatable", "soft_lead"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "mistake_lesson_01",
    name: "I Used to Think",
    archetype: "Mistake Lesson",
    variant: "Changed belief",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority", "Build network"],
    bestForPillars: ["Personal story", "Mistakes and misconceptions", "Point of view"],
    template: `I used to think [old belief].

So I kept doing [old behavior].

It worked for a while.

Until [moment of friction].

That’s when I realized:

[lesson]

Now I do this differently:

1. [new behavior 1]
2. [new behavior 2]
3. [new behavior 3]

Sometimes growth is not adding more.

It’s noticing what no longer works.

[cta]`,
    variables: ["old belief", "old behavior", "moment of friction", "lesson", "new behavior 1", "new behavior 2", "new behavior 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What did you used to believe that you no longer believe?",
        fills: ["old belief", "lesson"],
      },
      {
        question: "What experience changed your mind?",
        fills: ["old behavior", "moment of friction", "new behavior 1", "new behavior 2", "new behavior 3"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "authority_reframe"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "mistake_lesson_02",
    name: "Mistake I Kept Repeating",
    archetype: "Mistake Lesson",
    variant: "Repeated mistake",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority"],
    bestForPillars: ["Personal story", "Mistakes and misconceptions"],
    template: `A mistake I kept repeating:

[mistake]

It seemed reasonable because [why it seemed reasonable].

But it kept leading to:

1. [bad result 1]
2. [bad result 2]
3. [bad result 3]

The real problem was [real problem].

Now I try to [new behavior].

It’s not perfect.

But it stops me from solving the same problem the same wrong way.

[cta]`,
    variables: ["mistake", "why it seemed reasonable", "bad result 1", "bad result 2", "bad result 3", "real problem", "new behavior", "cta"],
    clarifyingQuestions: [
      {
        question: "What mistake did you repeat more than once?",
        fills: ["mistake", "why it seemed reasonable"],
      },
      {
        question: "What do you do differently now?",
        fills: ["real problem", "new behavior"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "belief_statement"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "mistake_lesson_03",
    name: "Lesson Learned Too Late",
    archetype: "Mistake Lesson",
    variant: "Late realization",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities"],
    bestForPillars: ["Personal story", "Career / credibility proof"],
    template: `This took me too long to learn:

[lesson]

I thought [old belief].

So I kept [old behavior].

But that led to:

1. [bad result 1]
2. [bad result 2]
3. [bad result 3]

Now I believe [new belief].

Which means I focus on:

1. [new focus 1]
2. [new focus 2]
3. [new focus 3]

Simple lesson.

Expensive to ignore.

[cta]`,
    variables: [
      "lesson",
      "old belief",
      "old behavior",
      "bad result 1",
      "bad result 2",
      "bad result 3",
      "new belief",
      "new focus 1",
      "new focus 2",
      "new focus 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What lesson did you learn later than you wish?",
        fills: ["lesson", "new belief"],
      },
      {
        question: "What did you used to do before learning it?",
        fills: ["old belief", "old behavior", "bad result 1", "bad result 2", "bad result 3"],
      },
    ],
    ctaStyles: ["relatable", "career_signal", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "mistake_lesson_04",
    name: "What I Got Wrong About Success",
    archetype: "Mistake Lesson",
    variant: "Success reframe",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Grow my audience", "Build network"],
    bestForPillars: ["Personal story", "Values / philosophy"],
    template: `I used to think success meant [old definition of success].

So I chased:

1. [old pursuit 1]
2. [old pursuit 2]
3. [old pursuit 3]

But that came with [cost].

Now success looks more like:

1. [new definition 1]
2. [new definition 2]
3. [new definition 3]

I’m not saying [misinterpretation].

I’m saying [clarification].

The goal changed.

So did the way I measure progress.

[cta]`,
    variables: [
      "old definition of success",
      "old pursuit 1",
      "old pursuit 2",
      "old pursuit 3",
      "cost",
      "new definition 1",
      "new definition 2",
      "new definition 3",
      "misinterpretation",
      "clarification",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What did you once think success meant?",
        fills: ["old definition of success", "old pursuit 1", "old pursuit 2", "old pursuit 3"],
      },
      {
        question: "What does success mean to you now?",
        fills: ["new definition 1", "new definition 2", "new definition 3", "clarification"],
      },
    ],
    ctaStyles: ["relatable", "shared_learning", "conversation"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "mistake_lesson_05",
    name: "Small Failure, Big Lesson",
    archetype: "Mistake Lesson",
    variant: "Small failure",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Grow my audience", "Build authority", "Build network"],
    bestForPillars: ["Personal story", "Mistakes and misconceptions"],
    template: `A small failure that taught me a lot:

[failure]

It felt [feeling] at the time.

Mostly because I had assumed:

[wrong assumption]

But the failure showed me:

1. [lesson 1]
2. [lesson 2]
3. [lesson 3]

Now I’m more careful about [new awareness].

Not because I’m afraid of failing.

Because I want the failure to teach me faster.

[cta]`,
    variables: ["failure", "feeling", "wrong assumption", "lesson 1", "lesson 2", "lesson 3", "new awareness", "cta"],
    clarifyingQuestions: [
      {
        question: "What small failure or awkward moment taught you something?",
        fills: ["failure", "feeling"],
      },
      {
        question: "What did it teach you?",
        fills: ["wrong assumption", "lesson 1", "lesson 2", "lesson 3", "new awareness"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "shared_learning"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "process_breakdown_01",
    name: "How I Approach X",
    archetype: "Process Breakdown",
    variant: "Three-step process",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Get job opportunities"],
    bestForPillars: ["Process / how-I-work", "Problem education"],
    template: `Here’s how I approach [problem]:

Step 1: [step 1]

I do this because [reason 1].

Step 2: [step 2]

This usually reveals [insight].

Step 3: [step 3]

That’s where [outcome] starts to become possible.

The process is simple.

But the order matters.

[cta]`,
    variables: ["problem", "step 1", "reason 1", "step 2", "insight", "step 3", "outcome", "cta"],
    clarifyingQuestions: [
      {
        question: "What problem do you want to explain your process for?",
        fills: ["problem"],
      },
      {
        question: "What are the 3 main steps in your process?",
        fills: ["step 1", "step 2", "step 3", "reason 1", "insight", "outcome"],
      },
    ],
    ctaStyles: ["belief_statement", "soft_lead", "work_style"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "process_breakdown_02",
    name: "First 30 Minutes",
    archetype: "Process Breakdown",
    variant: "Initial diagnosis",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads"],
    bestForPillars: ["Process / how-I-work", "Problem education"],
    template: `My first 30 minutes with [problem] are not about solving it.

They’re about understanding it.

I look for:

1. [signal 1]
2. [signal 2]
3. [signal 3]

Then I ask:

1. [question 1]
2. [question 2]
3. [question 3]

Only after that do I decide [next step].

Because if the diagnosis is wrong, the solution is just noise.

[cta]`,
    variables: ["problem", "signal 1", "signal 2", "signal 3", "question 1", "question 2", "question 3", "next step", "cta"],
    clarifyingQuestions: [
      {
        question: "What do you look at first when this problem appears?",
        fills: ["signal 1", "signal 2", "signal 3"],
      },
      {
        question: "What questions do you ask before solving it?",
        fills: ["question 1", "question 2", "question 3"],
      },
    ],
    ctaStyles: ["diagnostic", "authority_reframe", "specific_peer_question"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "process_breakdown_03",
    name: "Simple Framework",
    archetype: "Process Breakdown",
    variant: "Named framework",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads"],
    bestForPillars: ["Process / how-I-work", "Problem education"],
    template: `A simple framework I use for [topic]:

1. [framework part 1]
   [one-line explanation 1]

2. [framework part 2]
   [one-line explanation 2]

3. [framework part 3]
   [one-line explanation 3]

Most people start with [wrong starting point].

That’s why they get stuck.

Start with [right starting point].

Then the next step becomes obvious.

[cta]`,
    variables: [
      "topic",
      "framework part 1",
      "one-line explanation 1",
      "framework part 2",
      "one-line explanation 2",
      "framework part 3",
      "one-line explanation 3",
      "wrong starting point",
      "right starting point",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What framework or mental model do you use often?",
        fills: ["topic", "framework part 1", "framework part 2", "framework part 3"],
      },
      {
        question: "Where do most people start incorrectly?",
        fills: ["wrong starting point", "right starting point"],
      },
    ],
    ctaStyles: ["authority_reframe", "diagnostic", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "process_breakdown_04",
    name: "What Happens Behind the Scenes",
    archetype: "Process Breakdown",
    variant: "Visible output vs hidden work",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Recruit / hire talent"],
    bestForPillars: ["Process / how-I-work", "Behind the scenes"],
    template: `From the outside, [visible output] looks like [surface impression].

Behind the scenes, it usually takes:

1. [hidden work 1]
2. [hidden work 2]
3. [hidden work 3]
4. [hidden work 4]

Most people only see [visible output].

They don’t see [invisible effort].

That’s why [topic] looks easier from the outside than it feels on the inside.

[cta]`,
    variables: [
      "visible output",
      "surface impression",
      "hidden work 1",
      "hidden work 2",
      "hidden work 3",
      "hidden work 4",
      "invisible effort",
      "topic",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What result or output do people see from the outside?",
        fills: ["visible output", "surface impression"],
      },
      {
        question: "What hidden work goes into it?",
        fills: ["hidden work 1", "hidden work 2", "hidden work 3", "hidden work 4", "invisible effort"],
      },
    ],
    ctaStyles: ["belief_statement", "culture_invite", "conversation"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "process_breakdown_05",
    name: "Quality Checklist",
    archetype: "Process Breakdown",
    variant: "Standards for good work",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get job opportunities", "Promote my product/service"],
    bestForPillars: ["Process / how-I-work", "Career / credibility proof", "Product / service education"],
    template: `Before I call [work/output] good, I check:

1. [quality check 1]
2. [quality check 2]
3. [quality check 3]
4. [quality check 4]
5. [quality check 5]

The check I care about most is [most important check].

Because if that is missing, [bad outcome].

Good work is not just [surface standard].

Good work creates [real standard].

[cta]`,
    variables: [
      "work/output",
      "quality check 1",
      "quality check 2",
      "quality check 3",
      "quality check 4",
      "quality check 5",
      "most important check",
      "bad outcome",
      "surface standard",
      "real standard",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What do you check before calling your work good?",
        fills: ["quality check 1", "quality check 2", "quality check 3", "quality check 4", "quality check 5"],
      },
      {
        question: "Which quality check matters most?",
        fills: ["most important check", "bad outcome", "real standard"],
      },
    ],
    ctaStyles: ["belief_statement", "work_style", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

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

  t({
    id: "strong_opinion_01",
    name: "Opinions I’d Defend",
    archetype: "Strong Opinion List",
    variant: "Opinion list",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority"],
    bestForPillars: ["Point of view", "Values / philosophy"],
    template: `A few opinions I have about [topic]:

1. [opinion 1]
2. [opinion 2]
3. [opinion 3]
4. [opinion 4]
5. [opinion 5]

The one I’d defend hardest:

[strongest opinion]

Because [reason].

Most people focus on [surface thing].

I think [deeper thing] matters more.

[cta]`,
    variables: [
      "topic",
      "opinion 1",
      "opinion 2",
      "opinion 3",
      "opinion 4",
      "opinion 5",
      "strongest opinion",
      "reason",
      "surface thing",
      "deeper thing",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What topic do you have strong opinions about?",
        fills: ["topic"],
      },
      {
        question: "What are 3–5 opinions you’d defend?",
        fills: ["opinion 1", "opinion 2", "opinion 3", "opinion 4", "opinion 5", "strongest opinion"],
      },
    ],
    ctaStyles: ["agree_disagree", "conversation", "authority_reframe"],
    proofRequirement: "none",
    antiPatterns: ["Do not make opinions artificially controversial."],
  }),

  t({
    id: "strong_opinion_02",
    name: "Things I Don’t Believe Anymore",
    archetype: "Strong Opinion List",
    variant: "Belief changes",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority"],
    bestForPillars: ["Point of view", "Personal story", "Mistakes and misconceptions"],
    template: `Things I don’t believe anymore about [topic]:

1. [old belief 1]
2. [old belief 2]
3. [old belief 3]
4. [old belief 4]
5. [old belief 5]

The biggest shift was [biggest shift].

I used to think [old view].

Now I think [new view].

That changed how I [changed behavior].

Belief changes are not weakness.

They’re evidence that you’re paying attention.

[cta]`,
    variables: [
      "topic",
      "old belief 1",
      "old belief 2",
      "old belief 3",
      "old belief 4",
      "old belief 5",
      "biggest shift",
      "old view",
      "new view",
      "changed behavior",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What beliefs have changed for you over time?",
        fills: ["old belief 1", "old belief 2", "old belief 3", "old belief 4", "old belief 5"],
      },
      {
        question: "Which belief shift changed your behavior most?",
        fills: ["biggest shift", "old view", "new view", "changed behavior"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "authority_reframe"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "strong_opinion_03",
    name: "Green Flags and Red Flags",
    archetype: "Strong Opinion List",
    variant: "Signal list",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority", "Recruit / hire talent"],
    bestForPillars: ["Problem education", "Hiring / culture", "Process / how-I-work"],
    template: `Green flags in [topic]:

1. [green flag 1]
2. [green flag 2]
3. [green flag 3]

Red flags in [topic]:

1. [red flag 1]
2. [red flag 2]
3. [red flag 3]

The most underrated green flag is [underrated green flag].

The most dangerous red flag is [dangerous red flag].

Because one predicts [positive prediction].

The other predicts [negative prediction].

[cta]`,
    variables: [
      "topic",
      "green flag 1",
      "green flag 2",
      "green flag 3",
      "red flag 1",
      "red flag 2",
      "red flag 3",
      "underrated green flag",
      "dangerous red flag",
      "positive prediction",
      "negative prediction",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What topic should the green flags and red flags relate to?",
        fills: ["topic"],
      },
      {
        question: "What are the top green flags and red flags?",
        fills: ["green flag 1", "green flag 2", "green flag 3", "red flag 1", "red flag 2", "red flag 3"],
      },
    ],
    ctaStyles: ["agree_disagree", "diagnostic", "hiring_signal"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "strong_opinion_04",
    name: "Underrated Things",
    archetype: "Strong Opinion List",
    variant: "Underappreciated factors",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Point of view", "Problem education", "Values / philosophy"],
    template: `Things that matter more than people think in [topic]:

1. [underrated thing 1]
2. [underrated thing 2]
3. [underrated thing 3]
4. [underrated thing 4]
5. [underrated thing 5]

The one people underestimate most:

[most underestimated thing]

Because [reason].

It doesn’t look impressive.

But it quietly affects [important outcome].

[cta]`,
    variables: [
      "topic",
      "underrated thing 1",
      "underrated thing 2",
      "underrated thing 3",
      "underrated thing 4",
      "underrated thing 5",
      "most underestimated thing",
      "reason",
      "important outcome",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What does your audience underestimate?",
        fills: ["underrated thing 1", "underrated thing 2", "underrated thing 3", "underrated thing 4", "underrated thing 5"],
      },
      {
        question: "Which one matters most, and why?",
        fills: ["most underestimated thing", "reason", "important outcome"],
      },
    ],
    ctaStyles: ["authority_reframe", "conversation", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "strong_opinion_05",
    name: "Lines I Won’t Cross",
    archetype: "Strong Opinion List",
    variant: "Principles and boundaries",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ["Values / philosophy", "Point of view"],
    template: `Lines I won’t cross in [topic/work]:

1. I won’t [boundary 1]
2. I won’t [boundary 2]
3. I won’t [boundary 3]
4. I won’t [boundary 4]

Not because [wrong interpretation].

Because [real reason].

The standard is simple:

[principle]

If that costs me [possible cost], fine.

Some things are not worth trading for [tempting reward].

[cta]`,
    variables: [
      "topic/work",
      "boundary 1",
      "boundary 2",
      "boundary 3",
      "boundary 4",
      "wrong interpretation",
      "real reason",
      "principle",
      "possible cost",
      "tempting reward",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What professional lines or standards will you not compromise on?",
        fills: ["boundary 1", "boundary 2", "boundary 3", "boundary 4"],
      },
      {
        question: "Why do those standards matter to you?",
        fills: ["real reason", "principle", "tempting reward"],
      },
    ],
    ctaStyles: ["belief_statement", "relatable", "conversation"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "objection_handling_01",
    name: "We’re Not Ready Yet",
    archetype: "Objection Handling",
    variant: "Readiness objection",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Objection handling", "Product / service education"],
    template: `When [audience] say “we’re not ready for [thing],” they usually don’t mean [surface meaning].

They usually mean:

1. [real concern 1]
2. [real concern 2]
3. [real concern 3]

That’s fair.

But waiting too long can create:

1. [cost of waiting 1]
2. [cost of waiting 2]
3. [cost of waiting 3]

The better move is not [big intimidating step].

It’s [safe first step].

[cta]`,
    variables: [
      "audience",
      "thing",
      "surface meaning",
      "real concern 1",
      "real concern 2",
      "real concern 3",
      "cost of waiting 1",
      "cost of waiting 2",
      "cost of waiting 3",
      "big intimidating step",
      "safe first step",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What does your audience often say they’re not ready for?",
        fills: ["thing", "surface meaning"],
      },
      {
        question: "What is usually behind that hesitation?",
        fills: ["real concern 1", "real concern 2", "real concern 3", "safe first step"],
      },
    ],
    ctaStyles: ["soft_lead", "problem_solution", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "objection_handling_02",
    name: "Too Expensive",
    archetype: "Objection Handling",
    variant: "Cost objection",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Objection handling", "Product / service education"],
    template: `“[thing] is too expensive.”

Sometimes that’s true.

But the better question is:

“What is [unresolved problem] already costing us?”

It may be costing:

1. [hidden cost 1]
2. [hidden cost 2]
3. [hidden cost 3]

The price of [thing] is visible.

The cost of [unresolved problem] is usually quieter.

But quiet does not mean cheap.

[cta]`,
    variables: ["thing", "unresolved problem", "hidden cost 1", "hidden cost 2", "hidden cost 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What does your audience think is too expensive?",
        fills: ["thing"],
      },
      {
        question: "What does the unresolved problem cost them?",
        fills: ["unresolved problem", "hidden cost 1", "hidden cost 2", "hidden cost 3"],
      },
    ],
    ctaStyles: ["problem_solution", "offer_bridge", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: ["Do not use aggressive sales language."],
  }),

  t({
    id: "objection_handling_03",
    name: "We Tried That Before",
    archetype: "Objection Handling",
    variant: "Past failure objection",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Objection handling", "Mistakes and misconceptions"],
    template: `“We tried [thing] before.”

That’s a valid concern.

But the question is:

“What exactly failed?”

Was it:

1. [possible failure point 1]
2. [possible failure point 2]
3. [possible failure point 3]
4. [possible failure point 4]

Because [thing] may not have been the issue.

The issue may have been [real issue].

Trying something once is not the same as doing it under the right conditions.

[cta]`,
    variables: [
      "thing",
      "possible failure point 1",
      "possible failure point 2",
      "possible failure point 3",
      "possible failure point 4",
      "real issue",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What has your audience often already tried?",
        fills: ["thing"],
      },
      {
        question: "Why did it probably fail?",
        fills: ["possible failure point 1", "possible failure point 2", "possible failure point 3", "possible failure point 4", "real issue"],
      },
    ],
    ctaStyles: ["soft_lead", "diagnostic", "problem_solution"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "objection_handling_04",
    name: "We Can Do It Ourselves",
    archetype: "Objection Handling",
    variant: "DIY objection",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Objection handling", "Product / service education"],
    template: `“We can do [thing] ourselves.”

Sometimes, yes.

That works when:

1. [works when 1]
2. [works when 2]
3. [works when 3]

It breaks when:

1. [breaks when 1]
2. [breaks when 2]
3. [breaks when 3]

The question is not:

“Can we do this ourselves?”

It’s:

“Is doing this ourselves the best use of our time, focus, and judgment?”

[cta]`,
    variables: ["thing", "works when 1", "works when 2", "works when 3", "breaks when 1", "breaks when 2", "breaks when 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What does your audience think they can do themselves?",
        fills: ["thing"],
      },
      {
        question: "Where does DIY work, and where does it break?",
        fills: ["works when 1", "works when 2", "works when 3", "breaks when 1", "breaks when 2", "breaks when 3"],
      },
    ],
    ctaStyles: ["specific_peer_question", "soft_lead", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "objection_handling_05",
    name: "Objection Behind the Objection",
    archetype: "Objection Handling",
    variant: "Hidden fear",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Promote my product/service"],
    bestForPillars: ["Objection handling", "Audience belief shift"],
    template: `When someone says “[stated objection],” the real concern is often not [surface concern].

It’s usually:

1. [hidden concern 1]
2. [hidden concern 2]
3. [hidden concern 3]

That’s why answering with [logical response] often doesn’t work.

You’re answering the words.

Not the worry.

The better response is:

“[empathetic reframe]”

People don’t need more pressure.

They need more clarity.

[cta]`,
    variables: [
      "stated objection",
      "surface concern",
      "hidden concern 1",
      "hidden concern 2",
      "hidden concern 3",
      "logical response",
      "empathetic reframe",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What objection do you hear most often?",
        fills: ["stated objection", "surface concern"],
      },
      {
        question: "What fear or concern sits underneath it?",
        fills: ["hidden concern 1", "hidden concern 2", "hidden concern 3", "empathetic reframe"],
      },
    ],
    ctaStyles: ["soft_lead", "problem_solution", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "use_case_story_01",
    name: "When to Use This",
    archetype: "Use Case Story",
    variant: "Best-fit scenario",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Promote my product/service", "Get inbound leads"],
    bestForPillars: ["Product / service education", "Problem education"],
    template: `[product/service/approach] is useful when [situation].

Especially if you’re dealing with:

1. [problem 1]
2. [problem 2]
3. [problem 3]

It helps by:

1. [help 1]
2. [help 2]
3. [help 3]

It is not about [wrong expectation].

It is about [right expectation].

That’s where it makes the most sense.

[cta]`,
    variables: [
      "product/service/approach",
      "situation",
      "problem 1",
      "problem 2",
      "problem 3",
      "help 1",
      "help 2",
      "help 3",
      "wrong expectation",
      "right expectation",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "When is your product, service, or approach most useful?",
        fills: ["product/service/approach", "situation"],
      },
      {
        question: "What problems does it help with?",
        fills: ["problem 1", "problem 2", "problem 3", "help 1", "help 2", "help 3"],
      },
    ],
    ctaStyles: ["use_case", "offer_bridge", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "use_case_story_02",
    name: "For and Not For",
    archetype: "Use Case Story",
    variant: "Fit positioning",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Promote my product/service", "Get inbound leads"],
    bestForPillars: ["Product / service education", "Objection handling"],
    template: `[product/service/approach] is not for everyone.

It is for [right-fit audience] who want:

1. [right-fit desire 1]
2. [right-fit desire 2]
3. [right-fit desire 3]

It is probably not for people who want:

1. [bad-fit desire 1]
2. [bad-fit desire 2]
3. [bad-fit desire 3]

The point is not [wrong expectation].

The point is [right expectation].

That distinction matters.

[cta]`,
    variables: [
      "product/service/approach",
      "right-fit audience",
      "right-fit desire 1",
      "right-fit desire 2",
      "right-fit desire 3",
      "bad-fit desire 1",
      "bad-fit desire 2",
      "bad-fit desire 3",
      "wrong expectation",
      "right expectation",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Who is your product, service, or approach best for?",
        fills: ["right-fit audience", "right-fit desire 1", "right-fit desire 2", "right-fit desire 3"],
      },
      {
        question: "Who is it not a good fit for?",
        fills: ["bad-fit desire 1", "bad-fit desire 2", "bad-fit desire 3"],
      },
    ],
    ctaStyles: ["offer_bridge", "use_case", "soft_lead"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "use_case_story_03",
    name: "Day-in-the-Life Use Case",
    archetype: "Use Case Story",
    variant: "Real-life moment",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Promote my product/service", "Get inbound leads"],
    bestForPillars: ["Product / service education", "Problem education"],
    template: `[problem] usually shows up in small moments.

Like when [daily moment].

That’s when [audience] often feel:

1. [friction 1]
2. [friction 2]
3. [friction 3]

This is where [product/service/approach] helps.

It helps them:

1. [help 1]
2. [help 2]
3. [help 3]

Not in theory.

In the actual moment where the problem appears.

[cta]`,
    variables: [
      "problem",
      "daily moment",
      "audience",
      "friction 1",
      "friction 2",
      "friction 3",
      "product/service/approach",
      "help 1",
      "help 2",
      "help 3",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "When does this problem show up during the audience’s day or week?",
        fills: ["problem", "daily moment", "friction 1", "friction 2", "friction 3"],
      },
      {
        question: "How does your product, service, or approach help in that moment?",
        fills: ["product/service/approach", "help 1", "help 2", "help 3"],
      },
    ],
    ctaStyles: ["use_case", "problem_solution", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "use_case_story_04",
    name: "Underrated Use Case",
    archetype: "Use Case Story",
    variant: "Overlooked value",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Promote my product/service", "Build authority"],
    bestForPillars: ["Product / service education", "Point of view"],
    template: `An underrated use case for [product/service/approach]:

[underrated use case]

Most people use it for [common use case].

But it can also help with:

1. [benefit 1]
2. [benefit 2]
3. [benefit 3]

This matters because [reason].

The obvious use case gets attention.

The quiet use case often creates the bigger shift.

[cta]`,
    variables: ["product/service/approach", "underrated use case", "common use case", "benefit 1", "benefit 2", "benefit 3", "reason", "cta"],
    clarifyingQuestions: [
      {
        question: "What is an underrated use case for your work?",
        fills: ["underrated use case"],
      },
      {
        question: "What does it help with that people might overlook?",
        fills: ["benefit 1", "benefit 2", "benefit 3", "reason"],
      },
    ],
    ctaStyles: ["use_case", "authority_reframe", "offer_bridge"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "use_case_story_05",
    name: "Feature to Outcome",
    archetype: "Use Case Story",
    variant: "Translate capability",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Promote my product/service", "Get inbound leads", "Get job opportunities"],
    bestForPillars: ["Product / service education", "Career / credibility proof"],
    template: `[feature/capability/skill] sounds like [surface description].

But what it actually helps with is [real outcome].

Because when you can [capability], you can:

1. [practical benefit 1]
2. [practical benefit 2]
3. [practical benefit 3]

That matters because [real-world reason].

The feature is [feature/capability/skill].

The value is [real outcome].

Don’t confuse the two.

[cta]`,
    variables: [
      "feature/capability/skill",
      "surface description",
      "real outcome",
      "capability",
      "practical benefit 1",
      "practical benefit 2",
      "practical benefit 3",
      "real-world reason",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What feature, capability, or skill do you want to explain?",
        fills: ["feature/capability/skill", "capability"],
      },
      {
        question: "What outcome does it create?",
        fills: ["real outcome", "practical benefit 1", "practical benefit 2", "practical benefit 3"],
      },
    ],
    ctaStyles: ["offer_bridge", "career_signal", "use_case"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "honest_question_01",
    name: "Question I Keep Coming Back To",
    archetype: "Honest Question",
    variant: "Thoughtful question",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build network", "Grow my audience"],
    bestForPillars: ["Community / network conversation", "Point of view"],
    template: `A question I keep coming back to:

“[question]”

Because I keep seeing [observation].

On one hand, [side 1].

On the other hand, [side 2].

That tension matters because [why it matters].

I don’t have a perfect answer.

But I think the answer changes how we approach [topic].

How are you thinking about this?

[cta]`,
    variables: ["question", "observation", "side 1", "side 2", "why it matters", "topic", "cta"],
    clarifyingQuestions: [
      {
        question: "What question have you been thinking about lately?",
        fills: ["question", "topic"],
      },
      {
        question: "What tension makes the question interesting?",
        fills: ["side 1", "side 2", "why it matters"],
      },
    ],
    ctaStyles: ["peer_question", "shared_learning", "conversation"],
    proofRequirement: "none",
    antiPatterns: ["Do not pretend to have a strong conclusion."],
  }),

  t({
    id: "honest_question_02",
    name: "How Are Others Handling This",
    archetype: "Honest Question",
    variant: "Peer input",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build network", "Grow my audience"],
    bestForPillars: ["Community / network conversation", "Problem education"],
    template: `I’m seeing more [audience] struggle with [challenge].

The usual options are:

1. [option 1]
2. [option 2]
3. [option 3]

But none of them are perfect.

[option 1] creates [tradeoff 1].

[option 2] creates [tradeoff 2].

[option 3] creates [tradeoff 3].

Curious:

How are others handling [challenge] right now?

[cta]`,
    variables: ["audience", "challenge", "option 1", "option 2", "option 3", "tradeoff 1", "tradeoff 2", "tradeoff 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What challenge are you seeing repeatedly?",
        fills: ["challenge"],
      },
      {
        question: "What options or tradeoffs are people dealing with?",
        fills: ["option 1", "option 2", "option 3", "tradeoff 1", "tradeoff 2", "tradeoff 3"],
      },
    ],
    ctaStyles: ["peer_question", "collaboration", "conversation"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "honest_question_03",
    name: "Torn Between Two Views",
    archetype: "Honest Question",
    variant: "Balanced tension",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build network", "Grow my audience", "Build authority"],
    bestForPillars: ["Community / network conversation", "Point of view"],
    template: `I’m torn between two views on [topic].

View 1:

[view 1]

This makes sense because [reason 1].

View 2:

[view 2]

This also makes sense because [reason 2].

The tension is [tension].

I’m leaning toward [current leaning].

But I’m not fully settled.

What am I missing?

[cta]`,
    variables: ["topic", "view 1", "reason 1", "view 2", "reason 2", "tension", "current leaning", "cta"],
    clarifyingQuestions: [
      {
        question: "What topic are you genuinely torn about?",
        fills: ["topic"],
      },
      {
        question: "What are the two valid sides?",
        fills: ["view 1", "reason 1", "view 2", "reason 2", "tension"],
      },
    ],
    ctaStyles: ["shared_learning", "peer_question", "industry_prompt"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "honest_question_04",
    name: "What’s Changed For You",
    archetype: "Honest Question",
    variant: "Perspective shift prompt",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build network", "Grow my audience"],
    bestForPillars: ["Community / network conversation", "Market / industry observation"],
    template: `Something has changed in [field/topic].

A few years ago, [old reality].

Now, [new reality].

That changes:

1. [change 1]
2. [change 2]
3. [change 3]

I’m still thinking through what this means for [audience].

My current take:

[current take]

What has changed for you?

[cta]`,
    variables: ["field/topic", "old reality", "new reality", "change 1", "change 2", "change 3", "audience", "current take", "cta"],
    clarifyingQuestions: [
      {
        question: "What has changed in your field recently or over time?",
        fills: ["field/topic", "old reality", "new reality"],
      },
      {
        question: "What does that change affect?",
        fills: ["change 1", "change 2", "change 3", "current take"],
      },
    ],
    ctaStyles: ["peer_question", "industry_prompt", "conversation"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "honest_question_05",
    name: "Looking for Better Examples",
    archetype: "Honest Question",
    variant: "Community sourcing",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build network", "Grow my audience"],
    bestForPillars: ["Community / network conversation"],
    template: `I’m looking for better examples of [thing].

Most examples I see are either:

1. [weak example type 1]
2. [weak example type 2]
3. [weak example type 3]

What I’m looking for:

1. [desired example trait 1]
2. [desired example trait 2]
3. [desired example trait 3]

Because [reason it matters].

Who has seen a good example of this?

[cta]`,
    variables: [
      "thing",
      "weak example type 1",
      "weak example type 2",
      "weak example type 3",
      "desired example trait 1",
      "desired example trait 2",
      "desired example trait 3",
      "reason it matters",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What are you looking for examples of?",
        fills: ["thing"],
      },
      {
        question: "What makes a good example versus a weak one?",
        fills: [
          "weak example type 1",
          "weak example type 2",
          "weak example type 3",
          "desired example trait 1",
          "desired example trait 2",
          "desired example trait 3",
        ],
      },
    ],
    ctaStyles: ["peer_question", "collaboration", "shared_learning"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "hiring_philosophy_01",
    name: "We Don’t Hire for X",
    archetype: "Hiring Philosophy",
    variant: "Better hiring signal",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Recruit / hire talent", "Build authority"],
    bestForPillars: ["Hiring / culture", "Values / philosophy"],
    template: `We don’t hire for [surface trait].

We look for [deeper trait].

Because in our work, [context].

Skills matter.

But the people who thrive here usually have:

1. [trait 1]
2. [trait 2]
3. [trait 3]

The wrong fit is someone who [wrong-fit behavior].

The right fit is someone who [right-fit behavior].

That’s the kind of person we want to build with.

[cta]`,
    variables: ["surface trait", "deeper trait", "context", "trait 1", "trait 2", "trait 3", "wrong-fit behavior", "right-fit behavior", "cta"],
    clarifyingQuestions: [
      {
        question: "What do people overvalue when hiring?",
        fills: ["surface trait"],
      },
      {
        question: "What do you value more, and why?",
        fills: ["deeper trait", "context", "trait 1", "trait 2", "trait 3"],
      },
    ],
    ctaStyles: ["hiring_signal", "culture_invite", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "hiring_philosophy_02",
    name: "Who Thrives Here",
    archetype: "Hiring Philosophy",
    variant: "Fit signal",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Recruit / hire talent"],
    bestForPillars: ["Hiring / culture", "Values / philosophy"],
    template: `The people who thrive here are not always the ones with [surface credential].

They’re usually the ones who:

1. [trait 1]
2. [trait 2]
3. [trait 3]
4. [trait 4]

This environment works well for people who like [positive environment trait].

It does not work well for people who need [poor-fit need].

That’s not good or bad.

It’s fit.

And fit matters more than people admit.

[cta]`,
    variables: ["surface credential", "trait 1", "trait 2", "trait 3", "trait 4", "positive environment trait", "poor-fit need", "cta"],
    clarifyingQuestions: [
      {
        question: "What kind of person thrives in your environment?",
        fills: ["trait 1", "trait 2", "trait 3", "trait 4", "positive environment trait"],
      },
      {
        question: "Who is probably not a good fit?",
        fills: ["poor-fit need"],
      },
    ],
    ctaStyles: ["hiring_signal", "culture_invite", "role_invite"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "hiring_philosophy_03",
    name: "The Work Is Not for Everyone",
    archetype: "Hiring Philosophy",
    variant: "Honest role expectations",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Recruit / hire talent"],
    bestForPillars: ["Hiring / culture", "Behind the scenes"],
    template: `This work is not for everyone.

It requires:

1. [requirement 1]
2. [requirement 2]
3. [requirement 3]

Some days, that means [hard reality 1].

Other days, it means [hard reality 2].

The right person will find that challenging in a good way.

The wrong person will find it draining.

That’s why I’d rather be honest about the work than oversell the opportunity.

[cta]`,
    variables: ["requirement 1", "requirement 2", "requirement 3", "hard reality 1", "hard reality 2", "cta"],
    clarifyingQuestions: [
      {
        question: "What makes the work challenging?",
        fills: ["requirement 1", "requirement 2", "requirement 3", "hard reality 1", "hard reality 2"],
      },
      {
        question: "Who would enjoy that challenge?",
        fills: [],
      },
    ],
    ctaStyles: ["hiring_signal", "culture_invite", "role_invite"],
    proofRequirement: "none",
    antiPatterns: ["Do not make the role sound toxic or heroic."],
  }),

  t({
    id: "hiring_philosophy_04",
    name: "What We Look for in Interviews",
    archetype: "Hiring Philosophy",
    variant: "Interview signals",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Recruit / hire talent", "Build authority"],
    bestForPillars: ["Hiring / culture", "Process / how-I-work"],
    template: `In interviews, I pay attention to [signal].

Not because [wrong reason].

Because [real reason].

Strong candidates usually:

1. [strong signal 1]
2. [strong signal 2]
3. [strong signal 3]

Weak signals:

1. [weak signal 1]
2. [weak signal 2]
3. [weak signal 3]

The best interviews are not the most polished.

They’re the ones where you can see how someone thinks.

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
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What do you pay attention to in interviews?",
        fills: ["signal", "real reason"],
      },
      {
        question: "What are strong and weak signals?",
        fills: ["strong signal 1", "strong signal 2", "strong signal 3", "weak signal 1", "weak signal 2", "weak signal 3"],
      },
    ],
    ctaStyles: ["hiring_signal", "belief_statement", "culture_invite"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "hiring_philosophy_05",
    name: "Culture Is Behavior",
    archetype: "Hiring Philosophy",
    variant: "Culture standards",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Recruit / hire talent", "Build authority"],
    bestForPillars: ["Hiring / culture", "Values / philosophy"],
    template: `Culture is not [fake culture signal].

Culture is what happens when:

1. [behavior 1]
2. [behavior 2]
3. [behavior 3]
4. [behavior 4]

If you say you value [value], but tolerate [opposite behavior], people notice.

The real test is not what you write down.

It’s what you allow.

That’s the culture.

[cta]`,
    variables: ["fake culture signal", "behavior 1", "behavior 2", "behavior 3", "behavior 4", "value", "opposite behavior", "cta"],
    clarifyingQuestions: [
      {
        question: "What value matters most in your culture?",
        fills: ["value"],
      },
      {
        question: "What behaviors prove that value is real?",
        fills: ["behavior 1", "behavior 2", "behavior 3", "behavior 4", "opposite behavior"],
      },
    ],
    ctaStyles: ["culture_invite", "hiring_signal", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "career_proof_01",
    name: "One Project Taught Me",
    archetype: "Career Proof",
    variant: "Project proof",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get job opportunities", "Build authority"],
    bestForPillars: ["Career / credibility proof", "Proof / case study"],
    template: `One project taught me more about [skill] than any course could.

The challenge was [challenge].

My role was to [responsibility].

The hard part wasn’t [obvious difficulty].

It was [real difficulty].

What I did:

1. [action 1]
2. [action 2]
3. [action 3]

What I learned:

[lesson]

That’s the kind of work I want to do more of.

[cta]`,
    variables: ["skill", "challenge", "responsibility", "obvious difficulty", "real difficulty", "action 1", "action 2", "action 3", "lesson", "cta"],
    clarifyingQuestions: [
      {
        question: "What project are you proud of?",
        fills: ["challenge", "responsibility"],
      },
      {
        question: "What did it prove about how you work?",
        fills: ["skill", "real difficulty", "action 1", "action 2", "action 3", "lesson"],
      },
    ],
    ctaStyles: ["career_signal", "work_style", "open_to_conversation"],
    proofRequirement: "required",
    antiPatterns: ["Do not sound desperate for a job."],
  }),

  t({
    id: "career_proof_02",
    name: "How I Solve Problems",
    archetype: "Career Proof",
    variant: "Problem-solving proof",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get job opportunities", "Build authority", "Get inbound leads"],
    bestForPillars: ["Career / credibility proof", "Process / how-I-work"],
    template: `The kind of problem I like solving:

[problem type]

Usually, it looks messy at first:

1. [messy element 1]
2. [messy element 2]
3. [messy element 3]

My approach is simple:

1. [approach step 1]
2. [approach step 2]
3. [approach step 3]

I’m good at [strength].

Especially when [ideal context].

That’s where I tend to do my best work.

[cta]`,
    variables: [
      "problem type",
      "messy element 1",
      "messy element 2",
      "messy element 3",
      "approach step 1",
      "approach step 2",
      "approach step 3",
      "strength",
      "ideal context",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What kind of problem are you good at solving?",
        fills: ["problem type", "strength"],
      },
      {
        question: "How do you usually approach it?",
        fills: ["approach step 1", "approach step 2", "approach step 3", "ideal context"],
      },
    ],
    ctaStyles: ["work_style", "career_signal", "soft_lead"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "career_proof_03",
    name: "What I Want More Of",
    archetype: "Career Proof",
    variant: "Opportunity signal",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get job opportunities", "Build network"],
    bestForPillars: ["Career / credibility proof", "Personal story"],
    template: `The work I want more of:

[work type]

Because it combines:

1. [energizing element 1]
2. [energizing element 2]
3. [energizing element 3]

I’ve done versions of this through [past experience].

What I liked most was [specific part].

I’m not looking for just any opportunity.

I’m looking for work where [fit signal].

That’s where I can do my best work.

[cta]`,
    variables: [
      "work type",
      "energizing element 1",
      "energizing element 2",
      "energizing element 3",
      "past experience",
      "specific part",
      "fit signal",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What kind of work energizes you most?",
        fills: ["work type", "energizing element 1", "energizing element 2", "energizing element 3"],
      },
      {
        question: "What kind of opportunity are you looking for next?",
        fills: ["fit signal", "past experience", "specific part"],
      },
    ],
    ctaStyles: ["career_signal", "open_to_conversation", "collaboration"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "career_proof_04",
    name: "Skill Built the Hard Way",
    archetype: "Career Proof",
    variant: "Earned skill",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get job opportunities", "Build authority"],
    bestForPillars: ["Career / credibility proof", "Personal story"],
    template: `I built [skill] the hard way.

Not through [easy path].

Through [hard context].

That meant learning how to:

1. [learned behavior 1]
2. [learned behavior 2]
3. [learned behavior 3]

The hardest part was [hardest part].

But now that skill helps me [current value].

Some skills don’t look impressive on paper.

But they change how you work.

[cta]`,
    variables: [
      "skill",
      "easy path",
      "hard context",
      "learned behavior 1",
      "learned behavior 2",
      "learned behavior 3",
      "hardest part",
      "current value",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What skill did you build through real experience?",
        fills: ["skill", "hard context"],
      },
      {
        question: "How does that skill show up in your work now?",
        fills: ["learned behavior 1", "learned behavior 2", "learned behavior 3", "current value"],
      },
    ],
    ctaStyles: ["career_signal", "work_style", "belief_statement"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "career_proof_05",
    name: "What People Come to Me For",
    archetype: "Career Proof",
    variant: "Peer recognition",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get job opportunities", "Build authority"],
    bestForPillars: ["Career / credibility proof", "Values / philosophy"],
    template: `People often come to me for [thing people ask for].

Not because I have all the answers.

Because I’m good at:

1. [strength 1]
2. [strength 2]
3. [strength 3]

A recent example:

[short example]

That showed me [realization].

Sometimes your strongest skill is the thing people keep asking you for.

Pay attention to that pattern.

[cta]`,
    variables: ["thing people ask for", "strength 1", "strength 2", "strength 3", "short example", "realization", "cta"],
    clarifyingQuestions: [
      {
        question: "What do people often ask you for help with?",
        fills: ["thing people ask for", "strength 1", "strength 2", "strength 3"],
      },
      {
        question: "Can you give a quick example?",
        fills: ["short example", "realization"],
      },
    ],
    ctaStyles: ["career_signal", "work_style", "open_to_conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "trend_reframe_01",
    name: "Everyone Is Talking About X",
    archetype: "Trend Reframe",
    variant: "Trend noise vs substance",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Build network"],
    bestForPillars: ["Market / industry observation", "Point of view"],
    template: `Everyone is talking about [trend].

But I don’t think the real story is [surface story].

The real story is [deeper shift].

You can see it in:

1. [signal 1]
2. [signal 2]
3. [signal 3]

For [audience], this means [implication].

Not because [hype reason].

Because [practical reason].

[cta]`,
    variables: [
      "trend",
      "surface story",
      "deeper shift",
      "signal 1",
      "signal 2",
      "signal 3",
      "audience",
      "implication",
      "hype reason",
      "practical reason",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What trend is everyone talking about?",
        fills: ["trend", "surface story"],
      },
      {
        question: "What deeper shift does it represent?",
        fills: ["deeper shift", "signal 1", "signal 2", "signal 3", "implication"],
      },
    ],
    ctaStyles: ["industry_prompt", "authority_reframe", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: ["Do not use hype language."],
  }),

  t({
    id: "trend_reframe_02",
    name: "Trend Is Not About X",
    archetype: "Trend Reframe",
    variant: "Deeper meaning",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Market / industry observation", "Audience belief shift"],
    template: `[trend] is not really about [surface interpretation].

It’s about [deeper interpretation].

That matters because it changes what [audience] should do next.

If you think it’s about [surface interpretation], you’ll focus on:

1. [wrong focus 1]
2. [wrong focus 2]
3. [wrong focus 3]

If you see it as [deeper interpretation], you’ll focus on:

1. [better focus 1]
2. [better focus 2]
3. [better focus 3]

Same trend.

Different read.

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
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What trend do you want to reframe?",
        fills: ["trend"],
      },
      {
        question: "What is the surface interpretation versus your deeper interpretation?",
        fills: ["surface interpretation", "deeper interpretation"],
      },
    ],
    ctaStyles: ["authority_reframe", "industry_prompt", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "trend_reframe_03",
    name: "Boring Part of the Trend",
    archetype: "Trend Reframe",
    variant: "Operational reality",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Market / industry observation", "Process / how-I-work"],
    template: `The boring part of [trend] matters more than the exciting part.

Everyone talks about [exciting part].

Fewer people talk about:

1. [boring reality 1]
2. [boring reality 2]
3. [boring reality 3]

But that’s where the real work happens.

Because [trend] only creates value when [condition].

The hype gets attention.

The boring part creates results.

[cta]`,
    variables: ["trend", "exciting part", "boring reality 1", "boring reality 2", "boring reality 3", "condition", "cta"],
    clarifyingQuestions: [
      {
        question: "What trend is overhyped right now?",
        fills: ["trend", "exciting part"],
      },
      {
        question: "What boring reality sits underneath it?",
        fills: ["boring reality 1", "boring reality 2", "boring reality 3", "condition"],
      },
    ],
    ctaStyles: ["authority_reframe", "conversation", "belief_statement"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "trend_reframe_04",
    name: "What This Changes for Your Audience",
    archetype: "Trend Reframe",
    variant: "Audience implication",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Build network"],
    bestForPillars: ["Market / industry observation", "Problem education"],
    template: `[change] changes something important for [audience].

It means they can no longer rely on:

1. [old assumption 1]
2. [old assumption 2]
3. [old assumption 3]

They now need to think more about:

1. [new focus 1]
2. [new focus 2]
3. [new focus 3]

The mistake would be treating [change] as [surface interpretation].

I think it’s really a signal that [deeper implication].

[cta]`,
    variables: [
      "change",
      "audience",
      "old assumption 1",
      "old assumption 2",
      "old assumption 3",
      "new focus 1",
      "new focus 2",
      "new focus 3",
      "surface interpretation",
      "deeper implication",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What changed in your market or field?",
        fills: ["change"],
      },
      {
        question: "How does it affect your audience specifically?",
        fills: ["old assumption 1", "old assumption 2", "old assumption 3", "new focus 1", "new focus 2", "new focus 3", "deeper implication"],
      },
    ],
    ctaStyles: ["industry_prompt", "diagnostic", "peer_question"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "trend_reframe_05",
    name: "Trend I’m Skeptical About",
    archetype: "Trend Reframe",
    variant: "Balanced skepticism",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Market / industry observation", "Point of view"],
    template: `I’m skeptical about [trend].

Not because [wrong reason].

Because I keep seeing:

1. [concern 1]
2. [concern 2]
3. [concern 3]

That said, [trend] can be useful when:

1. [useful condition 1]
2. [useful condition 2]
3. [useful condition 3]

So my take is not “[trend] is bad.”

My take is:

“[balanced take]”

[cta]`,
    variables: [
      "trend",
      "wrong reason",
      "concern 1",
      "concern 2",
      "concern 3",
      "useful condition 1",
      "useful condition 2",
      "useful condition 3",
      "balanced take",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What trend are you skeptical about?",
        fills: ["trend"],
      },
      {
        question: "Why are you skeptical, and when might it still be useful?",
        fills: ["concern 1", "concern 2", "concern 3", "useful condition 1", "useful condition 2", "useful condition 3", "balanced take"],
      },
    ],
    ctaStyles: ["agree_disagree", "industry_prompt", "authority_reframe"],
    proofRequirement: "none",
    antiPatterns: ["Do not make the skepticism sound like rage-bait."],
  }),

  t({
    id: "customer_pattern_01",
    name: "I Keep Seeing This Pattern",
    archetype: "Customer / Client Pattern",
    variant: "Repeated observation",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Proof / case study"],
    template: `I keep seeing the same pattern with [audience].

They want [desired outcome].

So they focus on:

1. [wrong focus 1]
2. [wrong focus 2]
3. [wrong focus 3]

But the ones who make progress usually focus on:

1. [better focus 1]
2. [better focus 2]
3. [better focus 3]

That’s the difference.

Not more [surface activity].

Better [deeper activity].

[cta]`,
    variables: [
      "audience",
      "desired outcome",
      "wrong focus 1",
      "wrong focus 2",
      "wrong focus 3",
      "better focus 1",
      "better focus 2",
      "better focus 3",
      "surface activity",
      "deeper activity",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What pattern do you keep seeing with your audience?",
        fills: ["wrong focus 1", "wrong focus 2", "wrong focus 3"],
      },
      {
        question: "What do the better examples do differently?",
        fills: ["better focus 1", "better focus 2", "better focus 3", "deeper activity"],
      },
    ],
    ctaStyles: ["soft_lead", "authority_reframe", "specific_peer_question"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "customer_pattern_02",
    name: "Same Problem in Different Clothes",
    archetype: "Customer / Client Pattern",
    variant: "Shared root cause",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Audience belief shift"],
    template: `Different problems I see:

1. [surface problem 1]
2. [surface problem 2]
3. [surface problem 3]

They look separate.

But they often come from the same root issue:

[root issue]

That matters because people try to solve each surface problem separately.

So they end up with:

1. [bad result 1]
2. [bad result 2]
3. [bad result 3]

Fix the root issue.

The surface problems get easier.

[cta]`,
    variables: ["surface problem 1", "surface problem 2", "surface problem 3", "root issue", "bad result 1", "bad result 2", "bad result 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What different surface problems seem connected?",
        fills: ["surface problem 1", "surface problem 2", "surface problem 3"],
      },
      {
        question: "What root issue do they share?",
        fills: ["root issue"],
      },
    ],
    ctaStyles: ["diagnostic", "soft_lead", "authority_reframe"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "customer_pattern_03",
    name: "What the Best Do Differently",
    archetype: "Customer / Client Pattern",
    variant: "Strong performers",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Grow my audience", "Recruit / hire talent"],
    bestForPillars: ["Point of view", "Problem education", "Hiring / culture"],
    template: `The best [audience] I’ve seen do [topic] differently.

Average ones focus on:

1. [average behavior 1]
2. [average behavior 2]
3. [average behavior 3]

The best ones focus on:

1. [strong behavior 1]
2. [strong behavior 2]
3. [strong behavior 3]

The difference is not [surface difference].

The difference is [real difference].

That shows up in [outcome].

[cta]`,
    variables: [
      "audience",
      "topic",
      "average behavior 1",
      "average behavior 2",
      "average behavior 3",
      "strong behavior 1",
      "strong behavior 2",
      "strong behavior 3",
      "surface difference",
      "real difference",
      "outcome",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Who are the best examples in your world?",
        fills: ["audience", "topic"],
      },
      {
        question: "What do they do differently from average performers?",
        fills: [
          "average behavior 1",
          "average behavior 2",
          "average behavior 3",
          "strong behavior 1",
          "strong behavior 2",
          "strong behavior 3",
          "real difference",
        ],
      },
    ],
    ctaStyles: ["belief_statement", "conversation", "hiring_signal"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "customer_pattern_04",
    name: "Quiet Signal",
    archetype: "Customer / Client Pattern",
    variant: "Predictive signal",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Recruit / hire talent", "Get inbound leads"],
    bestForPillars: ["Problem education", "Hiring / culture", "Point of view"],
    template: `A quiet signal I pay attention to:

[quiet signal]

It does not look like much.

But it usually predicts [prediction].

You can see it when someone:

1. [behavior 1]
2. [behavior 2]
3. [behavior 3]

The opposite signal is [opposite signal].

That usually leads to [negative prediction].

Small signals are not small if they predict the future.

[cta]`,
    variables: ["quiet signal", "prediction", "behavior 1", "behavior 2", "behavior 3", "opposite signal", "negative prediction", "cta"],
    clarifyingQuestions: [
      {
        question: "What subtle signal do you pay attention to?",
        fills: ["quiet signal", "prediction"],
      },
      {
        question: "What behaviors show that signal?",
        fills: ["behavior 1", "behavior 2", "behavior 3", "opposite signal", "negative prediction"],
      },
    ],
    ctaStyles: ["belief_statement", "hiring_signal", "diagnostic"],
    proofRequirement: "none",
    antiPatterns: [],
  }),

  t({
    id: "customer_pattern_05",
    name: "What Struggling People Have in Common",
    archetype: "Customer / Client Pattern",
    variant: "Stuck pattern",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer"],
    bestForGoals: ["Get inbound leads", "Build authority"],
    bestForPillars: ["Problem education", "Audience belief shift"],
    template: `Struggling [audience] usually have a few things in common.

They often:

1. [pattern 1]
2. [pattern 2]
3. [pattern 3]
4. [pattern 4]

None of this means they’re bad at [topic].

It usually means [reframe].

The first step is not [wrong first step].

The first step is [better first step].

That’s how they stop fighting symptoms and start fixing the system.

[cta]`,
    variables: ["audience", "pattern 1", "pattern 2", "pattern 3", "pattern 4", "topic", "reframe", "wrong first step", "better first step", "cta"],
    clarifyingQuestions: [
      {
        question: "What do struggling people or teams in your audience tend to have in common?",
        fills: ["pattern 1", "pattern 2", "pattern 3", "pattern 4"],
      },
      {
        question: "What is the more useful reframe?",
        fills: ["reframe", "wrong first step", "better first step"],
      },
    ],
    ctaStyles: ["soft_lead", "diagnostic", "authority_reframe"],
    proofRequirement: "none",
    antiPatterns: ["Do not shame the audience."],
  }),

  t({
    id: "origin_story_01",
    name: "Why I Started",
    archetype: "Origin Story",
    variant: "Founder / creator origin",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Build authority", "Grow my audience", "Promote my product/service"],
    bestForPillars: ["Personal story", "Values / philosophy", "Product / service education"],
    template: `I started [thing] because I was tired of [frustration].

I kept seeing:

1. [problem 1]
2. [problem 2]
3. [problem 3]

At some point, I realized [realization].

So I decided to [decision].

That decision still shapes how I work today.

It’s why I care about:

1. [value 1]
2. [value 2]
3. [value 3]

The work started with [frustration].

But it continues because of [mission].

[cta]`,
    variables: [
      "thing",
      "frustration",
      "problem 1",
      "problem 2",
      "problem 3",
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
        question: "What frustration or problem pushed you to start?",
        fills: ["frustration", "problem 1", "problem 2", "problem 3"],
      },
      {
        question: "How does that still shape your work today?",
        fills: ["realization", "decision", "value 1", "value 2", "value 3", "mission"],
      },
    ],
    ctaStyles: ["relatable", "offer_bridge", "belief_statement"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "origin_story_02",
    name: "Moment It Clicked",
    archetype: "Origin Story",
    variant: "Realization moment",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Build authority", "Grow my audience"],
    bestForPillars: ["Personal story", "Point of view"],
    template: `There was a moment when [topic] finally clicked for me.

Before that, I thought [old belief].

So I kept [old behavior].

Then [moment].

That made me realize:

[realization]

After that, I started:

1. [new action 1]
2. [new action 2]
3. [new action 3]

That one shift changed how I think about [topic].

Not because everything became easy.

Because the problem became clearer.

[cta]`,
    variables: ["topic", "old belief", "old behavior", "moment", "realization", "new action 1", "new action 2", "new action 3", "cta"],
    clarifyingQuestions: [
      {
        question: "What moment changed how you saw the problem?",
        fills: ["moment", "realization"],
      },
      {
        question: "What did you think before, and what did you do differently after?",
        fills: ["old belief", "old behavior", "new action 1", "new action 2", "new action 3"],
      },
    ],
    ctaStyles: ["relatable", "authority_reframe", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "origin_story_03",
    name: "Problem I Couldn’t Ignore",
    archetype: "Origin Story",
    variant: "Conviction story",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Build authority", "Promote my product/service", "Get inbound leads"],
    bestForPillars: ["Personal story", "Problem education", "Values / philosophy"],
    template: `I kept seeing [problem].

At first, I thought it was just [early assumption].

But then I saw it show up in:

1. [situation 1]
2. [situation 2]
3. [situation 3]

That’s when I realized [realization].

I couldn’t ignore it anymore.

So I started working on [solution/work].

The conviction came from repetition.

Not theory.

[cta]`,
    variables: ["problem", "early assumption", "situation 1", "situation 2", "situation 3", "realization", "solution/work", "cta"],
    clarifyingQuestions: [
      {
        question: "What problem kept showing up around you?",
        fills: ["problem", "situation 1", "situation 2", "situation 3"],
      },
      {
        question: "What did you decide to do about it?",
        fills: ["realization", "solution/work"],
      },
    ],
    ctaStyles: ["offer_bridge", "soft_lead", "belief_statement"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "origin_story_04",
    name: "Why This Work Matters",
    archetype: "Origin Story",
    variant: "Personal meaning",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Grow my audience", "Build authority", "Build network"],
    bestForPillars: ["Personal story", "Values / philosophy"],
    template: `This work matters to me because [personal reason].

Not in a vague way.

In a very specific way.

I’ve seen what happens when [problem]:

1. [consequence 1]
2. [consequence 2]
3. [consequence 3]

And I’ve seen what changes when [better path]:

1. [positive change 1]
2. [positive change 2]
3. [positive change 3]

That’s why I care about [work/topic].

It’s not just work.

It’s [deeper meaning].

[cta]`,
    variables: [
      "personal reason",
      "problem",
      "consequence 1",
      "consequence 2",
      "consequence 3",
      "better path",
      "positive change 1",
      "positive change 2",
      "positive change 3",
      "work/topic",
      "deeper meaning",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Why does this work matter to you personally?",
        fills: ["personal reason", "work/topic", "deeper meaning"],
      },
      {
        question: "What changes when the problem is solved?",
        fills: ["consequence 1", "consequence 2", "consequence 3", "positive change 1", "positive change 2", "positive change 3"],
      },
    ],
    ctaStyles: ["relatable", "shared_learning", "belief_statement"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "origin_story_05",
    name: "From Annoyance to Offer",
    archetype: "Origin Story",
    variant: "Offer origin",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Promote my product/service", "Get inbound leads", "Build authority"],
    bestForPillars: ["Product / service education", "Personal story", "Problem education"],
    template: `[offer/product/service] started because I was annoyed by [annoyance].

I kept seeing [audience] struggle with:

1. [struggle 1]
2. [struggle 2]
3. [struggle 3]

The annoying part was [why it annoyed you].

So I built/created/focused on [solution].

The goal was simple:

Help [audience] get [desired outcome] without [painful alternative].

That is still the point.

[cta]`,
    variables: [
      "offer/product/service",
      "annoyance",
      "audience",
      "struggle 1",
      "struggle 2",
      "struggle 3",
      "why it annoyed you",
      "solution",
      "desired outcome",
      "painful alternative",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What annoyed you enough to build or offer something around it?",
        fills: ["annoyance", "why it annoyed you"],
      },
      {
        question: "Who had the same problem, and what did you create to help?",
        fills: ["audience", "struggle 1", "struggle 2", "struggle 3", "solution", "desired outcome"],
      },
    ],
    ctaStyles: ["offer_bridge", "use_case", "soft_lead"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "lessons_learned_01",
    name: "Lessons From a Period",
    archetype: "Lessons Learned",
    variant: "Timeframe reflection",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority", "Build network"],
    bestForPillars: ["Personal story", "Values / philosophy", "Point of view"],
    template: `Lessons from [timeframe]:

1. [lesson 1]
   [short explanation 1]

2. [lesson 2]
   [short explanation 2]

3. [lesson 3]
   [short explanation 3]

4. [lesson 4]
   [short explanation 4]

The one that changed me most:

[biggest lesson]

Because [reason].

Some lessons only become obvious after you live through them.

[cta]`,
    variables: [
      "timeframe",
      "lesson 1",
      "short explanation 1",
      "lesson 2",
      "short explanation 2",
      "lesson 3",
      "short explanation 3",
      "lesson 4",
      "short explanation 4",
      "biggest lesson",
      "reason",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What period should the post reflect on?",
        fills: ["timeframe"],
      },
      {
        question: "What are 3–4 lessons from that period?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4", "biggest lesson", "reason"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "shared_learning"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "lessons_learned_02",
    name: "Lessons From a Hard Season",
    archetype: "Lessons Learned",
    variant: "Difficult period",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Grow my audience", "Build authority", "Build network"],
    bestForPillars: ["Personal story", "Values / philosophy"],
    template: `[hard season] taught me a few things.

1. [lesson 1]
   [short explanation 1]

2. [lesson 2]
   [short explanation 2]

3. [lesson 3]
   [short explanation 3]

The hardest part was [hardest part].

The most useful lesson was [most useful lesson].

I wouldn’t romanticize it.

But I also wouldn’t waste it.

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
      "most useful lesson",
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "What hard season or challenge can you talk about?",
        fills: ["hard season", "hardest part"],
      },
      {
        question: "What did it teach you?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "most useful lesson"],
      },
    ],
    ctaStyles: ["relatable", "shared_learning", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: ["Do not make pain sound like a motivational prop."],
  }),

  t({
    id: "lessons_learned_03",
    name: "Lessons From Working With X",
    archetype: "Lessons Learned",
    variant: "Audience/client lessons",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Build authority", "Get inbound leads", "Grow my audience"],
    bestForPillars: ["Proof / case study", "Problem education", "Personal story"],
    template: `Lessons from working with [audience/group]:

1. [lesson 1]
   [short explanation 1]

2. [lesson 2]
   [short explanation 2]

3. [lesson 3]
   [short explanation 3]

4. [lesson 4]
   [short explanation 4]

The pattern I notice most:

[pattern]

And the mistake I see most:

[mistake]

Both are useful to understand.

[cta]`,
    variables: [
      "audience/group",
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
      "cta",
    ],
    clarifyingQuestions: [
      {
        question: "Who have you worked with or learned from?",
        fills: ["audience/group"],
      },
      {
        question: "What lessons or patterns did you notice?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4", "pattern", "mistake"],
      },
    ],
    ctaStyles: ["authority_reframe", "soft_lead", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
  }),

  t({
    id: "lessons_learned_04",
    name: "Lessons I Keep Relearning",
    archetype: "Lessons Learned",
    variant: "Repeated reminder",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional"],
    bestForGoals: ["Grow my audience", "Build network"],
    bestForPillars: ["Personal story", "Values / philosophy"],
    template: `A lesson I keep relearning:

[lesson]

I know it intellectually.

But I forget it when:

1. [situation 1]
2. [situation 2]
3. [situation 3]

That’s usually when I start [old behavior].

The reminder I need is:

[reminder]

Simple.

Annoying.

Still true.

[cta]`,
    variables: ["lesson", "situation 1", "situation 2", "situation 3", "old behavior", "reminder", "cta"],
    clarifyingQuestions: [
      {
        question: "What lesson do you keep relearning?",
        fills: ["lesson", "reminder"],
      },
      {
        question: "When do you usually forget it?",
        fills: ["situation 1", "situation 2", "situation 3", "old behavior"],
      },
    ],
    ctaStyles: ["relatable", "conversation", "shared_learning"],
    proofRequirement: "optional",
    antiPatterns: [],
  }),

  t({
    id: "lessons_learned_05",
    name: "Lessons From Doing the Work",
    archetype: "Lessons Learned",
    variant: "Shipping lesson",
    bestForRoles: ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Job seeker / career professional", "Marketer"],
    bestForGoals: ["Grow my audience", "Build authority", "Get job opportunities"],
    bestForPillars: ["Personal story", "Process / how-I-work", "Career / credibility proof"],
    template: `Things you only learn by actually doing [work]:

1. [lesson 1]
2. [lesson 2]
3. [lesson 3]
4. [lesson 4]

Before doing it, I thought [old assumption].

After doing it, I realized [new realization].

The work teaches faster than theory.

Not because theory is useless.

Because reality gives better feedback.

[cta]`,
    variables: ["work", "lesson 1", "lesson 2", "lesson 3", "lesson 4", "old assumption", "new realization", "cta"],
    clarifyingQuestions: [
      {
        question: "What have you recently shipped, built, tried, or completed?",
        fills: ["work"],
      },
      {
        question: "What did doing the work teach you?",
        fills: ["lesson 1", "lesson 2", "lesson 3", "lesson 4", "old assumption", "new realization"],
      },
    ],
    ctaStyles: ["relatable", "career_signal", "conversation"],
    proofRequirement: "recommended",
    antiPatterns: [],
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
