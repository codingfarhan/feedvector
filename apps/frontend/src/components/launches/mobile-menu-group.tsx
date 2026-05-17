'use client';

import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { Integration } from '@prisma/client';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import ImageWithFallback from '@gitroom/react/helpers/image.with.fallback';
import { Menu } from '@gitroom/frontend/components/launches/menu/menu';

export const SVGLine = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="52"
      viewBox="0 0 5 52"
      fill="none"
      className="rtl:rotate-180"
    >
      <path
        d="M0.5 4C0.5 1.79086 2.29086 0 4.5 0V52C2.29086 52 0.5 50.2091 0.5 48V4Z"
        fill="url(#paint0_linear_1930_1119)"
      />
      <path
        d="M0.5 4C0.5 1.79086 2.29086 0 4.5 0V52C2.29086 52 0.5 50.2091 0.5 48V4Z"
        fill="url(#paint1_radial_1930_1119)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1930_1119"
          x1="-7"
          y1="-27.7727"
          x2="-2.58929"
          y2="-28.6843"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#662FDA" />
          <stop offset="1" stopColor="#5720CB" />
        </linearGradient>
        <radialGradient
          id="paint1_radial_1930_1119"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1.19333 7.45342) rotate(21.2064) scale(16.1503 188.627)"
        >
          <stop stopColor="#8C66FF" />
          <stop offset="1" stopColor="#8C66FF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const OpenClose: FC<{ isOpen: boolean }> = (props) => {
  const { isOpen } = props;
  return (
    <svg
      width="11"
      height="6"
      viewBox="0 0 22 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx('rotate-180 transition-all', isOpen ? 'rotate-180' : 'rotate-90')}
    >
      <path
        d="M21.9245 11.3823C21.8489 11.5651 21.7207 11.7213 21.5563 11.8312C21.3919 11.9411 21.1986 11.9998 21.0008 11.9998H1.00079C0.802892 12 0.609399 11.9414 0.444805 11.8315C0.280212 11.7217 0.151917 11.5654 0.076165 11.3826C0.000412494 11.1998 -0.0193921 10.9986 0.0192583 10.8045C0.0579087 10.6104 0.153276 10.4322 0.293288 10.2923L10.2933 0.29231C10.3862 0.199333 10.4964 0.125575 10.6178 0.0752506C10.7392 0.0249263 10.8694 -0.000976562 11.0008 -0.000976562C11.1322 -0.000976562 11.2623 0.0249263 11.3837 0.0752506C11.5051 0.125575 11.6154 0.199333 11.7083 0.29231L21.7083 10.2923C21.8481 10.4322 21.9433 10.6105 21.9818 10.8045C22.0202 10.9985 22.0003 11.1996 21.9245 11.3823Z"
        fill="currentColor"
      />
    </svg>
  );
};

interface MenuComponentInterface {
  refreshChannel: (
    integration: Integration & {
      identifier: string;
    }
  ) => () => void;
  collapsed: boolean;
  continueIntegration: (integration: Integration) => () => void;
  totalNonDisabledChannels: number;
  mutate: (shouldReload?: boolean) => void;
  update: (shouldReload: boolean) => void;
}

export const MenuGroupComponentMobile: FC<
  MenuComponentInterface & {
    changeItemGroup: (id: string, group: string) => void;
    group: {
      id: string;
      name: string;
      values: Array<
        Integration & {
          identifier: string;
          changeProfilePicture: boolean;
          changeNickName: boolean;
        }
      >;
    };
  }
> = (props) => {
  const {
    group,
    mutate,
    update,
    continueIntegration,
    totalNonDisabledChannels,
    refreshChannel,
    collapsed,
  } = props;
  const [isOpen, setIsOpen] = useState(
    !!+(localStorage.getItem(group.name + '_isOpen') || '1')
  );
  const changeOpenClose = useCallback(
    (e: any) => {
      setIsOpen(!isOpen);
      localStorage.setItem(group.name + '_isOpen', isOpen ? '0' : '1');
      e.stopPropagation();
    },
    [isOpen, group.name]
  );
  return (
    <div className="gap-[16px] flex flex-col relative">
      {!!group.name && (
        <div
          className="flex items-center gap-[10px] cursor-pointer select-none rounded-[12px] px-[10px] py-[10px] bg-newTableHeader active:bg-boxHover"
          onClick={changeOpenClose}
        >
          <div className="shrink-0">
            <OpenClose isOpen={isOpen} />
          </div>
          <div
            className="line-clamp-1 flex-1 min-w-0 text-[14px] font-[700]"
            {...(collapsed
              ? {
                  'data-tooltip-id': 'tooltip',
                  'data-tooltip-content': group.name,
                }
              : {})}
          >
            {group.name}
          </div>
        </div>
      )}
      <div
        className={clsx(
          'gap-[10px] flex flex-col relative',
          !isOpen && 'hidden'
        )}
      >
        {group.values.map((integration) => (
          <MenuComponentMobile
            collapsed={collapsed}
            key={integration.id}
            integration={integration}
            mutate={mutate}
            continueIntegration={continueIntegration}
            update={update}
            refreshChannel={refreshChannel}
            totalNonDisabledChannels={totalNonDisabledChannels}
          />
        ))}
      </div>
    </div>
  );
};

