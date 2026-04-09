'use client';

import { useCallback } from 'react';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { setCookie } from '@gitroom/frontend/components/layout/layout.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
export const LogoutComponent = ({
  compact = false,
  className = "",
}: {
  compact?: boolean
  className?: string
}) => {
  const fetch = useFetch();
  const { isGeneral, isSecured } = useVariables();
  const t = useT();

  const logout = useCallback(async () => {
    if (
      await deleteDialog(
        t(
          'are_you_sure_you_want_to_logout',
          'Are you sure you want to logout?'
        ),
        t('yes_logout', 'Yes logout')
      )
    ) {
      if (!isSecured) {
        setCookie('auth', '', -10);
      } else {
        await fetch('/user/logout', {
          method: 'POST',
        });
      }
      window.location.href = '/';
    }
  }, []);
  return (
    <div
      className={`text-red-400 cursor-pointer ${className}`}
      onClick={logout}
      aria-label={t('logout', 'Logout')}
      title={t('logout', 'Logout')}
    >
      {compact ? (
        <svg
          aria-hidden="true"
          className="h-[24px] w-[24px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v10" />
          <path d="M7.5 5.5a7.5 7.5 0 1 0 9 0" />
        </svg>
      ) : (
        <>
          {t('logout_from', 'Logout from')}
          {isGeneral ? ' FeedVector' : ' Gitroom'}
        </>
      )}
    </div>
  );
};
