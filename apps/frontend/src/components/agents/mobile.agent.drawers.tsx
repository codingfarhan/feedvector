'use client';

import React, { FC, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import useSWR from 'swr';
import { orderBy } from 'lodash';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export const MobileDrawerShell: FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, children }) => {
  const t = useT();
  return (
    <div className="w-full max-w-full h-[100dvh] overflow-x-hidden flex flex-col bg-newBgColorInner text-newTextColor">
      <div className="sticky top-0 z-10 bg-newBgColorInner border-b border-newTableBorder px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)] pb-[14px]">
        <div className="flex items-start gap-[12px]">
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-[800] leading-tight truncate">
              {title}
            </div>
            {!!subtitle && (
              <div className="text-[13px] text-textItemBlur">{subtitle}</div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close', 'Close')}
            className="shrink-0 h-[40px] w-[40px] rounded-[12px] bg-newTableHeader hover:bg-boxHover text-textItemBlur hover:text-newTextColor flex items-center justify-center"
          >
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path
                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-[14px] pb-[calc(env(safe-area-inset-bottom,0px)+18px)] scrollbar scrollbar-thumb-fifth scrollbar-track-newBgColor">
        {children}
      </div>
    </div>
  );
};

export const MobileAgentsTopBar: FC<{
  title: string;
  onOpenChannels: () => void;
  onOpenChats: () => void;
}> = ({ title, onOpenChannels, onOpenChats }) => {
  return (
    <div className="sm:hidden sticky top-0 z-[30] bg-newBgColorInner border-b border-newTableBorder px-3 pt-[calc(env(safe-area-inset-top,0px)+10px)] pb-[10px]">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={onOpenChannels}
          className="h-[40px] px-[12px] rounded-[12px] bg-newTableHeader hover:bg-boxHover text-newTextColor text-[14px] font-[700] inline-flex items-center gap-[8px]"
        >
          Channels
        </button>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-[16px] font-[800] truncate">{title}</div>
        </div>
        <button
          type="button"
          onClick={onOpenChats}
          className="h-[40px] px-[12px] rounded-[12px] bg-newTableHeader hover:bg-boxHover text-newTextColor text-[14px] font-[700] inline-flex items-center gap-[8px]"
        >
          Chats
        </button>
      </div>
    </div>
  );
};

export const MobileAgentChannelsPicker: FC<{
  selected: any[];
  onChange: (next: any[]) => void;
}> = ({ selected, onChange }) => {
  const fetch = useFetch();
  const t = useT();

  const load = useCallback(async () => {
    return (await (await fetch('/integrations/list')).json()).integrations;
  }, [fetch]);

  const { data } = useSWR('agent-integrations-mobile', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      data || [],
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [data]);

  const toggle = useCallback(
    (integration: any) => {
      const exists = selected.some((p) => p.id === integration.id);
      const next = exists
        ? selected.filter((p) => p.id !== integration.id)
        : [...selected, integration];
      onChange(next);
    },
    [selected, onChange]
  );

  if (!sortedIntegrations.length) {
    return (
      <div className="text-[14px] text-textItemBlur">
        {t('no_channels', 'No channels yet')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {sortedIntegrations.map((integration: any) => {
        const active = selected.some((p) => p.id === integration.id);
        return (
          <button
            type="button"
            key={integration.id}
            onClick={() => toggle(integration)}
            className={clsx(
              'w-full text-left flex items-center gap-[12px] px-[12px] py-[12px] rounded-[14px] border transition-colors',
              active
                ? 'bg-boxFocused text-textItemFocused border-newTableBorder'
                : 'bg-newTableHeader text-newTextColor border-newTableBorder hover:bg-boxHover'
            )}
          >
            <div className="shrink-0 relative">
              <ImageWithFallback
                fallbackSrc={`/icons/platforms/${integration.identifier}.png`}
                src={integration.picture}
                className="rounded-[10px]"
                alt={integration.identifier}
                width={40}
                height={40}
              />
              <Image
                src={`/icons/platforms/${integration.identifier}.png`}
                className="rounded-[8px] absolute z-10 bottom-[-5px] end-[-5px] border border-fifth"
                alt={integration.identifier}
                width={18}
                height={18}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-[800] truncate">
                {integration.name}
              </div>
              {integration.disabled && (
                <div className="text-[12px] text-textItemBlur">
                  {t('disabled', 'Disabled')}
                </div>
              )}
            </div>
            <div className="shrink-0">
              {active ? (
                <div className="h-[22px] px-[10px] rounded-full bg-btnPrimary text-white text-[12px] font-[800] inline-flex items-center">
                  {t('selected', 'Selected')}
                </div>
              ) : (
                <div className="h-[22px] px-[10px] rounded-full bg-newBgLineColor text-textItemBlur text-[12px] font-[800] inline-flex items-center">
                  {t('select', 'Select')}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const MobileAgentChatsList: FC<{ onNavigate?: () => void }> = ({
  onNavigate,
}) => {
  const fetch = useFetch();
  const router = useRouter();
  const t = useT();
  const { id } = useParams<{ id: string }>();

  const threads = useCallback(async () => {
    return (await fetch('/copilot/list')).json();
  }, [fetch]);

  const { data } = useSWR('agent-threads-mobile', threads);

  return (
    <div className="flex flex-col gap-[12px]">
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          router.push('/agents/new');
        }}
        className="w-full h-[44px] rounded-[14px] bg-btnPrimary text-white text-[14px] font-[800] flex items-center justify-center"
      >
        {t('start_a_new_chat', 'Start a new chat')}
      </button>
      <div className="flex flex-col gap-[8px]">
        {data?.threads?.map((p: any) => (
          <Link
            key={p.id}
            href={`/agents/${p.id}`}
            onClick={() => onNavigate?.()}
            className={clsx(
              'px-[12px] py-[10px] rounded-[14px] border border-newTableBorder bg-newTableHeader hover:bg-boxHover text-[14px] font-[700] truncate',
              p.id === id && 'bg-boxFocused text-textItemFocused'
            )}
          >
            {p.title}
          </Link>
        ))}
      </div>
    </div>
  );
};
