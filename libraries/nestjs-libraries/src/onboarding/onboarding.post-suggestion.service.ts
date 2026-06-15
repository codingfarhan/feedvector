import { Injectable } from '@nestjs/common';
import { OpenaiService } from '@gitroom/nestjs-libraries/openai/openai.service';
import {
  LINKEDIN_POST_TEMPLATES,
  type Goal,
  type PillarCategory,
  type PostTemplate,
  type Role,
  getCTAOptionsForGoalAndRole,
} from '@gitroom/nestjs-libraries/onboarding/linkedin.post.templates';

const GOAL_PILLARS: Record<Goal, PillarCategory[]> = {
  'Get inbound leads': [
    'Problem education',
    'Objection handling',
    'Proof / case study',
    'Process / how-I-work',
  ],
  'Build authority': [
    'Point of view',
    'Mistakes and misconceptions',
    'Market / industry observation',
    'Audience belief shift',
  ],
  'Grow my audience': [
    'Personal story',
    'Community / network conversation',
    'Behind the scenes',
    'Values / philosophy',
  ],
  'Promote my product/service': [
    'Product / service education',
    'Problem education',
    'Proof / case study',
    'Objection handling',
  ],
  'Get job opportunities': [
    'Career / credibility proof',
    'Process / how-I-work',
    'Personal story',
    'Values / philosophy',
  ],
  'Build network': [
    'Community / network conversation',
    'Market / industry observation',
    'Personal story',
    'Point of view',
  ],
  'Recruit / hire talent': [
    'Hiring / culture',
    'Values / philosophy',
    'Behind the scenes',
    'Point of view',
  ],
};

const ROLE_PILLAR_BOOSTS: Record<Role, PillarCategory[]> = {
  Founder: [
    'Point of view',
    'Behind the scenes',
    'Product / service education',
  ],
  'Agency owner': [
    'Proof / case study',
    'Problem education',
    'Process / how-I-work',
  ],
  Consultant: [
    'Problem education',
    'Audience belief shift',
    'Objection handling',
  ],
  Freelancer: ['Process / how-I-work', 'Proof / case study', 'Personal story'],
  Coach: [
    'Audience belief shift',
    'Mistakes and misconceptions',
    'Personal story',
  ],
  Creator: [
    'Personal story',
    'Values / philosophy',
    'Community / network conversation',
  ],
  Marketer: [
    'Market / industry observation',
    'Point of view',
    'Problem education',
  ],
  'Job seeker / career professional': [
    'Career / credibility proof',
    'Process / how-I-work',
    'Personal story',
  ],
};

type OnboardingSuggestionInput = {
  role: string;
  audience: string;
  goal: string;
  linkedinProfileContext: any;
  websiteProfile?: any;
};

type RepurposePostInput = {
  sourceType: 'website' | 'past_posts' | 'profile';
  role: string;
  audience: string;
  goal: string;
  allowedPillars: string[];
  additionalContext?: string;
  visualContext?: string;
  websiteProfile?: any;
  websitePages?: any[];
  selectedPosts?: Array<{
    label: string;
    date?: string;
    total?: number;
  }>;
  linkedinProfileContext?: any;
  profileFocus?: string;
};

@Injectable()
export class OnboardingPostSuggestionService {
  constructor(private _openaiService: OpenaiService) {}

  assignPillars(role: string, goal: string, hasProof: boolean) {
    const typedGoal = goal as Goal;
    const typedRole = role as Role;
    const goalPillars =
      GOAL_PILLARS[typedGoal] || GOAL_PILLARS['Build authority'];
    const roleBoosts = ROLE_PILLAR_BOOSTS[typedRole] || [];
    const ordered = [...goalPillars, ...roleBoosts];
    const unique = ordered.filter(
      (pillar, index) => ordered.indexOf(pillar) === index
    );
    const pillars = unique.slice(0, 4);

    if (!hasProof) {
      return pillars
        .map((pillar) =>
          pillar === 'Proof / case study' ? 'Process / how-I-work' : pillar
        )
        .filter((pillar, index, all) => all.indexOf(pillar) === index)
        .concat(['Problem education', 'Point of view'])
        .filter((pillar, index, all) => all.indexOf(pillar) === index)
        .slice(0, 4);
    }

    return pillars;
  }

