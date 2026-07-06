import { IsIn } from 'class-validator';

export class BillingSubscribeDto {
  @IsIn(['MONTHLY'])
  period: 'MONTHLY';

  @IsIn(['ESSENTIAL', 'GROWTH'])
  billing: 'ESSENTIAL' | 'GROWTH';

  utm: string;

  dub: string;

  datafast_session_id: string;
  datafast_visitor_id: string;
}
