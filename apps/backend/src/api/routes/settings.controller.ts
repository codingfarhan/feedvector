import { Body, Controller, Delete, Get, HttpException, Param, Post } from '@nestjs/common';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization } from '@prisma/client';
import { CheckPolicies } from '@gitroom/backend/services/auth/permissions/permissions.ability';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { AddTeamMemberDto } from '@gitroom/nestjs-libraries/dtos/settings/add.team.member.dto';
import { ShortlinkPreferenceDto } from '@gitroom/nestjs-libraries/dtos/settings/shortlink-preference.dto';
import { ContentProfileDto } from '@gitroom/nestjs-libraries/dtos/settings/content-profile.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizationActions, Sections } from '@gitroom/backend/services/auth/permissions/permission.exception.class';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { pricing } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';

@ApiTags('Settings')
@Controller('/settings')
export class SettingsController {
  constructor(
    private _organizationService: OrganizationService,
    private _integrationService: IntegrationService
  ) {}

  @Get('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async getTeam(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getTeam(org.id);
  }

  @Post('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async inviteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @Body() body: AddTeamMemberDto
  ) {
    const tier = (org as Organization & { subscription?: { subscriptionTier?: string } })?.subscription?.subscriptionTier || 'FREE';
    const teamMemberLimit = pricing[tier]?.team_member_limit;
    if (teamMemberLimit) {
      const team = await this._organizationService.getTeam(org.id);
      const totalMembers = team?.users?.length || 0;
      if (totalMembers >= teamMemberLimit) {
        throw new HttpException(
          `Your plan can include up to ${teamMemberLimit} team members. Remove a team member or upgrade your plan to invite more.`,
          406
        );
      }
    }

    return this._organizationService.inviteTeamMember(org.id, body);
  }

  @Delete('/team/:id')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  deleteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._organizationService.deleteTeamMember(org, id);
  }

  @Get('/shortlink')
  async getShortlinkPreference(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getShortlinkPreference(org.id);
  }

  @Post('/shortlink')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async updateShortlinkPreference(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ShortlinkPreferenceDto
  ) {
    return this._organizationService.updateShortlinkPreference(
      org.id,
      body.shortlink
    );
  }

  @Post('/content-profile')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async updateContentProfile(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ContentProfileDto
  ) {
    const role = body.role.trim();
    const audience = body.audience.trim();
    const goal = body.goal.trim();
    const profile = body.integrationId
      ? null
      : await this._organizationService.updateContentProfile(
          org.id,
          role,
          audience,
          goal
        );
    await this._integrationService.updateContentProfile(
      org.id,
      role,
      audience,
      goal,
      body.integrationId
    );

    return profile || { success: true };
  }
}
