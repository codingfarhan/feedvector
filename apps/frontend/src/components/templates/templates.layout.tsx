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
      <div className="bg-newBgColorInner flex-1 flex flex-col overflow-hidden">{children}</div>
    </div>
  )
}
