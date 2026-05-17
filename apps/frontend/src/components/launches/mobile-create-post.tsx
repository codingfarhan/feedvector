'use client';

import { useCallback } from 'react';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { useAddProvider } from '@gitroom/frontend/components/launches/add.provider.component';
import { GeneratorComponent } from '@gitroom/frontend/components/launches/generator/generator';
import { useCreatePostAction } from '@gitroom/frontend/components/launches/use-create-post';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export function MobileCreatePostHeaderButton() {
  const t = useT();
  const createPost = useCreatePostAction();

  return (
    <button
      type="button"
      onClick={createPost}
      className="sm:hidden h-[40px] px-[14px] rounded-[12px] bg-btnPrimary text-white text-[14px] font-[600] inline-flex items-center gap-[8px]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 21 20"
        fill="none"
      >
        <path
          d="M10.5001 4.16699V15.8337M4.66675 10.0003H16.3334"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t('create_post', 'Create')}
    </button>
  );
}

export function MobileCreateActionsFab() {
  const t = useT();
  const modals = useModals();
  const createPost = useCreatePostAction();
  const addChannel = useAddProvider();

  const openActions = useCallback(() => {
    modals.openModal({
      title: t('create', 'Create'),
      withCloseButton: true,
      classNames: {
        modal: 'bg-newBgColorInner text-newTextColor',
      },
      children: (
        <div className="flex flex-col gap-[10px]">
          <button
            type="button"
            onClick={async () => {
              modals.closeAll();
              await createPost();
            }}
            className="w-full flex items-center justify-between gap-[12px] px-[14px] py-[14px] rounded-[14px] bg-newTableHeader hover:bg-boxHover text-newTextColor"
          >
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-[12px] bg-btnPrimary text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 20" fill="none">
                  <path d="M10.5001 4.16699V15.8337M4.66675 10.0003H16.3334" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-[16px] font-[700]">{t('create_new_post', 'Create Post')}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              modals.closeAll();
              addChannel?.();
            }}
            className="w-full flex items-center justify-between gap-[12px] px-[14px] py-[14px] rounded-[14px] bg-newTableHeader hover:bg-boxHover text-newTextColor"
          >
            <div className="flex items-center gap-[12px]">
              <div className="w-[36px] h-[36px] rounded-[12px] bg-btnSimple text-btnText flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-[16px] font-[700]">{t('add_channel', 'Add Channel')}</div>
            </div>
          </button>

          <div className="w-full flex items-center justify-between gap-[12px] px-[14px] py-[14px] rounded-[14px] bg-newTableHeader text-newTextColor">
            <div className="flex items-center gap-[12px]">
              <GeneratorComponent />
              <div className="text-[16px] font-[700]">{t('ai_generator', 'AI Generator')}</div>
            </div>
          </div>
        </div>
      ),
      size: 'md',
    });
  }, [addChannel, createPost, modals, t]);

  return (
    <button
      type="button"
      onClick={openActions}
      aria-label={t('create', 'Create')}
      className="sm:hidden fixed z-[120] right-[18px] bottom-[18px] rounded-full w-[56px] h-[56px] bg-btnPrimary text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center justify-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 21 20"
        fill="none"
      >
        <path
          d="M10.5001 4.16699V15.8337M4.66675 10.0003H16.3334"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
