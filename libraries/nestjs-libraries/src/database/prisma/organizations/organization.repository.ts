import { PrismaRepository } from '@gitroom/nestjs-libraries/database/prisma/prisma.service';
import { Role, ShortLinkPreference, SubscriptionTier } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { CreateOrgUserDto } from '@gitroom/nestjs-libraries/dtos/auth/create.org.user.dto';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';

@Injectable()
export class OrganizationRepository {
  constructor(
    private _organization: PrismaRepository<'organization'>,
    private _userOrg: PrismaRepository<'userOrganization'>,
    private _user: PrismaRepository<'user'>
  ) {}

  createMaxUser(id: string, name: string, saasName: string, email: string) {
    return this._organization.model.organization.create({
      select: {
        id: true,
        apiKey: true,
      },
      data: {
        name: name ? `${name}###${id}` : `Unnamed User###${id}`,
        apiKey: AuthService.fixedEncryption(makeId(20)),
        isTrailing: false,
        subscription: {
          create: {
            totalChannels: 1000000,
            subscriptionTier: 'ULTIMATE',
            isLifetime: true,
            period: 'YEARLY',
          },
        },
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: true,
                email: email
                  ? email.split('@').join(`+${saasName}@`)
                  : `${saasName}+` + makeId(10) + '@postiz.com',
                name: name ? `${name}###${id}` : `Unnamed User###${id}`,
                providerName: 'LOCAL',
                password: AuthService.hashPassword(makeId(500)),
                timezone: 0,
              },
            },
          },
        },
      },
    });
  }

  getOrgByApiKey(api: string) {
    return this._organization.model.organization.findFirst({
      where: {
        apiKey: api,
      },
      include: {
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
            createdAt: true,
          },
        },
      },
    });
  }

  getCount() {
    return this._organization.model.organization.count();
  }

  getUserOrg(id: string) {
    return this._userOrg.model.userOrganization.findFirst({
      where: {
        id,
      },
      select: {
        user: true,
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            apiKey: true,
            paymentId: true,
            streakSince: true,
            createdAt: true,
            updatedAt: true,
            allowTrial: true,
            isTrailing: true,
            shortlink: true,
            users: {
              select: {
                id: true,
                disabled: true,
                role: true,
                userId: true,
              },
            },
            subscription: {
              select: {
                subscriptionTier: true,
                totalChannels: true,
                isLifetime: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });
  }

  getImpersonateUser(name: string) {
    return this._userOrg.model.userOrganization.findMany({
      where: {
        user: {
          OR: [
            {
              name: {
                contains: name,
              },
            },
            {
              email: {
                contains: name,
              },
            },
            {
              id: {
                contains: name,
              },
            },
          ],
        },
      },
      select: {
        id: true,
        organization: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  updateApiKey(orgId: string) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        apiKey: AuthService.fixedEncryption(makeId(20)),
      },
    });
  }

  async getOrgsByUserId(userId: string) {
    return this._organization.model.organization.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        apiKey: true,
        paymentId: true,
        streakSince: true,
        createdAt: true,
        updatedAt: true,
        allowTrial: true,
        isTrailing: true,
        shortlink: true,
        users: {
          where: {
            userId,
          },
          select: {
            disabled: true,
            role: true,
          },
        },
        subscription: {
          select: {
            subscriptionTier: true,
            totalChannels: true,
            isLifetime: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getOnboardingState(orgId: string) {
    try {
      return await this._organization.model.organization.findUnique({
        where: {
          id: orgId,
        },
        select: {
          onboardingGoal: true,
          onboardingPersona: true,
          onboardingPersonaOther: true,
          onboardingAudience: true,
          onboardingCompletedAt: true,
        } as any,
      });
    } catch (err) {
      return null;
    }
  }

  async getOrgById(id: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id,
      },
      include: {
        subscription: {
          select: {
            totalChannels: true,
            subscriptionTier: true,
            deletedAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  async getOnboardingLifecycleState(orgId: string) {
    return (this._organization.model.organization as any).findUnique({
      where: {
        id: orgId,
      },
      select: {
        id: true,
        createdAt: true,
        isTrailing: true,
        subscription: {
          select: {
            subscriptionTier: true,
            deletedAt: true,
            createdAt: true,
          },
        },
        users: {
          where: {
            role: Role.SUPERADMIN,
            disabled: false,
          },
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                activated: true,
                productActivatedAt: true,
                unsubscribedAt: true,
                emailBouncedAt: true,
                emailSuppressedAt: true,
              },
            },
          },
          take: 1,
        },
      },
    });
  }

  async addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: 'USER' | 'ADMIN'
  ) {
    const checkIfInviteExists = await this._user.model.user.findFirst({
      where: {
        inviteId: id,
      },
    });

    if (checkIfInviteExists) {
      return false;
    }

    const checkForSubscription =
      await this._organization.model.organization.findFirst({
        where: {
          id: orgId,
        },
        select: {
          subscription: true,
        },
      });

    if (
      process.env.STRIPE_PUBLISHABLE_KEY &&
      checkForSubscription?.subscription?.subscriptionTier ===
        SubscriptionTier.STANDARD
    ) {
      return false;
    }

    const create = await this._userOrg.model.userOrganization.create({
      data: {
        role,
        userId,
        organizationId: orgId,
      },
    });

    await this._user.model.user.update({
      where: {
        id: userId,
      },
      data: {
        inviteId: id,
      },
    });

    return create;
  }

  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, 'providerToken'> & { providerId?: string },
    hasEmail: boolean,
    ip: string,
    userAgent: string
  ) {
    return this._organization.model.organization.create({
      data: {
        name: body.company,
        apiKey: AuthService.fixedEncryption(makeId(20)),
        allowTrial: true,
        isTrailing: true,
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                activated: body.provider !== 'LOCAL' || !hasEmail,
                email: body.email,
                password: body.password
                  ? AuthService.hashPassword(body.password)
                  : '',
                providerName: body.provider,
                providerId: body.providerId || '',
                timezone: 0,
                ip,
                agent: userAgent,
              },
            },
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });
  }

  updateTrialStatus(orgId: string, isTrailing: boolean, allowTrial: boolean) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        isTrailing,
        allowTrial,
      },
    });
  }

  async resetTrialCreatedAtForOwnedTrialOrgs(userId: string) {
    const orgs = await this._organization.model.organization.findMany({
      where: {
        allowTrial: true,
        isTrailing: true,
        subscription: null,
        users: {
          some: {
            userId,
            role: Role.SUPERADMIN,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!orgs.length) {
      return [];
    }

    const orgIds = orgs.map((org) => org.id);
    await this._organization.model.organization.updateMany({
      where: {
        id: {
          in: orgIds,
        },
      },
      data: {
        createdAt: new Date(),
      },
    });

    return orgIds;
  }

  getOrgByCustomerId(customerId: string) {
    return this._organization.model.organization.findFirst({
      where: {
        paymentId: customerId,
      },
    });
  }

  async setStreak(organizationId: string, type: 'start' | 'end') {
    try {
      await this._organization.model.organization.update({
        where: {
          id: organizationId,
          ...(type === 'start'
            ? {
                streakSince: null,
              }
            : {}),
        },
        data: {
          ...(type === 'end' ? { streakSince: null } : {}),
          ...(type === 'start' ? { streakSince: new Date() } : {}),
        },
      });
    } catch (err) {}
  }

  async getTeam(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            role: true,
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
                sendStreakEmails: true,
              },
            },
          },
        },
      },
    });
  }

  getAllUsersOrgs(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        users: {
          select: {
            user: {
              select: {
                email: true,
                id: true,
                sendSuccessEmails: true,
                sendFailureEmails: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteTeamMember(orgId: string, userId: string) {
    return this._userOrg.model.userOrganization.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
  }

  disableOrEnableNonSuperAdminUsers(orgId: string, disable: boolean) {
    return this._userOrg.model.userOrganization.updateMany({
      where: {
        organizationId: orgId,
        role: {
          not: Role.SUPERADMIN,
        },
      },
      data: {
        disabled: disable,
      },
    });
  }

  getShortlinkPreference(orgId: string) {
    return this._organization.model.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        shortlink: true,
      },
    });
  }

  updateShortlinkPreference(orgId: string, shortlink: ShortLinkPreference) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        shortlink,
      },
    });
  }

  completeOnboarding(
    orgId: string,
    goal: string,
    persona: string,
    audience?: string,
    personaOther?: string
  ) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        onboardingGoal: goal,
        onboardingPersona: persona,
        onboardingPersonaOther: persona === 'other' ? personaOther : null,
        onboardingAudience: audience || null,
        onboardingCompletedAt: new Date(),
      } as any,
      select: {
        onboardingGoal: true,
        onboardingPersona: true,
        onboardingPersonaOther: true,
        onboardingAudience: true,
        onboardingCompletedAt: true,
      } as any,
    });
  }

  updateContentProfile(
    orgId: string,
    role: string,
    audience: string,
    goal: string
  ) {
    return this._organization.model.organization.update({
      where: {
        id: orgId,
      },
      data: {
        onboardingGoal: goal,
        onboardingPersona: role,
        onboardingPersonaOther: null,
        onboardingAudience: audience,
      } as any,
      select: {
        onboardingGoal: true,
        onboardingPersona: true,
        onboardingPersonaOther: true,
        onboardingAudience: true,
        onboardingCompletedAt: true,
      } as any,
    });
  }

  async getOrganizationOwnerUserId(organizationId: string) {
    const org = await this._organization.model.organization.findUnique({
      where: {
        id: organizationId,
      },
      select: {
        users: {
          where: {
            role: Role.SUPERADMIN,
            disabled: false,
          },
          select: {
            userId: true,
          },
          take: 1,
        },
      },
    });

    return org?.users?.[0]?.userId || null;
  }
}
