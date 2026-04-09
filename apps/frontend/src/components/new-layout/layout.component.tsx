"use client"

import React, { ReactNode, useCallback, useState } from "react"
import { Logo } from "@gitroom/frontend/components/new-layout/logo"
import { Plus_Jakarta_Sans } from "next/font/google"
const ModeComponent = dynamic(() => import("@gitroom/frontend/components/layout/mode.component"), {
  ssr: false,
})

import clsx from "clsx"
import dynamic from "next/dynamic"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { useVariables } from "@gitroom/react/helpers/variable.context"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { CheckPayment } from "@gitroom/frontend/components/layout/check.payment"
import { ToolTip } from "@gitroom/frontend/components/layout/top.tip"
import { ShowMediaBoxModal } from "@gitroom/frontend/components/media/media.component"
import { ShowLinkedinCompany } from "@gitroom/frontend/components/launches/helpers/linkedin.component"
import { MediaSettingsLayout } from "@gitroom/frontend/components/launches/helpers/media.settings.component"
import { Toaster } from "@gitroom/react/toaster/toaster"
import { ShowPostSelector } from "@gitroom/frontend/components/post-url-selector/post.url.selector"
import { NewSubscription } from "@gitroom/frontend/components/layout/new.subscription"
import { Support } from "@gitroom/frontend/components/layout/support"
import { ContinueProvider } from "@gitroom/frontend/components/layout/continue.provider"
import { ContextWrapper } from "@gitroom/frontend/components/layout/user.context"
import { CopilotKit } from "@copilotkit/react-core"
import { MantineWrapper } from "@gitroom/react/helpers/mantine.wrapper"
import { Impersonate } from "@gitroom/frontend/components/layout/impersonate"
import { Title } from "@gitroom/frontend/components/layout/title"
import { TopMenu } from "@gitroom/frontend/components/layout/top.menu"
import { LanguageComponent } from "@gitroom/frontend/components/layout/language.component"
import { ChromeExtensionComponent } from "@gitroom/frontend/components/layout/chrome.extension.component"
import NotificationComponent from "@gitroom/frontend/components/notifications/notification.component"
import { OrganizationSelector } from "@gitroom/frontend/components/layout/organization.selector"
import { StreakComponent } from "@gitroom/frontend/components/layout/streak.component"
import { PreConditionComponent } from "@gitroom/frontend/components/layout/pre-condition.component"
import { AttachToFeedbackIcon } from "@gitroom/frontend/components/new-layout/sentry.feedback.component"
import { FirstBillingComponent } from "@gitroom/frontend/components/billing/first.billing.component"
import { LogoutComponent } from "@gitroom/frontend/components/layout/logout.component"

const jakartaSans = Plus_Jakarta_Sans({
  weight: ["600", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
})

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch()

  const { backendUrl, billingEnabled, isGeneral } = useVariables()

  // Feedback icon component attaches Sentry feedback to a top-bar icon when DSN is present
  const searchParams = useSearchParams()
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json()
  }, [])
  const { data: user, mutate } = useSWR("/user/self", load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  })

  const [dismissTrialBanner, setDismissTrialBanner] = useState(false)

  if (!user) return null

  const userTier = typeof user.tier === "string" ? user.tier : user.tier?.current
  const onFreePlan = userTier == "FREE"
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const showTrialBanner = !dismissTrialBanner && !!user.trialActive && trialDaysLeft > 0 && userTier === "FREE"
  const showTrialExpiredPaywall = userTier === "FREE" && !!user.trialEndsAt && !user.trialActive

  const appContent = (
    <MantineWrapper>
      <ToolTip />
      <Toaster />
      <CheckPayment check={searchParams.get("check") || ""} mutate={mutate}>
        <ShowMediaBoxModal />
        <ShowLinkedinCompany />
        <MediaSettingsLayout />
        <ShowPostSelector />
        <PreConditionComponent />
        <NewSubscription />
        <ContinueProvider />
        <div className={clsx("flex flex-col min-h-screen min-w-screen text-newTextColor p-[12px]", jakartaSans.className)}>
          <div>{user?.admin ? <Impersonate /> : <div />}</div>
          {showTrialBanner && (
            <div className="fixed top-[12px] left-1/2 -translate-x-1/2 z-[20] w-fit max-w-[calc(100vw-24px)] px-[16px] py-[10px] rounded-[10px] bg-newBgColorInner border border-newTableBorder text-[14px] inline-flex items-center gap-[10px] text-center shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
              <div>
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your free trial.
              </div>
              <a className="underline font-[600] hover:text-newTextColor" href="/billing">
                Upgrade now
              </a>
              <button
                type="button"
                className="ml-[6px] text-[16px] leading-[16px] text-textItemBlur hover:text-newTextColor"
                onClick={() => setDismissTrialBanner(true)}
                aria-label="Close trial banner"
              >
                ×
              </button>
            </div>
          )}
          {showTrialExpiredPaywall && isGeneral && billingEnabled ? (
            <FirstBillingComponent />
          ) : (
            <div className="flex-1 flex gap-[8px]">
              <Support />
              <div className="flex flex-col bg-newBgColorInner w-[80px] rounded-[12px]">
                <div
                className={clsx(
                  "fixed h-full w-[64px] start-[17px] flex flex-1 top-0",
                  user?.admin && "pt-[60px] max-h-[1000px]:w-[500px]",
                )}
              >
                  <div className="flex flex-col h-full gap-[32px] flex-1 py-[12px]">
                    <Logo />
                    <TopMenu />
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-newBgLineColor rounded-[12px] overflow-hidden flex flex-col gap-[1px] blurMe">
                <div className="flex bg-newBgColorInner h-[80px] px-[20px] items-center">
                  <div className="text-[24px] font-[600] flex flex-1">
                    <Title />
                  </div>
                  <div className="flex gap-[20px] text-textItemBlur">
                    <StreakComponent />
                    <div className="w-[1px] h-[20px] bg-blockSeparator" />
                    <OrganizationSelector />
                    <div className="hover:text-newTextColor">
                      <ModeComponent />
                    </div>
                    <div className="w-[1px] h-[20px] bg-blockSeparator" />
                    <LanguageComponent />
                    {/* <ChromeExtensionComponent /> */}
                    <div className="w-[1px] h-[20px] bg-blockSeparator" />
                    <AttachToFeedbackIcon />
                    <NotificationComponent />
                    <div className="w-[1px] h-[20px] bg-blockSeparator" />
                    <LogoutComponent compact className="text-[13px]" />
                  </div>
                </div>
                <div className="flex flex-1 gap-[1px]">{children}</div>
              </div>
            </div>
          )}
        </div>
      </CheckPayment>
    </MantineWrapper>
  )

  return (
    <ContextWrapper user={user}>
      <CopilotKit credentials="include" runtimeUrl={backendUrl + "/copilot/chat"} showDevConsole={false}>
        {appContent}
      </CopilotKit>
    </ContextWrapper>
  )
}
