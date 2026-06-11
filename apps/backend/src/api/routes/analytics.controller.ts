import { Controller, Get, HttpException, Param, Query } from "@nestjs/common"
import { Organization, User } from "@prisma/client"
import { GetOrgFromRequest } from "@gitroom/nestjs-libraries/user/org.from.request"
import { GetUserFromRequest } from "@gitroom/nestjs-libraries/user/user.from.request"
import { ApiTags } from "@nestjs/swagger"
import { IntegrationService } from "@gitroom/nestjs-libraries/database/prisma/integrations/integration.service"
import { PostsService } from "@gitroom/nestjs-libraries/database/prisma/posts/posts.service"

@ApiTags("Analytics")
@Controller("/analytics")
export class AnalyticsController {
  constructor(private _integrationService: IntegrationService, private _postsService: PostsService) {}

  @Get("/:integration")
  async getIntegration(@GetOrgFromRequest() org: Organization, @GetUserFromRequest() user: User, @Param("integration") integration: string, @Query("date") date: string) {
    const organization = org as Organization & {
      subscription?: { subscriptionTier?: string } | null
      isTrailing?: boolean
      createdAt?: Date
    }
    const trialEndsAt = organization.createdAt ? new Date(organization.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null
    const trialActive = !!organization.isTrailing && !!trialEndsAt && trialEndsAt.getTime() > Date.now()
    const tier = organization.subscription?.subscriptionTier || (!process.env.RAZORPAY_KEY_ID ? "ULTIMATE" : "FREE")
    const cacheTtlSeconds = tier === "FREE" && !trialActive ? 10 * 60 * 60 : undefined

    return this._integrationService.checkAnalytics(org, integration, date, false, user.timezone, cacheTtlSeconds)
  }

  @Get("/post/:postId")
  async getPostAnalytics(@GetOrgFromRequest() org: Organization, @Param("postId") postId: string, @Query("date") date: string) {
    return this._postsService.checkPostAnalytics(org.id, postId, +date)
  }
}
