'use client';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR, { useSWRConfig } from 'swr';
import clsx from 'clsx';
import Image from 'next/image';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { useFireEvents } from '@gitroom/helpers/utils/use.fire.events';

interface OnboardingModalProps {
  onClose: () => void;
}

const roleOptions = [
  'Founder',
  'Agency owner',
  'Consultant',
  'Freelancer',
  'Coach',
  'Creator',
  'Marketer',
  'Job seeker / career professional',
];
const audienceOptions = [
  'Founders',
  'Business owners',
  'Marketers',
  'Sales professionals',
  'Recruiters / hiring managers',
  'Developers / technical people',
  'Creators',
  'Consultants / freelancers',
  'Potential clients',
  'Industry peers',
];
const goalOptions = [
  'Get inbound leads',
  'Build authority',
  'Grow my audience',
  'Promote my product/service',
  'Get job opportunities',
  'Build network',
  'Recruit / hire talent',
];
const websiteUrlPattern =
  /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i;

type OnboardingStep = 'channels' | 'positioning' | 'website' | 'loading';

export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const fetch = useFetch();
  const toaster = useToaster();
  const { mutate } = useSWRConfig();
  const [step, setStep] = useState<OnboardingStep>('channels');
  const [role, setRole] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const loadIntegrations = useCallback(async (path: string) => {
    const list = (await (await fetch(path)).json()).integrations;
    return list;
  }, []);

  const { data: integrations = [] } = useSWR(
    '/integrations/list',
    loadIntegrations,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      fallbackData: [],
    }
  );

  const connectedLinkedIn = useMemo(() => {
    return integrations.find(
      (integration: any) =>
        integration.identifier === 'linkedin' && !integration.inBetweenSteps
    );
  }, [integrations]);

  useEffect(() => {
    if (connectedLinkedIn && step === 'channels') {
      setStep('positioning');
    }
  }, [connectedLinkedIn, step]);

  const completeOnboarding = useCallback(async () => {
    if (!connectedLinkedIn) {
      toaster.show('Connect your personal LinkedIn account first', 'warning');
      setStep('channels');
      return;
    }

    const response = await fetch('/user/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        integrationId: connectedLinkedIn.id,
        role: role.trim(),
        audience: audience.trim(),
        goal: goal.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      toaster.show(text || 'Could not complete onboarding', 'warning');
      setStep('website');
      return;
    }

    await mutate('/user/self');
    onClose();
  }, [
    audience,
    connectedLinkedIn,
    fetch,
    goal,
    mutate,
    onClose,
    role,
    toaster,
    websiteUrl,
  ]);

  return (
    <div className="w-full min-h-full flex-1 p-4 sm:p-6 md:p-10 flex relative justify-center">
      <style>{`#support-discord {display: none}`}</style>
      <div className="flex w-full max-w-[860px] bg-newBgColorInner rounded-[20px] flex-col relative max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden">
        <div className="flex-1 flex overflow-y-auto p-4 sm:p-8 md:p-10">
          <div className="flex flex-col gap-[24px] flex-1 min-w-0">
            {step !== 'loading' && <Progress step={step} />}
            {step === 'channels' && (
              <OnboardingChannelsStep
                integration={connectedLinkedIn}
                onFinish={() => setStep('positioning')}
              />
            )}
            {step === 'positioning' && (
              <OnboardingPositioningStep
                role={role}
                audience={audience}
                goal={goal}
                onChangeRole={setRole}
                onChangeAudience={setAudience}
                onChangeGoal={setGoal}
                onFinish={() => setStep('website')}
              />
            )}
            {step === 'website' && (
              <OnboardingWebsiteStep
                websiteUrl={websiteUrl}
                onChangeWebsiteUrl={setWebsiteUrl}
                onFinish={() => setStep('loading')}
              />
            )}
            {step === 'loading' && (
              <OnboardingLoadingStep onComplete={completeOnboarding} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Progress: FC<{ step: Exclude<OnboardingStep, 'loading'> }> = ({
  step,
}) => {
  const currentStep = step === 'channels' ? 1 : step === 'positioning' ? 2 : 3;

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[13px] font-medium text-customColor18 text-center">
        Step {currentStep} of 3
      </div>
      <div className="flex items-center gap-[8px]">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className={clsx(
              'h-[6px] flex-1 rounded-full',
              currentStep >= item
                ? 'bg-gradient-to-r from-[#622aff] to-[#8b5cf6]'
                : 'bg-newTableHeader'
            )}
          />
        ))}
      </div>
    </div>
  );
};

