"use client"

import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { Logo } from "@gitroom/frontend/components/new-layout/logo"
import { Plus_Jakarta_Sans } from "next/font/google"
const ModeComponent = dynamic(() => import("@gitroom/frontend/components/layout/mode.component"), {
  ssr: false,
})

import clsx from "clsx"
import dynamic from "next/dynamic"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { useVariables } from "@gitroom/react/helpers/variable.context"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
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
import { useMenuItem } from "@gitroom/frontend/components/layout/top.menu"
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

const MobileOrganizationDropdown = ({ currentOrgId }: { currentOrgId?: string }) => {
  const fetch = useFetch()

  const load = useCallback(async () => {
    return await (await fetch("/user/organizations")).json()
  }, [fetch])

  const { data: orgs, isLoading } = useSWR("organizations", load, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    revalidateOnReconnect: false,
  })

  const changeOrg = useCallback(
    async (orgId: string) => {
      if (!orgId || orgId === currentOrgId) return
      await fetch("/user/change-org", {
        method: "POST",
        body: JSON.stringify({ id: orgId }),
      })
      window.location.reload()
    },
    [currentOrgId, fetch],
  )

  if (isLoading || !orgs) {
    return (
      <div className="w-full h-[44px] px-[12px] rounded-[12px] bg-newTableHeader border border-newTableBorder text-textItemBlur flex items-center">
        Loading...
      </div>
    )
  }

  if (orgs.length <= 1) {
    const onlyOrg = orgs[0]
    return (
      <div className="w-full h-[44px] px-[12px] rounded-[12px] bg-newTableHeader border border-newTableBorder text-newTextColor flex items-center">
        {onlyOrg?.name || "Organization"}
      </div>
    )
  }

  return (
    <div className="w-full">
      <select
        value={currentOrgId || ""}
        onChange={(e) => changeOrg(e.target.value)}
        className="w-full h-[44px] px-[12px] rounded-[12px] bg-newTableHeader border border-newTableBorder text-newTextColor outline-none"
      >
        {orgs.map((org: { id: string; name: string }) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch()

  const { backendUrl, billingEnabled, isGeneral } = useVariables()
  const pathname = usePathname()

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return
    setMobileMenuOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [mobileMenuOpen])

  const { firstMenu, secondMenu } = useMenuItem()
  const visibleMenus = useMemo(() => {
    const filterItems = (items: any[]) =>
      items.filter((f) => {
        if (f.hide) return false
        if (f.requireBilling && !billingEnabled) return false
        if (f.name === "Billing" && user?.isLifetime) return false
        if (f.role) return f.role.includes(user?.role!)
        return true
      })

    const canShowFirstMenu =
      // @ts-ignore
      !!user?.orgId &&
      // @ts-ignore
      true

    return {
      first: canShowFirstMenu ? filterItems(firstMenu) : [],
      second: filterItems(secondMenu),
    }
  }, [firstMenu, secondMenu, billingEnabled, isGeneral, user])

  if (!user) return null

  const userTier = typeof user.tier === "string" ? user.tier : user.tier?.current
  const onFreePlan = userTier == "FREE"
  const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null
  const trialDaysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
  const showTrialBanner = !dismissTrialBanner && !!user.trialActive && trialDaysLeft > 0 && onFreePlan
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
            <div className="fixed top-[calc(env(safe-area-inset-top)+12px)] left-1/2 -translate-x-1/2 z-[20] w-[calc(100vw-24px)] sm:w-fit max-w-[calc(100vw-24px)] px-[14px] sm:px-[16px] py-[10px] rounded-[10px] bg-newBgColorInner border border-newTableBorder text-[13px] sm:text-[14px] flex flex-col sm:flex-row items-start sm:items-center gap-[8px] sm:gap-[10px] text-left sm:text-center shadow-[0_6px_20px_rgba(0,0,0,0.2)] relative pr-[44px] sm:pr-[16px]">
              <div className="leading-[18px] sm:leading-normal">
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your free trial.
              </div>
              <a className="underline font-[600] hover:text-newTextColor block sm:inline" href="/billing">
                Upgrade now
              </a>
              <button
                type="button"
                className="absolute top-[8px] right-[10px] sm:static sm:ml-[6px] text-[18px] leading-[18px] text-textItemBlur hover:text-newTextColor"
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
              <div className="hidden sm:flex flex-col bg-newBgColorInner w-[80px] rounded-[12px]">
                <div className={clsx("fixed h-full w-[64px] start-[17px] flex flex-1 top-0", user?.admin && "pt-[60px] max-h-[1000px]:w-[500px]")}>
                  <div className="flex flex-col h-full gap-[32px] flex-1 py-[12px]">
                    <Logo />
                    <TopMenu />
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-newBgLineColor rounded-[12px] overflow-hidden flex flex-col gap-[1px] blurMe">
                {/* Mobile header */}
                <div className="sm:hidden flex bg-newBgColorInner h-[56px] px-[14px] items-center gap-[10px]">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                    className="h-[40px] w-[40px] flex items-center justify-center rounded-[10px] text-textItemBlur hover:text-newTextColor hover:bg-boxFocused"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-[700] truncate">
                      <Title />
                    </div>
                  </div>
                  <div className="flex items-center gap-[12px] text-textItemBlur">
                    <OrganizationSelector />
                  </div>
                </div>

                {/* Desktop header */}
                <div className="hidden sm:flex bg-newBgColorInner h-[80px] px-[20px] items-center">
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
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[200] bg-newBgColorInner text-newTextColor sm:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="h-[56px] px-[14px] flex items-center gap-[10px] border-b border-newTableBorder">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="h-[40px] w-[40px] flex items-center justify-center rounded-[10px] text-textItemBlur hover:text-newTextColor hover:bg-boxFocused"
              >
                <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[16px] font-[700] truncate">
                  <Title />
                </div>
              </div>
              <div className="flex items-center gap-[12px] text-textItemBlur">
                <NotificationComponent />
                <div className="hover:text-newTextColor">
                  <ModeComponent />
                </div>
              </div>
            </div>

            <div className="px-[14px] py-[14px] overflow-y-auto h-[calc(100dvh-56px)]">
              <div className="pb-[14px]">
                <div className="text-[12px] uppercase tracking-wide text-textItemBlur mb-[10px]">Organization</div>
                <div className="flex items-center gap-[12px]">
                  <MobileOrganizationDropdown currentOrgId={user?.orgId} />
                </div>
              </div>

              {visibleMenus.first.length > 0 && (
                <div className="pb-[18px]">
                  <div className="text-[12px] uppercase tracking-wide text-textItemBlur mb-[10px]">Menu</div>
                  <div className="flex flex-col gap-[8px]">
                    {visibleMenus.first.map((item: any) => {
                      const isActive = pathname.indexOf(item.path) === 0
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={clsx(
                            "w-full flex items-center gap-[12px] px-[14px] py-[12px] rounded-[14px] border border-transparent",
                            isActive ? "bg-boxFocused text-newTextColor border-newTableBorder" : "bg-newTableHeader text-textItemBlur",
                          )}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <div className="text-[16px] font-[600] truncate">{item.name}</div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {visibleMenus.second.length > 0 && (
                <div className="pb-[18px]">
                  <div className="text-[12px] uppercase tracking-wide text-textItemBlur mb-[10px]">More</div>
                  <div className="flex flex-col gap-[8px]">
                    {visibleMenus.second.map((item: any) => {
                      const isActive = pathname.indexOf(item.path) === 0
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className={clsx(
                            "w-full flex items-center gap-[12px] px-[14px] py-[12px] rounded-[14px] border border-transparent",
                            isActive ? "bg-boxFocused text-newTextColor border-newTableBorder" : "bg-newTableHeader text-textItemBlur",
                          )}
                        >
                          <div className="shrink-0">{item.icon}</div>
                          <div className="text-[16px] font-[600] truncate">{item.name}</div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="pt-[10px] border-t border-newTableBorder">
                <div className="text-[12px] uppercase tracking-wide text-textItemBlur mb-[10px]">Account</div>
                <div className="flex items-center justify-between gap-[12px] bg-newTableHeader rounded-[14px] px-[14px] py-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <AttachToFeedbackIcon />
                    <LanguageComponent />
                  </div>
                  <LogoutComponent className="text-[14px]" />
                </div>
              </div>
            </div>
          </div>
        )}
        {appContent}
      </CopilotKit>
    </ContextWrapper>
  )
}
