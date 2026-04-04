import {
  Controller,
  HttpException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { RazorpayService } from '@gitroom/nestjs-libraries/services/razorpay.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Razorpay')
@Controller('/')
export class RazorpayController {
  constructor(private readonly _razorpayService: RazorpayService) {}

  @Post('/billing/webhook/razorpay')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = (req.headers as any)['x-razorpay-signature'];
    const rawBody =
      typeof req.rawBody === 'string'
        ? req.rawBody
        : Buffer.from(req.rawBody || '').toString();

    const isValid = this._razorpayService.verifyWebhookSignature(
      rawBody,
      signature
    );
    if (!isValid) {
      throw new HttpException('Invalid signature', 400);
    }

    const body =
      typeof req.body === 'object' ? req.body : JSON.parse(rawBody || '{}');

    return this._razorpayService.handleWebhook(body);
  }
}
