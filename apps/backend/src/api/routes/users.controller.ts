import {
  Body,
  Controller,
  Get,
  HttpException,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { GetUserFromRequest } from '@gitroom/nestjs-libraries/user/user.from.request';
import { Organization, User } from '@prisma/client';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Response, Request } from 'express';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { getCookieUrlFromDomain } from '@gitroom/helpers/subdomain/subdomain.management';
import { pricing } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { UserDetailDto } from '@gitroom/nestjs-libraries/dtos/users/user.details.dto';
import { EmailNotificationsDto } from '@gitroom/nestjs-libraries/dtos/users/email-notifications.dto';
import {
  LinkedinProfileOptimizerDto,
  OnboardingCompleteDto,
  OnboardingSuggestionDto,
  OnboardingWorkspaceSetupDto,
  RepurposePostDto,
  WeeklyCampaignGenerateDto,
  WeeklyCampaignRecommendationDto,
} from '@gitroom/nestjs-libraries/dtos/users/onboarding.goal.dto';
import { HttpForbiddenException } from '@gitroom/nestjs-libraries/services/exception.filter';
import { RealIP } from 'nestjs-real-ip';
import { UserAgent } from '@gitroom/nestjs-libraries/user/user.agent';
import { TrackEnum } from '@gitroom/nestjs-libraries/user/track.enum';
import { TrackService } from '@gitroom/nestjs-libraries/track/track.service';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import {
  AuthorizationActions,
  Sections,
} from '@gitroom/backend/services/auth/permissions/permission.exception.class';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { OnboardingEnrichmentService } from '@gitroom/nestjs-libraries/onboarding/onboarding.enrichment.service';
import { OnboardingPostSuggestionService } from '@gitroom/nestjs-libraries/onboarding/onboarding.post-suggestion.service';
import { LinkedinCommentOpportunityService } from '@gitroom/nestjs-libraries/onboarding/linkedin.comment-opportunity.service';

@ApiTags('User')
@Controller('/user')
export class UsersController {
  constructor(
    private _subscriptionService: SubscriptionService,
    private _authService: AuthService,
    private _orgService: OrganizationService,
    private _userService: UsersService,
    private _trackService: TrackService,
    private _integrationService: IntegrationService,
    private _onboardingEnrichmentService: OnboardingEnrichmentService,
    private _onboardingPostSuggestionService: OnboardingPostSuggestionService,
    private _linkedinCommentOpportunityService: LinkedinCommentOpportunityService
  ) {}
  @Get('/self')
  async getSelf(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() organization: Organization,
    @Req() req: Request
  ) {
    if (!organization) {
      throw new HttpForbiddenException();
    }

    const impersonate = req.cookies.impersonate || req.headers.impersonate;
    // @ts-ignore
    const trialEndsAt = organization?.createdAt
      ? new Date(organization.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000)
      : null;
    const trialActive =
      !!organization?.isTrailing &&
      !!trialEndsAt &&
      trialEndsAt.getTime() > Date.now();
    // @ts-ignore
    const role = organization?.users[0]?.role;
    const canCompleteOnboarding = role === 'SUPERADMIN' || role === 'ADMIN';
    const connectedIntegrations = (
      await this._integrationService.getIntegrationsList(organization.id)
    ).filter((integration) => !integration.inBetweenSteps);
    const onboardingState = await this._orgService.getOnboardingState(
      organization.id
    );
    const subscription = (
      organization as typeof organization & {
        subscription?: {
          totalChannels?: number;
          subscriptionTier?: string;
          isLifetime?: boolean;
        };
      }
    ).subscription;

    return {
      ...user,
      orgId: organization.id,
      // @ts-ignore
      totalChannels: !process.env.RAZORPAY_KEY_ID
        ? 10000
        : subscription?.totalChannels || pricing.FREE.channel,
      // @ts-ignore
      tier:
        subscription?.subscriptionTier ||
        (!process.env.RAZORPAY_KEY_ID ? 'ULTIMATE' : 'FREE'),
      // @ts-ignore
      role,
      // @ts-ignore
      isLifetime: !!subscription?.isLifetime,
      admin: !!user.isSuperAdmin,
      impersonate: !!impersonate,
      isTrailing: !!organization?.isTrailing,
      allowTrial: organization?.allowTrial,
      trialEndsAt,
      trialActive,
      streakSince: organization?.streakSince || null,
      onboardingGoal: onboardingState?.onboardingGoal || null,
      onboardingPersona: onboardingState?.onboardingPersona || null,
      onboardingPersonaOther: onboardingState?.onboardingPersonaOther || null,
      onboardingAudience: onboardingState?.onboardingAudience || null,
      onboardingCompletedAt: onboardingState?.onboardingCompletedAt || null,
      onboardingRequired:
        canCompleteOnboarding && !onboardingState?.onboardingCompletedAt,
      onboardingCanComplete: canCompleteOnboarding,
      onboardingHasIntegration: connectedIntegrations.length > 0,
      // @ts-ignore
      publicApi:
        role === 'SUPERADMIN' || role === 'ADMIN' ? organization?.apiKey : '',
    };
  }

