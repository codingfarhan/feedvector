"use client"

import React from "react"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { Button } from "@gitroom/react/form/button"
import { useRouter } from "next/navigation"
import { Features } from "@gitroom/frontend/components/billing/main.billing.component"
import { pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"

export const PricingComponent = () => {
  const t = useT()
  const router = useRouter()

  return (
    <div className="flex flex-1 bg-newBgLineColor p-[20px]">
      <div className="bg-newBgColorInner rounded-[12px] w-full p-[28px] flex flex-col gap-[24px]">
        <div className="flex flex-col gap-[6px]">
          <div className="text-[32px] font-semibold">{t("pricing", "Pricing")}</div>
          <div className="text-[15px] text-newTableText">{t("pricing_monthly_only", "Simple monthly pricing to help you grow on Social Media.")}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
          <div className="border border-newTableBorder rounded-[14px] p-[24px] bg-newTableHeader flex flex-col gap-[18px]">
            <div className="flex items-center justify-between">
              <div className="text-[20px] font-semibold">Essential</div>
              <div className="text-[20px] font-semibold">${pricing.ESSENTIAL.month_price}</div>
            </div>
            <div className="text-[14px] text-newTableText">{t("per_month", "per month")}</div>
            <div className="h-[1px] bg-newTableBorder" />
            <Features pack="ESSENTIAL" />
            <div className="pt-[6px]">
              <Button onClick={() => router.push("/billing")}>Choose Essential</Button>
            </div>
          </div>

          <div className="border border-[#612bd3]/50 rounded-[14px] p-[24px] bg-newTableHeader flex flex-col gap-[18px] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[20px] font-semibold">Growth</div>
              <div className="text-[20px] font-semibold">${pricing.GROWTH.month_price}</div>
            </div>
            <div className="text-[14px] text-newTableText">{t("per_month", "per month")}</div>
            <div className="h-[1px] bg-newTableBorder" />
            <Features pack="GROWTH" />
            <div className="pt-[6px]">
              <Button onClick={() => router.push("/billing")}>Choose Growth</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