  async generateSuggestions(input: OnboardingSuggestionInput) {
    const hasProof = this.hasProof(
      input.linkedinProfileContext,
      input.websiteProfile
    );
    const pillars = this.assignPillars(input.role, input.goal, hasProof);
    const templates = this.selectTemplates(
      input.role,
      input.goal,
      pillars,
      hasProof
    );
    const generated = await this._openaiService.generateOnboardingLinkedinPosts(
      {
        role: input.role,
        audience: input.audience,
        goal: input.goal,
        campaignInstructions: [
          'These posts are part of one weekly LinkedIn campaign.',
          'Keep the posts strategically related, but make their structures visibly different.',
          'Do not reuse the same opening pattern across posts.',
          'Do not reuse the same list format across posts.',
          'Vary hook style, sentence rhythm, CTA style, and post shape across the set.',
        ],
        linkedinProfileContext: this.compactLinkedinContext(
          input.linkedinProfileContext
        ),
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
          ctaOptions: getCTAOptionsForGoalAndRole(
            input.goal as Goal,
            input.role as Role
          )
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
      }
    );

    return templates.map(({ template, pillar }, index) => {
      const post = generated.find((item) => item.templateId === template.id);
      const content = this.cleanGeneratedContent(post?.content || '');
      if (!content) {
        throw new Error('Could not generate onboarding post suggestions');
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
      };
    });
  }

  async generateRepurposedPost(input: RepurposePostInput) {
    const generated = await this._openaiService.generateRepurposedLinkedinPost({
      ...input,
      allowedPillars: input.allowedPillars.length
        ? input.allowedPillars
        : this.assignPillars(input.role, input.goal, true),
      linkedinProfileContext: input.linkedinProfileContext
        ? this.compactLinkedinContext(input.linkedinProfileContext)
        : undefined,
      websitePages: (input.websitePages || []).slice(0, 5),
    });
    const content = this.cleanGeneratedContent(generated.content || '');

    if (!content) {
      throw new Error('Could not generate a post from this source');
    }

    return {
      content,
      pillar: generated.pillar || input.allowedPillars[0] || '',
      angle: generated.angle || '',
    };
  }

  private selectTemplates(
    role: string,
    goal: string,
    pillars: PillarCategory[],
    hasProof: boolean
  ) {
    const selected: Array<{ template: PostTemplate; pillar: PillarCategory }> =
      [];
    const used = new Set<string>();

    for (const pillar of pillars) {
      const candidates = LINKEDIN_POST_TEMPLATES.filter((template) => {
        if (used.has(template.id)) {
          return false;
        }

        if (!template.bestForGoals.includes(goal as Goal)) {
          return false;
        }

        if (!template.bestForPillars.includes(pillar)) {
          return false;
        }

        if (template.proofRequirement === 'required' && !hasProof) {
          return false;
        }

        return true;
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(
          a,
          role,
          goal,
          hasProof,
          selected
        );
        const bScore = this.campaignTemplateScore(
          b,
          role,
          goal,
          hasProof,
          selected
        );
        return bScore - aScore || a.id.localeCompare(b.id);
      });

      const template = candidates[0];
      if (template) {
        selected.push({ template, pillar });
        used.add(template.id);
      }
    }

    if (selected.length < 4) {
      const fallback = LINKEDIN_POST_TEMPLATES.filter((template) => {
        return (
          !used.has(template.id) &&
          template.bestForGoals.includes(goal as Goal) &&
          (hasProof || template.proofRequirement !== 'required')
        );
      }).sort((a, b) => {
        const aScore = this.campaignTemplateScore(
          a,
          role,
          goal,
          hasProof,
          selected
        );
        const bScore = this.campaignTemplateScore(
          b,
          role,
          goal,
          hasProof,
          selected
        );
        return bScore - aScore || a.id.localeCompare(b.id);
      });

      for (const template of fallback) {
        const pillar =
          template.bestForPillars.find((item) => pillars.includes(item)) ||
          template.bestForPillars[0];
        selected.push({ template, pillar });
        used.add(template.id);
        if (selected.length >= 4) {
          break;
        }
      }
    }

    return selected.slice(0, 4);
  }

  private templateScore(
    template: PostTemplate,
    role: string,
    goal: string,
    hasProof: boolean
  ) {
    return (
      (template.bestForGoals.includes(goal as Goal) ? 8 : 0) +
      (template.bestForRoles.includes(role as Role) ? 5 : 0) +
      (template.proofRequirement === 'none' ? 2 : 0) +
      (template.proofRequirement === 'optional' ? 1 : 0) +
      (template.proofRequirement === 'recommended' && hasProof ? 1 : 0)
    );
  }

  private campaignTemplateScore(
    template: PostTemplate,
    role: string,
    goal: string,
    hasProof: boolean,
    selected: Array<{ template: PostTemplate; pillar: PillarCategory }>
  ) {
    return (
      this.templateScore(template, role, goal, hasProof) +
      this.diversityBonus(template, selected) -
      this.diversityPenalty(template, selected)
    );
  }

