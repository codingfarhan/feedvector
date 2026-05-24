import { Controller, Get, Param, Post, Body, Headers, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { AuthService } from '@gitroom/helpers/auth/auth.service';
import { Response } from 'express';

@ApiTags('Email')
@Controller('/email')
export class EmailController {
  constructor(private _usersService: UsersService) {}

  @Get('/unsubscribe/:token')
  async unsubscribe(@Param('token') token: string, @Res() res: Response) {
    try {
      const payload = AuthService.verifyJWT(token) as any;
      if (!payload || payload.type !== 'lifecycle_unsubscribe' || !payload.id) {
        return res.status(400).send('Invalid unsubscribe link');
      }
      await this._usersService.setUnsubscribedAtIfNull(payload.id);
      return res
        .status(200)
        .send(
          '<html><body><h2>Unsubscribed</h2><p>You will no longer receive lifecycle emails.</p></body></html>'
        );
    } catch (err) {
      return res.status(400).send('Invalid unsubscribe link');
    }
  }

  @Post('/webhooks/resend')
  async resendWebhook(
    @Body() body: any,
    @Headers('resend-signature') _signature: string
  ) {
    // Note: signature validation is intentionally not enforced here because it depends on the
    // specific Resend webhook setup. If you add a secret, validate before trusting the payload.
    const eventType = body?.type || body?.event || body?.name;
    const email =
      body?.data?.to ||
      body?.data?.email ||
      body?.data?.recipient ||
      body?.recipient ||
      body?.email;

    if (!email || typeof email !== 'string') {
      return { ok: true };
    }

    const normalizedEvent = typeof eventType === 'string' ? eventType.toLowerCase() : '';

    if (normalizedEvent.includes('bounce')) {
      await this._usersService.setEmailBouncedAtByEmail(email);
    }
    if (
      normalizedEvent.includes('complaint') ||
      normalizedEvent.includes('spam') ||
      normalizedEvent.includes('suppression') ||
      normalizedEvent.includes('dropped')
    ) {
      await this._usersService.setEmailSuppressedAtByEmail(email);
    }

    return { ok: true };
  }
}
