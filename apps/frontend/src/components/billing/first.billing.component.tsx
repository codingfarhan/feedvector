"use client"

import React, { FC, useCallback, useMemo, useState } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { useVariables } from "@gitroom/react/helpers/variable.context"
import { OrganizationSelector } from "@gitroom/frontend/components/layout/organization.selector"
import { LanguageComponent } from "@gitroom/frontend/components/layout/language.component"
import { AttachToFeedbackIcon } from "@gitroom/frontend/components/new-layout/sentry.feedback.component"
import NotificationComponent from "@gitroom/frontend/components/notifications/notification.component"
import dynamic from "next/dynamic"
import { LogoTextComponent } from "@gitroom/frontend/components/ui/logo-text.component"
import { ActiveBillingPlan, ACTIVE_BILLING_PLANS, pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"
import clsx from "clsx"
import { Button } from "@gitroom/react/form/button"
import { CheckIconComponent } from "@gitroom/frontend/components/ui/check.icon.component"
import { FAQComponent, FAQSection } from "@gitroom/frontend/components/billing/faq.component"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { useDubClickId } from "@gitroom/frontend/components/layout/dubAnalytics"
import Image from "next/image"
import { useModals } from "@gitroom/frontend/components/layout/new-modal"
import useCookie from "react-use-cookie"
import { openRazorpayCheckout } from "@gitroom/frontend/components/billing/razorpay.checkout"
import { LogoutComponent } from "@gitroom/frontend/components/layout/logout.component"

const ModeComponent = dynamic(() => import("@gitroom/frontend/components/layout/mode.component"), {
  ssr: false,
})

export const FirstBillingComponent = () => {
  const { razorpayKeyId } = useVariables()
  const user = useUser()
  const dub = useDubClickId()
  const [tier, setTier] = useState<ActiveBillingPlan>("GROWTH")
  const period: "MONTHLY" = "MONTHLY"
  const fetch = useFetch()
  const modals = useModals()
  const t = useT()
  const [datafast_visitor_id] = useCookie("datafast_visitor_id", "")
  const [datafast_session_id] = useCookie("datafast_session_id", "")

  const showYouTube = () => {
    modals.openModal({
      title: "Grow Fast With FeedVector (Play the video)",
      children: (
        <iframe
          className="h-full aspect-video min-w-[800px]"
          src="https://www.youtube.com/embed/BdsCVvEYgHU?si=vvhaZJ8I5oXXvVJS?autoplay=1"
          title="FeedVector Tutorial"
          allow="autoplay"
          allowFullScreen
        />
      ),
    })
  }

  const startCheckout = useCallback(async () => {
    if (!razorpayKeyId) {
      return
    }
    const response = await (
      await fetch("/billing/subscribe", {
        method: "POST",
        body: JSON.stringify({
          billing: tier,
          period: period,
          ...(datafast_visitor_id && datafast_session_id ? { datafast_visitor_id, datafast_session_id } : {}),
          ...(dub ? { dub } : {}),
        }),
      })
    ).json()

    if (!response?.subscriptionId || !response?.keyId) {
      return
    }

    await openRazorpayCheckout({
      keyId: response.keyId,
      subscriptionId: response.subscriptionId,
      amount: response.amount,
      currency: response.currency,
      name: response.name,
      description: response.description,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      onSuccess: async (payload) => {
        await fetch("/billing/verify", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        window.location.href = "/billing"
      },
    })
  }, [razorpayKeyId, tier, period, datafast_visitor_id, datafast_session_id, dub, user])

  const price = useMemo(() => ACTIVE_BILLING_PLANS.map((key) => [key, pricing[key]] as const), [])

  const JoinOver = () => {
    return (
      <>
        <div className="text-[46px] font-[600] leading-[110%] tablet:text-[36px] mobile:!text-[30px] whitespace-pre-line text-balance">
          {t("billing_join_over", "Join Over")} <span className="text-[#FC69FF]">Hundreds of Entrepreneurs</span> {t("billing_who_use", "who use")}{" "}
          {t("billing_postiz_grow_social", "FeedVector To Grow Their Social Presence")}
        </div>

        {/* <div className="flex" onClick={showYouTube}>
          <div className="tablet:mb-[32px] cursor-pointer mt-[32px] flex gap-[10px] items-center underline hover:font-[700]">
            <div>
              <Image className="text-[12px]" src="/icons/platforms/youtube.svg" width={22.5} height={16} alt="YouTube" />
            </div>
            <div>See the power of FeedVector (click here)</div>
          </div>
        </div> */}

        {!!user?.allowTrial && (
          <div className="flex mt-[32px] mb-[10px] gap-[15px] tablet:mt-[32px] tablet:mb-[32px] text-[16px] font-[500] mobile:flex-col">
            <div className="flex gap-[8px]">
              <div>
                <CheckIconComponent />
              </div>
              <div>Cancel Anytime</div>
            </div>
            <div className="flex-1 flex gap-[8px] justify-center mobile:justify-start">
              <div>
                <CheckIconComponent />
              </div>
              <div>Access to All Features</div>
            </div>
            <div className="flex gap-[8px]">
              <div>
                <CheckIconComponent />
              </div>
              <div>24/7 Email Support</div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="blurMe flex flex-1 flex-col bg-newBgColorInner pb-[60px] mobile:pb-[100px]">
      <div className="h-[92px] px-[80px] tablet:px-[32px] mobile:!px-[16px] py-[20px] flex border-b border-newColColor">
        <div className="flex-1 flex items-center text-textColor">
          <LogoTextComponent />
        </div>
        <div className="flex items-center">
          <div className="flex gap-[20px] text-textItemBlur">
            <OrganizationSelector />
            <div className="hover:text-newTextColor">
              <ModeComponent />
            </div>
            <div className="w-[1px] h-[20px] bg-blockSeparator" />
            <LanguageComponent />
            <div className="w-[1px] h-[20px] bg-blockSeparator" />
            <AttachToFeedbackIcon />
            <NotificationComponent />
            <div className="w-[1px] h-[20px] bg-blockSeparator" />
            <LogoutComponent compact className="text-[13px]" />
          </div>
        </div>
      </div>
      <div className="flex px-[80px] tablet:px-[32px] mobile:!px-[16px] flex-1 flex-row tablet:flex-none tablet:flex-col-reverse">
        <div className="flex-1 py-[40px] tablet:pt-[80px] flex flex-col pe-[40px] tablet:pe-0">
          <div className="block tablet:hidden">
            <JoinOver />
          </div>
          <div className="flex flex-col gap-[16px]">
            <div className="text-[18px] text-customColor18">
              {tier === "ESSENTIAL" ? "Essential" : "Growth"} - ${pricing[tier].month_price}/month
            </div>
            <Button onClick={startCheckout} disabled={!razorpayKeyId}>
              {tier === "ESSENTIAL" ? "Choose Essential" : "Choose Growth"}
            </Button>
          </div>
        </div>
        <div className="flex flex-col ps-[40px] tablet:!ps-[0] border-l border-newColColor py-[40px] mobile:!pt-[24px] tablet:border-none tablet:pb-0">
          <div className="top-[20px] sticky">
            <div className="hidden tablet:block">
              <JoinOver />
            </div>
            <div className="flex mb-[24px] mobile:flex-col">
              <div className="flex-1 text-[24px] font-[700]">Your Free trial has ended</div>
              <div className="h-[44px] px-[12px] mobile:px-0 flex items-center justify-center mobile:justify-start gap-[12px] border border-newColColor rounded-[12px] select-none">
                {/* <div className="h-[32px] mobile:flex-1 rounded-[6px] text-[16px] px-[12px] flex justify-center items-center bg-boxFocused text-textItemFocused">
                  {t("billing_monthly", "Monthly")}
                </div> */}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-[8px] mobile:!grid-cols-2 tablet:grid-cols-4">
              {price.map(
                ([key, value]) => (
                  <div
                    key={key}
                    className={clsx(
                      "select-none cursor-pointer w-[266px] h-[138px] tablet:w-full tablet:h-[124px] p-[24px] tablet:p-[15px] rounded-[20px] flex flex-col border-[1.5px]",
                      tier === key ? "border-[#618DFF]" : "border-newColColor",
                    )}
                    onClick={() => setTier(key)}
                  >
                    <div className="text-[20px] mobile:text-[18px] font-[500]">{key === "ESSENTIAL" ? "Essential" : "Growth"}</div>
                    <div className="text-[24px] mobile:text-[18px] font-[400]">
                      <span className="text-[44px] mobile:text-[30px] font-[600]">${value.month_price}</span> {t("billing_per_month", "/ month")}
                    </div>
                  </div>
                ),
                [],
              )}
            </div>
            <div className="flex flex-col mt-[54px] gap-[24px] tablet:mt-[40px]">
              <div className="text-[24px] font-[700]">{t("billing_features", "Features")}</div>
              <BillingFeatures tier={tier} />
            </div>
            <div className="flex flex-col mobile:hidden tablet:hidden">
              {/*<div>asd</div>*/}
              <FAQComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type FeatureItem = {
  key: string
  defaultValue: string
  prefix?: string | number
}

export const BillingFeatures: FC<{ tier: string }> = ({ tier }) => {
  const t = useT()
  const features = useMemo(() => {
    const currentPricing = pricing[tier]
    const channelsOr = currentPricing.channel
    const list: FeatureItem[] = []

    list.push({
      key: channelsOr === 1 ? "billing_channel" : "billing_channels",
      defaultValue: channelsOr === 1 ? "channel" : "channels",
      prefix: channelsOr,
    })

    list.push({
      key: "billing_posts_per_month",
      defaultValue: "posts per month",
      prefix: currentPricing.posts_per_month > 10000 ? "unlimited" : currentPricing.posts_per_month,
    })

    if (currentPricing.team_member_limit && currentPricing.team_member_limit < 1000000) {
      list.push({
        key: "billing_limited_team_members",
        defaultValue: `Invite ${Math.max(0, currentPricing.team_member_limit - 1)} more users to your team`,
      })
    } else if (currentPricing.team_members) {
      list.push({
        key: "billing_unlimited_team_members",
        defaultValue: "Unlimited team members",
      })
    }
    if (currentPricing?.ai) {
      list.push({
        key: "billing_ai_auto_complete",
        defaultValue: "AI auto-complete",
      })
      list.push({ key: "billing_ai_copilots", defaultValue: "AI copilots" })
      list.push({
        key: "billing_ai_autocomplete",
        defaultValue: "AI Autocomplete",
      })
    }
    list.push({
      key: "billing_advanced_picture_editor",
      defaultValue: "Advanced Picture Editor",
    })
    if (currentPricing?.image_generator) {
      list.push({
        key: "billing_ai_images_per_month",
        defaultValue: "AI Images per month",
        prefix: currentPricing?.image_generation_count,
      })
    }
    if (currentPricing?.generate_videos) {
      list.push({
        key: "billing_ai_videos_per_month",
        defaultValue: "AI Videos per month",
        prefix: currentPricing?.generate_videos,
      })
    }
    return list
  }, [tier])

  const renderFeature = (feature: FeatureItem) => {
    const translatedText = t(feature.key, feature.defaultValue)
    if (feature.prefix === "unlimited") {
      return `${t("billing_unlimited", "Unlimited")} ${translatedText}`
    }
    if (feature.prefix !== undefined) {
      return `${feature.prefix} ${translatedText}`
    }
    return translatedText
  }

  return (
    <div className="grid grid-cols-2 mobile:grid-cols-1 gap-y-[8px] gap-x-[32px]">
      {features.map((feature) => (
        <div key={feature.key} className="flex items-center gap-[8px]">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path
                d="M11.825 0H4.84167C1.80833 0 0 1.80833 0 4.84167V11.8167C0 14.8583 1.80833 16.6667 4.84167 16.6667H11.8167C14.85 16.6667 16.6583 14.8583 16.6583 11.825V4.84167C16.6667 1.80833 14.8583 0 11.825 0ZM12.3167 6.41667L7.59167 11.1417C7.475 11.2583 7.31667 11.325 7.15 11.325C6.98333 11.325 6.825 11.2583 6.70833 11.1417L4.35 8.78333C4.10833 8.54167 4.10833 8.14167 4.35 7.9C4.59167 7.65833 4.99167 7.65833 5.23333 7.9L7.15 9.81667L11.4333 5.53333C11.675 5.29167 12.075 5.29167 12.3167 5.53333C12.5583 5.775 12.5583 6.16667 12.3167 6.41667Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>{renderFeature(feature)}</div>
        </div>
      ))}
    </div>
  )
}