  private diversityBonus(
    template: PostTemplate,
    selected: Array<{ template: PostTemplate; pillar: PillarCategory }>
  ) {
    if (selected.length === 0) {
      return 0;
    }

    const usedIntents = new Set(
      selected.flatMap((item) => item.template.intents)
    );
    const addsNewIntent = template.intents.some(
      (intent) => !usedIntents.has(intent)
    );

    return addsNewIntent ? 3 : 0;
  }

  private diversityPenalty(
    template: PostTemplate,
    selected: Array<{ template: PostTemplate; pillar: PillarCategory }>
  ) {
    if (selected.length === 0) {
      return 0;
    }

    let penalty = 0;
    const usedArchetypes = new Set(
      selected.map((item) => item.template.archetype)
    );
    const usedPrimaryHookStyles = new Set(
      selected.map((item) => item.template.hookStyles[0]).filter(Boolean)
    );
    const usedHookStyles = new Set(
      selected.flatMap((item) => item.template.hookStyles)
    );
    const usedTensionPatterns = new Set(
      selected.map((item) => item.template.tensionPattern)
    );
    const usedOpeningPatterns = new Set(
      selected.map((item) => this.openingPattern(item.template))
    );
    const usedListLikeCount = selected.filter((item) =>
      this.isListLikeTemplate(item.template)
    ).length;

    if (usedArchetypes.has(template.archetype)) {
      penalty += 8;
    }

    if (
      template.hookStyles[0] &&
      usedPrimaryHookStyles.has(template.hookStyles[0])
    ) {
      penalty += 6;
    } else if (template.hookStyles.some((style) => usedHookStyles.has(style))) {
      penalty += 3;
    }

    if (
      template.tensionPattern !== 'none' &&
      usedTensionPatterns.has(template.tensionPattern)
    ) {
      penalty += 3;
    }

    if (usedOpeningPatterns.has(this.openingPattern(template))) {
      penalty += 7;
    }

    if (this.isListLikeTemplate(template) && usedListLikeCount >= 1) {
      penalty += 5;
    }

    return penalty;
  }

  private openingPattern(template: PostTemplate) {
    const firstLine = template.template
      .trim()
      .split('\n')
      .find((line) => line.trim())
      ?.trim()
      .toLowerCase()
      .replace(/[`"'“”]/g, '');

    if (!firstLine) {
      return 'empty';
    }

    if (firstLine.startsWith('before ')) return 'before';
    if (firstLine.startsWith('when ')) return 'when';
    if (firstLine.startsWith('if ')) return 'if';
    if (firstLine.startsWith('why ')) return 'why';
    if (firstLine.startsWith('how ')) return 'how';
    if (firstLine.includes('mistake')) return 'mistake';
    if (firstLine.includes('myth')) return 'myth';
    if (firstLine.includes('everyone')) return 'everyone';
    if (firstLine.includes('most people')) return 'most_people';

    return firstLine.split(/\s+/).slice(0, 3).join(' ');
  }

  private isListLikeTemplate(template: PostTemplate) {
    return (
      template.hookStyles.includes('list_led') ||
      /^\s*(?:1\.|- )/m.test(template.template)
    );
  }

  private hasProof(linkedinProfileContext: any, websiteProfile?: any) {
    return (
      (linkedinProfileContext?.credibilityPoints || []).length > 0 ||
      (websiteProfile?.proofPoints || []).length > 0
    );
  }

  private ctaStyleForGoal(template: PostTemplate, goal: string, role: string) {
    const ctaOptions = getCTAOptionsForGoalAndRole(goal as Goal, role as Role);

    return (
      template.ctaStyles.find((style) =>
        ctaOptions.some((cta) => cta.id === style)
      ) || template.ctaStyles[0]
    );
  }

  private compactLinkedinContext(context: any) {
    return {
      fullName: context?.fullName,
      headline: context?.headline,
      currentRole: context?.currentRole,
      professionalSummary: context?.professionalSummary,
      expertiseAreas: (context?.expertiseAreas || []).slice(0, 8),
      credibilityPoints: (context?.credibilityPoints || []).slice(0, 8),
      contentAngles: (context?.contentAngles || []).slice(0, 8),
      audienceSignals: (context?.audienceSignals || []).slice(0, 8),
    };
  }

  private cleanGeneratedContent(content: string) {
    const cleaned = content
      .trim()
      .replace(/\s*\u2014\s*/g, ', ')
      .replace(/\.{2,}/g, '.')
      .replace(/[ \t]{2,}/g, ' ');
    if (!cleaned || /\[[^\]]+\]/.test(cleaned)) {
      return '';
    }

    return cleaned;
  }
}
