"use client"

import clsx from "clsx"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { ReactNode, useMemo } from "react"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { SVGLine } from "@gitroom/frontend/components/launches/launches.component"

export const TemplatesLayout = ({ children }: { children: ReactNode }) => {
  const t = useT()
  const pathname = usePathname()

  const items = useMemo(
    () => [
      {
        key: "viral",
        label: t("viral_templates", "Viral Templates"),
        path: "/templates/viral",
      },
    ],
    [t],
  )

  return (
    <div className="flex flex-1 flex-col sm:flex-row gap-[12px] overflow-hidden">
      <div className="hidden sm:flex bg-newBgColorInner p-[20px] flex-col gap-[15px] transition-all w-[260px]">
        <div className="flex items-center">
          <h2 className="flex-1 text-[20px] font-[500]">{t("templates", "Templates")}</h2>
        </div>

        <div className="flex flex-1 flex-col gap-[12px]">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.path)
            return (
              <Link
                key={item.key}
                href={item.path}
                className={clsx(
                  "flex gap-[12px] items-center group/profile justify-center hover:bg-boxHover rounded-e-[8px] transition-opacity",
                  !isActive && "opacity-40 hover:opacity-100",
                )}
              >
                <div
                  className={clsx(
                    "hidden sm:block h-full w-[4px] rounded-s-[3px] opacity-0 group-hover/profile:opacity-100 transition-opacity",
                    isActive && "opacity-100",
                  )}
                >
                  <SVGLine />
                </div>
                <div className="flex-1 py-[10px] text-[14px] font-[600]">{item.label}</div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="bg-newBgColorInner flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
