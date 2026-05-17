'use client';

import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { AddProviderButton } from '@gitroom/frontend/components/launches/add.provider.component';
import { MenuGroupComponentMobile } from '@gitroom/frontend/components/launches/mobile-menu-group';

export function MobileChannelsDrawer(props: {
  menuIntegrations: any[];
  totalNonDisabledChannels: number;
  mutate: any;
  continueIntegration: any;
  update: any;
  refreshChannel: any;
  changeItemGroup: any;
  onClose?: () => void;
}) {
  const t = useT();

  const hasChannels = props.menuIntegrations?.some(
    (g) => (g?.values || []).length > 0
  );

  return (
    <div className="w-full max-w-full overflow-x-hidden box-border h-[100dvh] flex flex-col bg-newBgColorInner text-newTextColor">
      <div className="sticky top-0 z-10 bg-newBgColorInner border-b border-newTableBorder px-4 pt-[calc(env(safe-area-inset-top,0px)+14px)] pb-[14px]">
        <div className="flex items-start gap-[12px]">
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-[800] leading-tight">
              {t('channels', 'Channels')}
            </div>
            <div className="text-[13px] text-textItemBlur">
              {t('manage_connected_accounts', 'Manage your connected accounts')}
            </div>
          </div>
          {props.onClose && (
            <button
              type="button"
              onClick={props.onClose}
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
          )}
        </div>
      </div>

      <div className="px-4 py-[14px] border-b border-newTableBorder">
        <AddProviderButton update={() => props.update(true)} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-[14px] pb-[calc(env(safe-area-inset-bottom,0px)+18px)] scrollbar scrollbar-thumb-fifth scrollbar-track-newBgColor">
        {!hasChannels ? (
          <div className="text-center text-textItemBlur py-[40px]">
            {t('no_channels', 'No channels yet')}
          </div>
        ) : (
          <div className="gap-[24px] flex flex-col min-w-0 max-w-full">
            {props.menuIntegrations.map((menu) => (
              <MenuGroupComponentMobile
                key={menu.name}
                collapsed={false}
                changeItemGroup={props.changeItemGroup}
                group={menu}
                mutate={props.mutate}
                continueIntegration={props.continueIntegration}
                update={props.update}
                refreshChannel={props.refreshChannel}
                totalNonDisabledChannels={props.totalNonDisabledChannels}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
