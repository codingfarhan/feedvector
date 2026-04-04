import { IsIn } from 'class-validator';

export class BillingSubscribeDto {
  @IsIn(['MONTHLY'])
  period: 'MONTHLY';

  @IsIn(['PRO'])
  billing: 'PRO';

  utm: string;

  dub: string;

  datafast_session_id: string;
  datafast_visitor_id: string;
}
