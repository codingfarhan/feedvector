import { Controller, Get, HttpException, Param, Query } from "@nestjs/common"
import { Organization } from "@prisma/client"
import { GetOrgFromRequest } from "@gitroom/nestjs-libraries/user/org.from.request"
import { ApiTags } from "@nestjs/swagger"
import { IntegrationService } from "@gitroom/nestjs-libraries/database/prisma/integrations/integration.service"
import { PostsService } from "@gitroom/nestjs-libraries/database/prisma/posts/posts.service"

@ApiTags("Analytics")
@Controller("/analytics")
export class AnalyticsController {
  constructor(private _integrationService: IntegrationService, private _postsService: PostsService) {}

  @Get("/:integration")
  async getIntegration(@GetOrgFromRequest() org: Organization, @Param("integration") integration: string, @Query("date") date: string) {
    if (org.isTrailing) {
      throw new HttpException("Analytics not available during trial", 406)
    }
    return this._integrationService.checkAnalytics(org, integration, date)
  }

  @Get("/post/:postId")
  async getPostAnalytics(@GetOrgFromRequest() org: Organization, @Param("postId") postId: string, @Query("date") date: string) {
    if (org.isTrailing) {
      throw new HttpException("Analytics not available during trial", 406)
    }

    return this._postsService.checkPostAnalytics(org.id, postId, +date)
  }
}