  @Post('/onboarding/suggestions')
  async generateOnboardingSuggestions(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: OnboardingSuggestionDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );

    const onboardingRole = body.role.trim();
    const onboardingAudience = body.audience.trim();
    const onboardingGoal = body.goal.trim();
    const websiteUrl = body.websiteUrl?.trim();

    if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
      throw new HttpException('Please complete your positioning sentence', 400);
    }

    const storedOnboarding =
      selectedIntegration as typeof selectedIntegration & {
        linkedinProfileContext?: any;
        onboardingWebsiteUrl?: string | null;
        onboardingWebsiteProfile?: any;
        onboardingWebsitePages?: any;
        onboardingWebsiteScrapedAt?: Date | null;
      };
    let websiteContext:
      | {
          normalizedUrl: string;
          pages: any;
          profile: any;
        }
      | undefined;
    let reusedWebsiteContext = false;
    const normalizedWebsite = websiteUrl
      ? this._onboardingEnrichmentService.normalizeWebsiteUrl(websiteUrl)
      : undefined;

    const getWebsiteContext = async () => {
      if (!normalizedWebsite) {
        return undefined;
      }

      const canReuseWebsiteContext =
        storedOnboarding.onboardingWebsiteUrl ===
          normalizedWebsite.normalizedUrl &&
        !!storedOnboarding.onboardingWebsiteProfile;
      reusedWebsiteContext = canReuseWebsiteContext;

      return canReuseWebsiteContext
        ? {
            normalizedUrl: normalizedWebsite.normalizedUrl,
            pages: storedOnboarding.onboardingWebsitePages || [],
            profile: storedOnboarding.onboardingWebsiteProfile,
          }
        : await this._onboardingEnrichmentService.scrapeWebsite(websiteUrl);
    };

    const getLinkedinProfileContext = async () => {
      return (
        storedOnboarding.linkedinProfileContext ||
        (await this._onboardingEnrichmentService.enrichLinkedinProfile(
          selectedIntegration.profile
        ))
      );
    };

    const [resolvedWebsiteContext, linkedinProfileContext] = await Promise.all([
      getWebsiteContext(),
      getLinkedinProfileContext(),
    ]);
    websiteContext = resolvedWebsiteContext;
    const suggestions =
      await this._onboardingPostSuggestionService.generateSuggestions({
        role: onboardingRole,
        audience: onboardingAudience,
        goal: onboardingGoal,
        linkedinProfileContext,
        websiteProfile: websiteContext?.profile,
      });
    const contentPillars = suggestions.map((suggestion) => suggestion.pillar);

    await this._integrationService.updateOnboardingProfile(
      organization.id,
      selectedIntegration.id,
      {
        role: onboardingRole,
        audience: onboardingAudience,
        goal: onboardingGoal,
        websiteUrl: websiteContext?.normalizedUrl || websiteUrl || undefined,
        linkedinProfileContext,
        websiteProfile: websiteUrl ? websiteContext?.profile : null,
        websitePages: websiteUrl ? websiteContext?.pages : null,
        websiteScrapeStatus: websiteUrl ? 'success' : null,
        websiteScrapeError: null,
        websiteScrapedAt: websiteUrl
          ? reusedWebsiteContext
            ? storedOnboarding.onboardingWebsiteScrapedAt || new Date()
            : new Date()
          : null,
        contentPillars,
      }
    );

    return {
      pillars: contentPillars,
      suggestions,
    };
  }

  @Post('/onboarding')
  async completeOnboarding(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: OnboardingCompleteDto
  ) {
    await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );

    const onboardingRole = body.role.trim();
    const onboardingAudience = body.audience.trim();
    const onboardingGoal = body.goal.trim();

    if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
      throw new HttpException('Please complete your positioning sentence', 400);
    }

    const reviewedSuggestions = body.reviewedSuggestions || [];
    if (
      reviewedSuggestions.length < 4 ||
      reviewedSuggestions.some((suggestion) => !suggestion.action)
    ) {
      throw new HttpException(
        'Please review all post suggestions before completing onboarding',
        400
      );
    }

    return this._orgService.completeOnboarding(
      organization.id,
      onboardingGoal,
      onboardingRole,
      onboardingAudience
    );
  }

  @Post('/onboarding/setup-workspace')
  async setupOnboardingWorkspace(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: OnboardingWorkspaceSetupDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );
    const onboardingState = await this._orgService.getOnboardingState(
      organization.id
    );
    const onboardingRole = String(
      onboardingState?.onboardingPersonaOther ||
        onboardingState?.onboardingPersona ||
        ''
    ).trim();
    const onboardingAudience = String(
      onboardingState?.onboardingAudience || ''
    ).trim();
    const onboardingGoal = String(onboardingState?.onboardingGoal || '').trim();

    if (!onboardingState?.onboardingCompletedAt) {
      throw new HttpException('Please complete onboarding first', 400);
    }

    if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
      throw new HttpException(
        'Your onboarding context is incomplete. Please complete onboarding again.',
        400
      );
    }

    const currentContext = selectedIntegration as typeof selectedIntegration & {
      linkedinProfileContext?: any;
      onboardingRole?: string | null;
      onboardingAudience?: string | null;
      onboardingGoal?: string | null;
      onboardingWebsiteUrl?: string | null;
      onboardingWebsiteProfile?: any;
      onboardingWebsitePages?: any;
      onboardingWebsiteScrapeStatus?: string | null;
      onboardingWebsiteScrapeError?: string | null;
      onboardingWebsiteScrapedAt?: Date | null;
      onboardingContentPillars?: any;
    };

    const hasCurrentContext =
      !!currentContext.linkedinProfileContext &&
      !!currentContext.onboardingRole &&
      !!currentContext.onboardingAudience &&
      !!currentContext.onboardingGoal;

    if (hasCurrentContext && !body.refreshLinkedin && !body.refreshWebsite) {
      return {
        ready: true,
        integrationId: selectedIntegration.id,
        reusedExistingContext: true,
      };
    }

    const previousContext =
      (await this._integrationService.getLatestOnboardingProfile(
        organization.id,
        selectedIntegration.id,
        selectedIntegration.rootInternalId ||
          selectedIntegration.internalId.split('_').pop()
      )) as
        | {
            onboardingRole?: string | null;
            onboardingAudience?: string | null;
            onboardingGoal?: string | null;
            onboardingWebsiteUrl?: string | null;
            onboardingWebsiteProfile?: any;
            onboardingWebsitePages?: any;
            onboardingWebsiteScrapeStatus?: string | null;
            onboardingWebsiteScrapeError?: string | null;
            onboardingWebsiteScrapedAt?: Date | null;
            onboardingContentPillars?: any;
          }
        | undefined;

    const linkedinProfileContext =
      !body.refreshLinkedin && currentContext.linkedinProfileContext
        ? currentContext.linkedinProfileContext
        : await this._onboardingEnrichmentService.enrichLinkedinProfile(
            selectedIntegration.profile
          );
    const previousPillars =
      previousContext?.onboardingRole === onboardingRole &&
      previousContext?.onboardingGoal === onboardingGoal &&
      Array.isArray(previousContext?.onboardingContentPillars)
        ? previousContext.onboardingContentPillars
        : undefined;
    const contentPillars: string[] =
      previousPillars && previousPillars.length > 0
        ? previousPillars
        : this._onboardingPostSuggestionService.assignPillars(
            onboardingRole,
            onboardingGoal,
            true
          );
    const existingWebsiteUrl =
      currentContext.onboardingWebsiteUrl ||
      previousContext?.onboardingWebsiteUrl ||
      undefined;
    const refreshedWebsiteContext =
      body.refreshWebsite && existingWebsiteUrl
        ? await this._onboardingEnrichmentService.scrapeWebsite(
            existingWebsiteUrl
          )
        : undefined;
    const websiteUrl =
      refreshedWebsiteContext?.normalizedUrl || existingWebsiteUrl;
    const websiteProfile =
      refreshedWebsiteContext?.profile ||
      currentContext.onboardingWebsiteProfile ||
      previousContext?.onboardingWebsiteProfile ||
      null;
    const websitePages =
      refreshedWebsiteContext?.pages ||
      currentContext.onboardingWebsitePages ||
      previousContext?.onboardingWebsitePages ||
      null;
    const websiteScrapeStatus = websiteUrl
      ? refreshedWebsiteContext
        ? 'success'
        : currentContext.onboardingWebsiteScrapeStatus ||
          previousContext?.onboardingWebsiteScrapeStatus ||
          'success'
      : null;
    const websiteScrapeError = websiteUrl
      ? refreshedWebsiteContext
        ? null
        : currentContext.onboardingWebsiteScrapeError ||
          previousContext?.onboardingWebsiteScrapeError ||
          null
      : null;
    const websiteScrapedAt = websiteUrl
      ? refreshedWebsiteContext
        ? new Date()
        : currentContext.onboardingWebsiteScrapedAt ||
          previousContext?.onboardingWebsiteScrapedAt ||
          null
      : null;

    await this._integrationService.updateOnboardingProfile(
      organization.id,
      selectedIntegration.id,
      {
        role: onboardingRole,
        audience: onboardingAudience,
        goal: onboardingGoal,
        websiteUrl,
        linkedinProfileContext,
        websiteProfile,
        websitePages,
        websiteScrapeStatus,
        websiteScrapeError,
        websiteScrapedAt,
        contentPillars,
      }
    );

    return {
      ready: true,
      integrationId: selectedIntegration.id,
      reusedWebsiteContext: !!websiteProfile,
      contentPillars,
    };
  }

  @Post('/repurpose-post')
  async generateRepurposedPost(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: RepurposePostDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );
    const role = body.role.trim();
    const audience = body.audience.trim();
    const goal = body.goal.trim();
    const allowedPillars = (body.pillars || [])
      .map((pillar) => pillar.trim())
      .filter(Boolean);

    if (!role || !audience || !goal) {
      throw new HttpException('Please complete your positioning first', 400);
    }

    const storedContext =
      selectedIntegration as typeof selectedIntegration & {
        linkedinProfileContext?: any;
        onboardingWebsiteUrl?: string | null;
        onboardingWebsiteProfile?: any;
        onboardingWebsitePages?: any;
      };
    const linkedinProfileContext =
      storedContext.linkedinProfileContext ||
      (body.sourceType === 'profile'
        ? await this._onboardingEnrichmentService.enrichLinkedinProfile(
            selectedIntegration.profile
          )
        : undefined);

    let websiteContext:
      | {
          normalizedUrl: string;
          pages: any;
          profile: any;
        }
      | undefined;

    if (body.sourceType === 'website') {
      const websiteUrl = body.websiteUrl?.trim();
      if (!websiteUrl) {
        throw new HttpException('Please enter a website URL', 400);
      }

      const normalizedWebsite =
        this._onboardingEnrichmentService.normalizeWebsiteUrl(websiteUrl);
      const canReuseWebsiteContext =
        storedContext.onboardingWebsiteUrl === normalizedWebsite.normalizedUrl &&
        !!storedContext.onboardingWebsiteProfile;

      websiteContext = canReuseWebsiteContext
        ? {
            normalizedUrl: normalizedWebsite.normalizedUrl,
            pages: storedContext.onboardingWebsitePages || [],
            profile: storedContext.onboardingWebsiteProfile,
          }
        : await this._onboardingEnrichmentService.scrapeWebsite(websiteUrl);
    }

    if (
      body.sourceType === 'past_posts' &&
      !(body.selectedPosts || []).some((post) => post.label?.trim())
    ) {
      throw new HttpException('Select at least one past post', 400);
    }

    const generated =
      await this._onboardingPostSuggestionService.generateRepurposedPost({
        sourceType: body.sourceType,
        role,
        audience,
        goal,
        allowedPillars,
        additionalContext: body.additionalContext?.trim(),
        visualContext: body.visualContext?.trim(),
        websiteProfile: websiteContext?.profile,
        websitePages: websiteContext?.pages,
        selectedPosts: (body.selectedPosts || [])
          .filter((post) => post.label?.trim())
          .slice(0, 4),
        linkedinProfileContext,
        profileFocus: body.profileFocus?.trim(),
      });

    return generated;
  }

  @Post('/weekly-campaign/recommendations')
  async recommendWeeklyCampaignTemplates(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: WeeklyCampaignRecommendationDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );
    const role = body.role.trim();
    const audience = body.audience.trim();
    const goal = body.goal.trim();

    if (!role || !audience || !goal) {
      throw new HttpException('Please complete your positioning first', 400);
    }

    const storedContext =
      selectedIntegration as typeof selectedIntegration & {
        linkedinProfileContext?: any;
        onboardingWebsiteProfile?: any;
      };
    const linkedinProfileContext =
      storedContext.linkedinProfileContext ||
      (await this._onboardingEnrichmentService.enrichLinkedinProfile(
        selectedIntegration.profile
      ));

    return this._onboardingPostSuggestionService.recommendWeeklyCampaignTemplates(
      {
        role,
        audience,
        goal,
        count: body.count || 1,
        linkedinProfileContext,
        websiteProfile: storedContext.onboardingWebsiteProfile,
        pillar: body.pillar?.trim(),
        usedTemplateIds: body.usedTemplateIds || [],
        excludedTemplateIds: body.excludedTemplateIds || [],
        missingFields: body.missingFields || [],
        avoidRequiredProof: !!body.avoidRequiredProof,
        analyticsHints: body.analyticsHints,
      }
    );
  }

  @Post('/weekly-campaign/generate')
  async generateWeeklyCampaignPosts(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: WeeklyCampaignGenerateDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );
    const role = body.role.trim();
    const audience = body.audience.trim();
    const goal = body.goal.trim();

    if (!role || !audience || !goal) {
      throw new HttpException('Please complete your positioning first', 400);
    }

    if (!body.templates?.length) {
      throw new HttpException('Choose at least one template', 400);
    }

    const storedContext =
      selectedIntegration as typeof selectedIntegration & {
        linkedinProfileContext?: any;
        onboardingWebsiteProfile?: any;
      };
    const linkedinProfileContext =
      storedContext.linkedinProfileContext ||
      (await this._onboardingEnrichmentService.enrichLinkedinProfile(
        selectedIntegration.profile
      ));

    return {
      posts: await this._onboardingPostSuggestionService.generateWeeklyCampaignPosts(
        {
          role,
          audience,
          goal,
          linkedinProfileContext,
          websiteProfile: storedContext.onboardingWebsiteProfile,
          analyticsHints: body.analyticsHints,
          templates: body.templates,
        }
      ),
    };
  }

  @Post('/linkedin-profile-optimizer')
  async optimizeLinkedinProfile(
    @GetOrgFromRequest() organization: Organization,
    @Body() body: LinkedinProfileOptimizerDto
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      body.integrationId
    );
    const role = body.role.trim();
    const audience = body.audience.trim();
    const goal = body.goal.trim();

    if (!role || !audience || !goal) {
      throw new HttpException('Please complete your positioning first', 400);
    }

    const storedContext =
      selectedIntegration as typeof selectedIntegration & {
        linkedinProfileContext?: any;
      };

    const shouldRefreshProfileContext =
      !storedContext.linkedinProfileContext?.headline ||
      !storedContext.linkedinProfileContext?.about;

    const linkedinProfileContext =
      shouldRefreshProfileContext || !storedContext.linkedinProfileContext
        ? await this._onboardingEnrichmentService.enrichLinkedinProfile(
            selectedIntegration.profile
          )
        : storedContext.linkedinProfileContext;

    return this._onboardingPostSuggestionService.optimizeLinkedinProfile({
      role,
      audience,
      goal,
      linkedinProfileContext,
    });
  }

  @Get('/linkedin-comment-opportunities')
  async getLinkedinCommentOpportunities(
    @GetOrgFromRequest() organization: Organization,
    @Query('integrationId') integrationId: string,
    @Query('refresh') refresh?: string
  ) {
    const selectedIntegration = await this.getOnboardingLinkedInIntegration(
      organization,
      integrationId
    );
    const onboardingState = await this._orgService.getOnboardingState(
      organization.id
    );

    const storedContext =
      selectedIntegration as typeof selectedIntegration & {
        onboardingRole?: string | null;
        onboardingAudience?: string | null;
        onboardingGoal?: string | null;
        onboardingContentPillars?: any;
        linkedinProfileContext?: any;
        onboardingWebsiteProfile?: any;
      };

    const role = String(
      storedContext.onboardingRole ||
        onboardingState?.onboardingPersonaOther ||
        onboardingState?.onboardingPersona ||
        ''
    ).trim();
    const audience = String(
      storedContext.onboardingAudience || onboardingState?.onboardingAudience || ''
    ).trim();
    const goal = String(
      storedContext.onboardingGoal || onboardingState?.onboardingGoal || ''
    ).trim();

    if (!role || !audience || !goal) {
      throw new HttpException(
        'Complete your LinkedIn content profile before using this page',
        400
      );
    }

    const linkedinProfileContext =
      storedContext.linkedinProfileContext ||
      (await this._onboardingEnrichmentService.enrichLinkedinProfile(
        selectedIntegration.profile
      ));

    return this._linkedinCommentOpportunityService.getRecommendations({
      role,
      audience,
      goal,
      pillars: Array.isArray(storedContext.onboardingContentPillars)
        ? storedContext.onboardingContentPillars
        : undefined,
      linkedinProfileSlug: selectedIntegration.profile,
      linkedinProfileContext,
      websiteProfile: storedContext.onboardingWebsiteProfile,
      refresh: refresh === '1' || refresh === 'true',
    });
  }

  private async getOnboardingLinkedInIntegration(
    organization: Organization,
    integrationId: string
  ) {
    if (!organization) {
      throw new HttpForbiddenException();
    }

    // @ts-ignore
    const role = organization?.users[0]?.role;
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw new HttpForbiddenException();
    }

    const connectedIntegrations = (
      await this._integrationService.getIntegrationsList(organization.id)
    ).filter((integration) => !integration.inBetweenSteps);

    const selectedIntegration = connectedIntegrations.find(
      (integration) =>
        integration.id === integrationId &&
        integration.providerIdentifier === 'linkedin'
    );

    if (!selectedIntegration) {
      throw new HttpException(
        'Connect your personal LinkedIn account first',
        400
      );
    }

    return selectedIntegration;
  }

  @Get('/personal')
  async getPersonalInformation(@GetUserFromRequest() user: User) {
    return this._userService.getPersonal(user.id);
  }

  @Get('/impersonate')
  async getImpersonate(
    @GetUserFromRequest() user: User,
    @Query('name') name: string
  ) {
    if (!user.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }

    return this._userService.getImpersonateUser(name);
  }

  @Post('/impersonate')
  async setImpersonate(
    @GetUserFromRequest() user: User,
    @Body('id') id: string,
    @Res({ passthrough: true }) response: Response
  ) {
    if (!user.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }

    response.cookie('impersonate', id, {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    if (process.env.NOT_SECURED) {
      response.header('impersonate', id);
    }
  }

  @Post('/personal')
  async changePersonal(
    @GetUserFromRequest() user: User,
    @Body() body: UserDetailDto
  ) {
    return this._userService.changePersonal(user.id, body);
  }

  @Get('/email-notifications')
  async getEmailNotifications(@GetUserFromRequest() user: User) {
    return this._userService.getEmailNotifications(user.id);
  }

  @Post('/email-notifications')
  async updateEmailNotifications(
    @GetUserFromRequest() user: User,
    @Body() body: EmailNotificationsDto
  ) {
    return this._userService.updateEmailNotifications(user.id, body);
  }

  @Post('/api-key/rotate')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async rotateApiKey(@GetOrgFromRequest() organization: Organization) {
    return this._orgService.updateApiKey(organization.id);
  }

  @Get('/subscription')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async getSubscription(@GetOrgFromRequest() organization: Organization) {
    const subscription =
      await this._subscriptionService.getSubscriptionByOrganizationId(
        organization.id
      );

    return subscription ? { subscription } : { subscription: undefined };
  }

  @Get('/subscription/tiers')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async tiers() {
    return { pricing };
  }

  @Post('/join-org')
  async joinOrg(
    @GetUserFromRequest() user: User,
    @Body('org') org: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const getOrgFromCookie = this._authService.getOrgFromCookie(org);

    if (!getOrgFromCookie) {
      return response.status(200).json({ id: null });
    }

    const addedOrg = await this._orgService.addUserToOrg(
      user.id,
      getOrgFromCookie.id,
      getOrgFromCookie.orgId,
      getOrgFromCookie.role
    );

    response.status(200).json({
      id: typeof addedOrg !== 'boolean' ? addedOrg.organizationId : null,
    });
  }

  @Get('/organizations')
  async getOrgs(@GetUserFromRequest() user: User) {
    return (await this._orgService.getOrgsByUserId(user.id)).filter(
      (f) => !f.users[0].disabled
    );
  }

  @Post('/change-org')
  changeOrg(
    @Body('id') id: string,
    @Res({ passthrough: true }) response: Response
  ) {
    response.cookie('showorg', id, {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    if (process.env.NOT_SECURED) {
      response.header('showorg', id);
    }

    response.status(200).send();
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.header('logout', 'true');
    response.cookie('auth', '', {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      maxAge: -1,
      expires: new Date(0),
    });

    response.cookie('showorg', '', {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      maxAge: -1,
      expires: new Date(0),
    });

    response.cookie('impersonate', '', {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      maxAge: -1,
      expires: new Date(0),
    });

    response.status(200).send();
  }

  @Post('/t')
  async trackEvent(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @GetUserFromRequest() user: User,
    @RealIP() ip: string,
    @UserAgent() userAgent: string,
    @Body()
    body: { tt: TrackEnum; fbclid: string; additional: Record<string, any> }
  ) {
    const uniqueId = req?.cookies?.track || makeId(10);
    const fbclid = req?.cookies?.fbclid || body.fbclid;
    await this._trackService.track(
      uniqueId,
      ip,
      userAgent,
      body.tt,
      body.additional,
      fbclid,
      user
    );
    if (!req.cookies.track) {
      res.cookie('track', uniqueId, {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        ...(!process.env.NOT_SECURED
          ? {
              secure: true,
              httpOnly: true,
              sameSite: 'none',
            }
          : {}),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }

    res.status(200).json({
      track: uniqueId,
    });
  }
}
