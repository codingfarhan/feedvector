import { defineSignal } from '@temporalio/workflow';
import { ONBOARDING_PRODUCT_ACTIVATED_SIGNAL } from '@gitroom/nestjs-libraries/temporal/signals/onboarding.lifecycle';

export const onboardingProductActivatedSignal = defineSignal<[]>(
  ONBOARDING_PRODUCT_ACTIVATED_SIGNAL
);
