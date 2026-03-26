import { PricingComponent } from '@gitroom/frontend/components/billing/pricing.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@gitroom/helpers/utils/is.general.server.side';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'FeedVector' : 'Gitroom'} Pricing`,
  description: '',
};

export default async function PricingPage() {
  return <PricingComponent />;
}