export const MenuComponentMobile: FC<
  MenuComponentInterface & {
    integration: Integration & {
      identifier: string;
      changeProfilePicture: boolean;
      changeNickName: boolean;
      refreshNeeded?: boolean;
    };
  }
> = (props) => {
  const {
    totalNonDisabledChannels,
    continueIntegration,
    refreshChannel,
    mutate,
    update,
    integration,
    collapsed,
  } = props;
  const user = useUser();
  const t = useT();
  return (
    <div
      {...(integration.refreshNeeded && {
        onClick: refreshChannel(integration),
        'data-tooltip-id': 'tooltip',
        'data-tooltip-content': t(
          'channel_disconnected_click_to_reconnect',
          'Channel disconnected, click to reconnect.'
        ),
      })}
      {...(collapsed
        ? {
            'data-tooltip-id': 'tooltip',
            'data-tooltip-content': integration.name,
          }
        : {})}
      key={integration.id}
      className={clsx(
        'flex gap-[12px] items-center bg-newBgColorInner transition-all rounded-[14px] px-[10px] py-[10px] active:bg-boxHover',
        integration.refreshNeeded && 'cursor-pointer'
      )}
    >
      <div
        className={clsx(
          'relative gap-[6px] flex justify-center items-center shrink-0',
          integration.disabled && 'opacity-50'
        )}
      >
        <div className="h-full w-[4px] -ms-[12px] rounded-s-[3px] opacity-0 group-hover/profile:opacity-100 transition-opacity">
          <SVGLine />
        </div>
        {(integration.inBetweenSteps || integration.refreshNeeded) && (
          <div
            className="absolute start-0 top-0 w-[39px] h-[46px] cursor-pointer"
            onClick={
              integration.refreshNeeded
                ? refreshChannel(integration)
                : continueIntegration(integration)
            }
          >
            <div className="bg-red-500 w-[15px] h-[15px] rounded-full start-[5px] top-[5px] absolute z-[200] text-[10px] flex justify-center items-center">
              !
            </div>
            <div className="bg-primary/60 w-[39px] h-[46px] start-0 top-0 absolute rounded-full z-[199]" />
          </div>
        )}
        <ImageWithFallback
          fallbackSrc={'/no-picture.jpg'}
          src={integration.picture || '/no-picture.jpg'}
          className="rounded-[10px] min-w-[40px] min-h-[40px]"
          alt={integration.identifier}
          width={40}
          height={40}
        />
        {integration.identifier === 'youtube' ? (
          <img
            src="/icons/platforms/youtube.svg"
            className="absolute z-10 bottom-[5px] -end-[5px]"
            width={20}
          />
        ) : (
          <Image
            src={`/icons/platforms/${integration.identifier}.png`}
            className="rounded-[8px] absolute z-10 bottom-[5px] -end-[5px] border border-fifth"
            alt={integration.identifier}
            width={18.41}
            height={18.41}
          />
        )}
      </div>
      <div
        {...(integration.disabled && totalNonDisabledChannels === user?.totalChannels
          ? {
              'data-tooltip-id': 'tooltip',
              'data-tooltip-content': t(
                'channel_disabled_upgrade_plan',
                'This channel is disabled, please upgrade your plan to enable it.'
              ),
            }
          : {})}
        className={clsx(
          'group-[.sidebar]:hidden flex-1 min-w-0 text-[14px] font-[600] truncate',
          integration.disabled && 'opacity-50'
        )}
      >
        {integration.name}
      </div>
      <div className="shrink-0">
      <Menu
        canChangeProfilePicture={integration.changeProfilePicture}
        canChangeNickName={integration.changeNickName}
        refreshChannel={refreshChannel}
        mutate={mutate}
        onChange={update}
        id={integration.id}
        canEnable={
          user?.totalChannels! > totalNonDisabledChannels && integration.disabled
        }
        canDisable={!integration.disabled}
      />
      </div>
    </div>
  );
};
