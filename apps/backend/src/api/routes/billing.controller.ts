import { Body, Controller, Get, HttpException, Param, Post } from '@nestjs/common';
import { SubscriptionService } from '@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { RazorpayService } from '@gitroom/nestjs-libraries/services/razorpay.service';
import { GetOrgFromRequest } from '@gitroom/nestjs-libraries/user/org.from.request';
import { Organization, User } from '@prisma/client';
import { BillingSubscribeDto } from '@gitroom/nestjs-libraries/dtos/billing/billing.subscribe.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetUserFromRequest } from '@gitroom/nestjs-libraries/user/user.from.request';
import { NotificationService } from '@gitroom/nestjs-libraries/database/prisma/notifications/notification.service';
import { Nowpayments } from '@gitroom/nestjs-libraries/crypto/nowpayments';
import {
  ActiveBillingPlan,
  isActiveBillingPlan,
  pricing,
} from '@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';

@ApiTags('Billing')
@Controller('/billing')
export class BillingController {
  constructor(
    private _subscriptionService: SubscriptionService,
    private _razorpayService: RazorpayService,
    private _notificationService: NotificationService,
    private _nowpayments: Nowpayments,
    private _integrationService: IntegrationService,
    private _organizationService: OrganizationService
  ) {}

  @Get('/check/:id')
  async checkId(
    @GetOrgFromRequest() org: Organization,
    @Param('id') body: string
  ) {
    return {
      status: await this._subscriptionService.checkSubscription(org.id, body),
    };
  }

  @Get('/check-discount')
  async checkDiscount(@GetOrgFromRequest() org: Organization) {
    return {
      offerCoupon: false,
    };
  }

  @Post('/apply-discount')
  async applyDiscount(@GetOrgFromRequest() org: Organization) {
    return;
  }

  @Post('/finish-trial')
  async finishTrial(@GetOrgFromRequest() org: Organization) {
    try {
      return;
    } catch (err) {}
    return {
      finish: true,
    };
  }

  @Get('/is-trial-finished')
  async isTrialFinished(@GetOrgFromRequest() org: Organization) {
    return {
      finished: !org.isTrailing,
    };
  }

  @Post('/embedded')
  embedded(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Body() body: BillingSubscribeDto
  ) {
    return this.subscribe(org, user, body);
  }

  @Post('/subscribe')
  async subscribe(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Body() body: BillingSubscribeDto
  ) {
    if (!isActiveBillingPlan(body.billing) || body.period !== 'MONTHLY') {
      throw new HttpException('Only Essential and Growth monthly plans are supported', 400);
    }

    await this.validatePlanUsageBeforeCheckout(org.id, body.billing);

    const subscription = await this._razorpayService.createMonthlySubscription(
      org.id,
      user.id,
      body.billing
    );
    return {
      subscriptionId: subscription.subscriptionId,
      keyId: this._razorpayService.getCheckoutKeyId(),
      amount: subscription.amount,
      currency: subscription.currency,
      name: 'FeedVector',
      description: `${body.billing === 'ESSENTIAL' ? 'Essential' : 'Growth'} Plan - $${pricing[body.billing].month_price}/month`,
    };
  }

  @Post('/verify')
  async verifyPayment(
    @GetOrgFromRequest() org: Organization,
    @Body()
    body: {
      paymentId: string;
      subscriptionId: string;
      signature: string;
    }
  ) {
    const isValid = this._razorpayService.verifyCheckoutSignature(
      body.paymentId,
      body.subscriptionId,
      body.signature
    );
    if (!isValid) {
      throw new HttpException('Invalid payment signature', 400);
    }
    await this._razorpayService.activateSubscription(
      org.id,
      body.subscriptionId
    );
    return { ok: true };
  }

  @Get('/')
  getCurrentBilling(@GetOrgFromRequest() org: Organization) {
    return this._subscriptionService.getSubscriptionByOrganizationId(org.id);
  }

  @Post('/cancel')
  async cancel(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Body() body: { feedback: string }
  ) {
    await this._notificationService.sendEmail(
      process.env.EMAIL_FROM_ADDRESS,
      'Subscription Cancelled',
      `Organization ${org.name} has cancelled their subscription because: ${body.feedback}`,
      user.email
    );

    const subscription =
      await this._subscriptionService.getSubscriptionByOrganizationId(org.id);
    if (!subscription?.identifier) {
      return { cancel_at: undefined };
    }
    const { cancelAt } = await this._razorpayService.cancelSubscription(
      org.id,
      subscription.identifier
    );
    return {
      cancel_at: cancelAt || undefined,
    };
  }

  @Post('/prorate')
  prorate(
    @GetOrgFromRequest() org: Organization,
    @Body() body: BillingSubscribeDto
  ) {
    return { price: 0 };
  }

  @Post('/lifetime')
  async lifetime(
    @GetOrgFromRequest() org: Organization,
    @Body() body: { code: string }
  ) {
    throw new HttpException('Lifetime deals are not supported with Razorpay', 400);
  }

  @Post('/add-subscription')
  async addSubscription(
    @Body() body: { subscription: string },
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization
  ) {
    if (!user.isSuperAdmin) {
      throw new Error('Unauthorized');
    }

    await this._subscriptionService.addSubscription(
      org.id,
      user.id,
      body.subscription
    );
  }

  @Get('/crypto')
  async crypto(@GetOrgFromRequest() org: Organization) {
    return this._nowpayments.createPaymentPage(org.id);
  }

  private async validatePlanUsageBeforeCheckout(
    orgId: string,
    billing: ActiveBillingPlan
  ) {
    const targetPricing = pricing[billing];
    const channelLimit = targetPricing.channel || 0;
    const teamMemberLimit = targetPricing.team_member_limit || 0;
    const integrations = await this._integrationService.getIntegrationsList(
      orgId
    );
    const activeChannels = integrations.filter(
      (integration) => !integration.disabled && !integration.inBetweenSteps
    ).length;
    const team = await this._organizationService.getTeam(orgId);
    const teamMembers = team?.users?.length || 0;
    const violations: string[] = [];

    if (channelLimit && activeChannels > channelLimit) {
      violations.push(
        `${billing === 'ESSENTIAL' ? 'Essential' : 'Growth'} allows ${channelLimit} ${
          channelLimit === 1 ? 'channel' : 'channels'
        }. You currently have ${activeChannels}. Please remove ${
          activeChannels - channelLimit
        } ${activeChannels - channelLimit === 1 ? 'channel' : 'channels'} before changing plans.`
      );
    }

    if (teamMemberLimit && teamMembers > teamMemberLimit) {
      violations.push(
        `${billing === 'ESSENTIAL' ? 'Essential' : 'Growth'} allows ${teamMemberLimit} team members including you. You currently have ${teamMembers}. Please remove ${
          teamMembers - teamMemberLimit
        } ${teamMembers - teamMemberLimit === 1 ? 'team member' : 'team members'} before changing plans.`
      );
    }

    if (violations.length) {
      throw new HttpException(
        {
          message: violations.join(' '),
          code: 'PLAN_LIMIT_EXCEEDED',
          activeChannels,
          channelLimit,
          teamMembers,
          teamMemberLimit,
        },
        406
      );
    }
  }
}