const OnboardingChannelsStep: FC<{
  integration: any;
  onFinish: () => void;
}> = ({ integration, onFinish }) => {
  const fetch = useFetch();
  const t = useT();
  const toaster = useToaster();
  const fireEvents = useFireEvents();

  const connectLinkedIn = useCallback(async () => {
    fireEvents('integration_connect_clicked', {
      platform: 'linkedin',
      onboarding: true,
      isExternal: false,
      isWeb3: false,
      isChromeExtension: false,
    });

    try {
      const { url, err } = await (
        await fetch('/integrations/social/linkedin?onboarding=true')
      ).json();

      if (err || !url) {
        toaster.show(
          t(
            'could_not_connect_to_platform',
            'Could not connect to the platform'
          ),
          'warning'
        );
        return;
      }

      window.location.href = url;
    } catch {
      toaster.show(
        t('could_not_connect_to_platform', 'Could not connect to the platform'),
        'warning'
      );
    }
  }, [fetch, fireEvents, t, toaster]);

  return (
    <div className="flex flex-1 flex-col justify-center gap-[26px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">
          Connect your LinkedIn profile
        </div>
        <div className="text-[14px] text-customColor18">
          FeedVector starts by learning from your personal LinkedIn account. We
          will never post without your approval.
        </div>
      </div>

      {integration && (
        <div className="mx-auto w-full max-w-[680px] bg-newTableHeader rounded-[8px] p-[16px] border border-newTableBorder">
          <div className="text-[14px] font-medium mb-[12px]">
            {t('connected_channel', 'Connected Channel')}
          </div>
          <div className="flex items-center gap-[10px] bg-customColor47/30 rounded-[8px] px-[12px] py-[10px]">
            <div className="relative w-[34px] h-[34px] shrink-0">
              <Image
                src={integration.picture || '/icons/platforms/linkedin.png'}
                className="rounded-full"
                alt={integration.identifier}
                width={34}
                height={34}
              />
              <Image
                src="/icons/platforms/linkedin.png"
                className="rounded-full absolute -bottom-[3px] -end-[3px] border border-fifth"
                alt="LinkedIn"
                width={16}
                height={16}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold truncate">
                {integration.name}
              </div>
              <div className="text-[12px] text-customColor18 truncate">
                Personal LinkedIn profile
              </div>
            </div>
          </div>
        </div>
      )}

      {!integration && (
        <button
          type="button"
          onClick={connectLinkedIn}
          className="group relative mx-auto w-full max-w-[680px] overflow-hidden rounded-[18px] border border-[#0a66c2]/30 bg-newTableHeader p-[2px] text-left transition-all hover:border-[#0a66c2]/70 hover:shadow-[0_18px_50px_rgba(10,102,194,0.18)]"
        >
          <div className="relative flex flex-col gap-[18px] rounded-[16px] bg-newBgColorInner px-[22px] py-[24px] sm:flex-row sm:items-center sm:justify-between sm:px-[28px] sm:py-[26px]">
            <div className="flex items-center gap-[16px] min-w-0">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-[#0a66c2] shadow-[0_12px_30px_rgba(10,102,194,0.25)]">
                <img
                  src="/icons/platforms/linkedin.png"
                  className="h-[34px] w-[34px] rounded-[8px]"
                  alt=""
                />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-semibold text-newTextColor">
                  Connect LinkedIn profile
                </div>
                <div className="mt-[4px] text-[13px] leading-[18px] text-customColor18">
                  Use your personal LinkedIn account to personalize analytics,
                  drafts, and recommendations.
                </div>
              </div>
            </div>
            <div className="flex h-[42px] shrink-0 items-center justify-center gap-[8px] rounded-[10px] bg-[#0a66c2] px-[16px] text-[14px] font-semibold text-white transition-transform group-hover:translate-x-[2px]">
              Connect
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      )}

      <div className="flex justify-center">
        <button
          disabled={!integration}
          onClick={onFinish}
          className={clsx(
            'group flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto',
            !integration
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40'
          )}
        >
          {t('continue', 'Continue')}
        </button>
      </div>
    </div>
  );
};

const SentenceSelect: FC<{
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ id, label, value, options, onChange }) => {
  const placeholder = '--------';
  const displayValue = value || placeholder;
  const width = `calc(${Math.min(
    Math.max(displayValue.length, placeholder.length),
    36
  )}ch + 46px)`;

  return (
    <span className="relative inline-flex align-middle max-w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ width }}
        className={clsx(
          'h-[44px] max-w-full appearance-none rounded-[10px] border border-newTableBorder bg-newBgColorInner py-0 ps-[13px] pe-[40px] text-[15px] font-semibold outline-none transition-colors hover:border-[#8b5cf6]/60 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20',
          value ? 'text-newTextColor' : 'text-customColor18'
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-[12px] top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full bg-newTableHeader text-customColor18">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </span>
  );
};

const OnboardingPositioningStep: FC<{
  role: string;
  audience: string;
  goal: string;
  onChangeRole: (value: string) => void;
  onChangeAudience: (value: string) => void;
  onChangeGoal: (value: string) => void;
  onFinish: () => void;
}> = ({
  role,
  audience,
  goal,
  onChangeRole,
  onChangeAudience,
  onChangeGoal,
  onFinish,
}) => {
  const canContinue = !!role.trim() && !!audience.trim() && !!goal.trim();

  return (
    <div className="flex flex-1 flex-col justify-center gap-[26px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">
          Tell us your positioning
        </div>
        <div className="text-[14px] text-customColor18">
          Complete the sentence so drafts and recommendations match your niche.
        </div>
      </div>

      <div className="bg-newTableHeader rounded-[12px] border border-newTableBorder p-[18px] sm:p-[24px]">
        <div className="text-[22px] leading-[40px] font-medium text-newTextColor">
          <span>I'm a </span>
          <SentenceSelect
            id="onboarding-role"
            label="Role"
            value={role}
            options={roleOptions}
            onChange={onChangeRole}
          />
          <span> trying to reach </span>
          <SentenceSelect
            id="onboarding-audience"
            label="Audience"
            value={audience}
            options={audienceOptions}
            onChange={onChangeAudience}
          />
          <span> and my goal is to </span>
          <SentenceSelect
            id="onboarding-goal"
            label="Goal"
            value={goal}
            options={goalOptions}
            onChange={onChangeGoal}
          />
          <span>.</span>
        </div>
      </div>

      <div className="flex justify-center pt-[8px]">
        <button
          disabled={!canContinue}
          onClick={onFinish}
          className={clsx(
            'flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto',
            !canContinue
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40'
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const OnboardingWebsiteStep: FC<{
  websiteUrl: string;
  onChangeWebsiteUrl: (value: string) => void;
  onFinish: () => void;
}> = ({ websiteUrl, onChangeWebsiteUrl, onFinish }) => {
  const trimmedWebsiteUrl = websiteUrl.trim();
  const isInvalidWebsiteUrl =
    !!trimmedWebsiteUrl && !websiteUrlPattern.test(trimmedWebsiteUrl);

  return (
    <div className="flex flex-1 flex-col justify-center gap-[24px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">
          Add a website (Optional){' '}
        </div>
        <div className="text-[14px] text-customColor18">
          Add a personal or business website if it helps us understand your
          work.
        </div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="onboarding-website" className="text-[14px] font-medium">
          Personal/Business Website URL
        </label>
        <input
          id="onboarding-website"
          value={websiteUrl}
          onChange={(event) => onChangeWebsiteUrl(event.target.value)}
          placeholder="https://example.com"
          maxLength={2048}
          className={clsx(
            'h-[48px] rounded-[8px] border bg-newTableHeader px-[14px] text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]',
            isInvalidWebsiteUrl ? 'border-red-500' : 'border-newTableBorder'
          )}
          autoFocus
        />
        {isInvalidWebsiteUrl && (
          <div className="text-[12px] text-red-500">
            Enter a valid public website URL, like example.com.
          </div>
        )}
      </div>

      <div className="flex justify-center pt-[8px]">
        <button
          disabled={isInvalidWebsiteUrl}
          onClick={onFinish}
          className={clsx(
            'flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto',
            isInvalidWebsiteUrl
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40'
          )}
        >
          Finish setup
        </button>
      </div>
    </div>
  );
};

const loadingMessages = [
  'setting up your workspace',
  'understanding your niche',
  'creating drafts that would work well for you',
];

const OnboardingLoadingStep: FC<{
  onComplete: () => Promise<void>;
}> = ({ onComplete }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < loadingMessages.length; i += 1) {
        if (cancelled) return;
        setIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 1300));
      }

      if (!cancelled) {
        await onComplete();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center gap-[22px] text-center">
      <div className="h-[54px] w-[54px] rounded-full border-[4px] border-newTableBorder border-t-[#8b5cf6] animate-spin" />
      <div className="flex flex-col gap-[8px]">
        <div className="text-[24px] font-semibold">Setting up FeedVector</div>
        <div className="text-[15px] text-customColor18">
          {loadingMessages[index]}...
        </div>
      </div>
    </div>
  );
};
