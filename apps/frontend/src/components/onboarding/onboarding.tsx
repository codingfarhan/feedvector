'use client';

import { FC, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { OnboardingModal } from '@gitroom/frontend/components/onboarding/onboarding.modal';
import { useFireEvents } from '@gitroom/helpers/utils/use.fire.events';

export const Onboarding: FC = () => {
  const query = useSearchParams();
  const modal = useModals();
  const router = useRouter();
  const modalOpen = useRef(false);
  const t = useT();
  const fireEvents = useFireEvents();

  const handleClose = useCallback(() => {
    fireEvents('onboarding_closed');
    modal.closeAll();
    router.push('/launches');
  }, [fireEvents, modal, router]);

  useEffect(() => {
    const onboarding = query.get('onboarding');
    if (!onboarding) {
      if (modalOpen.current) {
        modalOpen.current = false;
        modal.closeAll();
      }
      return;
    }
    if (modalOpen.current) {
      return;
    }
    modalOpen.current = true;
    fireEvents('onboarding_opened');
    modal.openModal({
      // title: t('onboarding', 'Welcome to FeedVector'),
      withCloseButton: true,
      closeOnEscape: false,
      removeLayout: true,
      askClose: true,
      fullScreen: true,
      onClose: handleClose,
      children: <OnboardingModal onClose={handleClose} />,
    });
  }, [query, handleClose, t]);
  
  return null;
};
