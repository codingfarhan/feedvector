import { Ability, AbilityBuilder, AbilityClass } from "@casl/ability"
import { Injectable } from "@nestjs/common"
import { pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"
import { SubscriptionService } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service"
import { PostsService } from "@gitroom/nestjs-libraries/database/prisma/posts/posts.service"
import { IntegrationService } from "@gitroom/nestjs-libraries/database/prisma/integrations/integration.service"
import dayjs from "dayjs"
import { WebhooksService } from "@gitroom/nestjs-libraries/database/prisma/webhooks/webhooks.service"
import { OrganizationService } from "@gitroom/nestjs-libraries/database/prisma/organizations/organization.service"
import { AuthorizationActions, Sections } from "./permission.exception.class"

export type AppAbility = Ability<[AuthorizationActions, Sections]>

@Injectable()
export class PermissionsService {
  constructor(
    private _subscriptionService: SubscriptionService,
    private _postsService: PostsService,
    private _integrationService: IntegrationService,
    private _webhooksService: WebhooksService,
    private _organizationService: OrganizationService,
  ) {}
  async getPackageOptions(orgId: string) {
    const organization = await this._organizationService.getOrgById(orgId)
    const subscription = await this._subscriptionService.getSubscriptionByOrganizationId(orgId)

    const tier = subscription?.subscriptionTier || (!process.env.RAZORPAY_KEY_ID ? "PRO" : "FREE")

    const trialEndsAt = organization?.createdAt ? dayjs(organization.createdAt).add(7, "day") : null
    const isTrialActive = !!organization?.isTrailing && !!trialEndsAt && dayjs().isBefore(trialEndsAt)

    const effectiveTier = isTrialActive ? "PRO" : tier
    const { channel, ...all } = pricing[effectiveTier]
    return {
      subscription,
      trialEndsAt: trialEndsAt?.toDate() || null,
      isTrialActive,
      options: {
        ...all,
        ...{ channel: channel },
      },
    }
  }

  async check(
    orgId: string,
    created_at: Date,
    permission: "USER" | "ADMIN" | "SUPERADMIN",
    requestedPermission: Array<[AuthorizationActions, Sections]>,
  ) {
    const { can, build } = new AbilityBuilder<Ability<[AuthorizationActions, Sections]>>(Ability as AbilityClass<AppAbility>)

    if (requestedPermission.length === 0 || !process.env.RAZORPAY_KEY_ID) {
      for (const [action, section] of requestedPermission) {
        can(action, section)
      }
      return build({
        detectSubjectType: (item) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          item.constructor,
      })
    }

    const { subscription, options, trialEndsAt, isTrialActive } = await this.getPackageOptions(orgId)

    if (!isTrialActive && trialEndsAt) {
      await this._organizationService.updateTrialStatus(orgId, false, false)
    }
    for (const [action, section] of requestedPermission) {
      // check for the amount of channels
      if (section === Sections.CHANNEL) {
        const totalChannels = (await this._integrationService.getIntegrationsList(orgId)).filter((f) => !f.refreshNeeded).length

        if ((options.channel && options.channel > totalChannels) || (subscription?.totalChannels || 0) > totalChannels) {
          can(action, section)
          continue
        }
      }

      if (section === Sections.WEBHOOKS) {
        const totalWebhooks = await this._webhooksService.getTotal(orgId)
        if (totalWebhooks < options.webhooks) {
          can(AuthorizationActions.Create, section)
          continue
        }
      }

      // check for posts per month
      if (section === Sections.POSTS_PER_MONTH) {
        const createdAt = (await this._subscriptionService.getSubscription(orgId))?.createdAt || created_at
        const totalMonthPast = Math.abs(dayjs(createdAt).diff(dayjs(), "month"))
        const checkFrom = dayjs(createdAt).add(totalMonthPast, "month")
        const count = await this._postsService.countPostsFromDay(orgId, checkFrom.toDate())

        if (count < options.posts_per_month) {
          can(action, section)
          continue
        }
      }

      if (section === Sections.TEAM_MEMBERS && options.team_members) {
        can(action, section)
        continue
      }

      if (section === Sections.ADMIN && ["ADMIN", "SUPERADMIN"].includes(permission)) {
        can(action, section)
        continue
      }

      if (section === Sections.COMMUNITY_FEATURES && options.community_features) {
        can(action, section)
        continue
      }

      if (section === Sections.FEATURED_BY_GITROOM && options.featured_by_gitroom) {
        can(action, section)
        continue
      }

      if (section === Sections.AI && options.ai) {
        can(action, section)
        continue
      }

      if (section === Sections.IMPORT_FROM_CHANNELS && options.import_from_channels) {
        can(action, section)
      }
    }

    return build({
      detectSubjectType: (item) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        item.constructor,
    })
  }
}
