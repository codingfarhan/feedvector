'use client';
import { FC, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

export const MenuItem: FC<{ label: string; icon: ReactNode; path: string }> = ({
  label,
  icon,
  path,
}) => {
  const currentPath = usePathname();
  const isActive = currentPath.indexOf(path) === 0;

  return (
    <Link
      prefetch={true}
      href={path}
      className={clsx(
        'w-full minCustom:h-[54px] custom:h-[30px] py-[8px] px-[6px] gap-[4px] flex flex-col custom:flex-row text-[10px] font-[600] items-center minCustom:justify-center rounded-[12px] hover:text-textItemFocused hover:bg-boxFocused',
        isActive ? 'text-textItemFocused bg-boxFocused' : 'text-textItemBlur'
      )}
    >
      <div className="custom:hidden relative">
        {icon}
        {isActive && (
          <div className="absolute -top-[6px] -end-[6px] bg-newTextColor text-newBgColorInner rounded-full w-[14px] h-[14px] flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="text-[10px]">{label}</div>
    </Link>
  );
};
