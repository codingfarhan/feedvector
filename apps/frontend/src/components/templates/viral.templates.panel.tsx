"use client"

import clsx from "clsx"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useToaster } from "@gitroom/react/toaster/toaster"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { useRouter } from "next/navigation"
import { useFireEvents } from "@gitroom/helpers/utils/use.fire.events"
import { Button } from "@gitroom/react/form/button"
import { categories, templates, type Template } from "@gitroom/frontend/components/templates/viral.templates.data"

const Chip = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "px-[12px] py-[8px] rounded-full text-[12px] font-[700] border transition-colors",
        active
          ? "bg-boxFocused text-textItemFocused border-newTableBorder"
          : "bg-newBgLineColor text-textItemBlur border-newTableBorder hover:text-textItemFocused hover:bg-boxHover",
      )}
    >
      {label}
    </button>
  )
}

const ViralTemplateCard = ({ tpl, onCopy }: { tpl: Template; onCopy: (tpl: Template) => void }) => {
  const [showExample, setShowExample] = useState(false)

  return (
    <div className="rounded-[14px] border border-newTableBorder bg-newBgColorInner overflow-hidden">
      <div className="p-[14px] flex items-start gap-[12px]">
        <div className="flex-1">
          <div className="flex items-center gap-[10px]">
            <div className="text-[14px] font-[800] text-newTextColor">{tpl.title}</div>
            <div className="text-[11px] font-[800] px-[10px] py-[4px] rounded-full bg-newBgLineColor text-textItemBlur border border-newTableBorder">
              {tpl.category}
            </div>
          </div>

          <div className="mt-[10px]" style={{ perspective: 1000 }}>
            <div
              className="relative h-[220px] transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: showExample ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 whitespace-pre-wrap text-[13px] leading-[1.55] text-newTextColor overflow-y-auto overflow-x-hidden scrollbar scrollbar-thumb-newColColor scrollbar-track-newBgColorInner pe-[8px]"
                style={{ backfaceVisibility: "hidden" }}
              >
                {tpl.template}
                <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-[22px] bg-gradient-to-b from-transparent to-newBgColorInner" />
              </div>
              <div
                className="absolute inset-0 whitespace-pre-wrap text-[13px] leading-[1.55] text-newTextColor overflow-y-auto overflow-x-hidden scrollbar scrollbar-thumb-newColColor scrollbar-track-newBgColorInner pe-[8px]"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {tpl.example}
                <div className="pointer-events-none sticky bottom-0 left-0 right-0 h-[22px] bg-gradient-to-b from-transparent to-newBgColorInner" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[14px] pb-[14px] flex gap-[10px]">
        <button
          type="button"
          onClick={() => onCopy(tpl)}
          className="flex-1 h-[40px] rounded-[10px] bg-btnSimple text-btnText text-[13px] font-[800] hover:bg-boxHover transition-colors"
        >
          Copy Template
        </button>
        <button
          type="button"
          onClick={() => setShowExample((v) => !v)}
          className={clsx(
            "h-[40px] px-[14px] rounded-[10px] border border-newTableBorder text-[13px] font-[800] transition-colors",
            showExample ? "bg-boxFocused text-textItemFocused hover:opacity-90" : "bg-newBgLineColor text-newTextColor hover:bg-boxHover",
          )}
        >
          {showExample ? "See Template" : "See Example"}
        </button>
      </div>
    </div>
  )
}

const LockedTemplateCard = ({ tpl, onUpgrade }: { tpl: Template; onUpgrade: () => void }) => {
  return (
    <button
      type="button"
      onClick={onUpgrade}
      className="text-left rounded-[14px] border border-newTableBorder bg-newBgColorInner overflow-hidden relative hover:bg-boxHover transition-colors"
    >
      <div className="p-[14px] blur-sm pointer-events-none select-none">
        <div className="flex items-center gap-[10px]">
          <div className="text-[14px] font-[800] text-newTextColor">{tpl.title}</div>
          <div className="text-[11px] font-[800] px-[10px] py-[4px] rounded-full bg-newBgLineColor text-textItemBlur border border-newTableBorder">
            {tpl.category}
          </div>
        </div>
        <div className="mt-[10px] whitespace-pre-wrap text-[13px] leading-[1.55] text-newTextColor max-h-[220px] overflow-hidden">{tpl.template}</div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-newBgColorInner/90 border border-newTableBorder rounded-[12px] px-[18px] py-[14px] text-center max-w-[360px] shadow-lg">
          <div className="text-[15px] font-[800] text-newTextColor mb-[4px]">{`Locked`}</div>
          <div className="text-[13px] text-textItemBlur mb-[12px]">{`Upgrade to Pro to unlock this template.`}</div>
          <div className="flex justify-center pointer-events-none">
            <div className="px-[24px] h-[40px] rounded-[10px] bg-btnSimple text-btnText text-[13px] font-[800] flex items-center justify-center">
              {`Upgrade to Pro`}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

const LockedMoreCard = ({ count, onUpgrade }: { count: number; onUpgrade: () => void }) => {
  return (
    <button
      type="button"
      onClick={onUpgrade}
      className="text-left rounded-[14px] border border-newTableBorder bg-newBgColorInner overflow-hidden relative hover:bg-boxHover transition-colors p-[14px] flex flex-col"
    >
      <div className="text-[14px] font-[800] text-newTextColor">+{count} more templates</div>
      <div className="mt-[6px] text-[13px] text-textItemBlur flex-1">Unlock the full library with Pro.</div>
      <div className="mt-[12px] flex">
        <div className="px-[24px] h-[40px] rounded-[10px] bg-btnSimple text-btnText text-[13px] font-[800] flex items-center justify-center">
          Upgrade to Pro
        </div>
      </div>
    </button>
  )
}

export const ViralTemplatesPanel = () => {
  const t = useT()
  const toaster = useToaster()
  const user = useUser()
  const router = useRouter()
  const fireEvents = useFireEvents()

  const [category, setCategory] = useState<string>("All")

  const userTier = typeof user?.tier === "string" ? user.tier : user?.tier?.current
  const onFreePlan = userTier === "FREE"
  const blockForTrial = !!user?.trialActive
  const shouldLimitTemplates = onFreePlan || blockForTrial

  const freeUnlockedCount = 6
  const freeLockedPreviewCount = 6

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      if (category === "All") return true
      return tpl.category === category
    })
  }, [category])

  const gated = useMemo(() => {
    if (!shouldLimitTemplates) {
      return {
        unlocked: filteredTemplates,
        lockedPreview: [] as Template[],
        lockedRemaining: 0,
      }
    }

    const unlocked = filteredTemplates.slice(0, freeUnlockedCount)
    const lockedPreview = filteredTemplates.slice(freeUnlockedCount, freeUnlockedCount + freeLockedPreviewCount)
    const lockedRemaining = Math.max(0, filteredTemplates.length - freeUnlockedCount - freeLockedPreviewCount)

    return { unlocked, lockedPreview, lockedRemaining }
  }, [filteredTemplates, shouldLimitTemplates])

  const copyTemplate = useCallback(
    async (tpl: Template) => {
      try {
        await navigator.clipboard.writeText(tpl.template)
        toaster.show(t("template_copied", "Template copied to clipboard"), "success")
        fireEvents("template_used", {
          template_set: "viral",
          template_id: tpl.id,
          platform: tpl.platform,
          category: tpl.category,
          action: "copy",
        })
      } catch {
        toaster.show(t("template_copy_failed", "Could not copy template"), "warning")
      }
    },
    [toaster, t, fireEvents],
  )

  useEffect(() => {
    fireEvents("template_opened", { template_set: "viral" })
  }, [fireEvents])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-[20px] border-b border-newTableBorder">
        <div className="text-[18px] font-[800]">{t("viral_templates", "Viral Templates")}</div>
        <div className="mt-[4px] text-[13px] text-textItemBlur">
          {t("viral_templates_subtitle", "Select a tone and start from a proven LinkedIn post format.")}
        </div>

        <div className="mt-[18px] flex flex-wrap items-center gap-[8px]">
          {categories.map((c) => (
            <Chip key={c} label={c} active={c === category} onClick={() => setCategory(c)} />
          ))}
        </div>
      </div>

      <div className="flex-1 p-[20px] overflow-auto bg-newBgLineColor scrollbar scrollbar-thumb-fifth scrollbar-track-newBgColor">
        {shouldLimitTemplates && (
          <div className="mb-[12px] rounded-[12px] border border-newTableBorder bg-newBgColorInner p-[14px] flex flex-col sm:flex-row gap-[12px] sm:items-center">
            <div className="flex-1">
              <div className="text-[14px] font-[700] text-newTextColor">{t("templates_limited_title", "Templates Limited on Free Plan")}</div>
              <div className="text-[13px] text-textItemBlur">
                {t("templates_limited_desc", "Upgrade to Pro to unlock all templates. Some templates are locked on Free/Trial.")}
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              <Button className="w-full sm:w-auto" onClick={() => router.push("/billing")}>
                {t("upgrade_to_pro", "Upgrade to Pro")}
              </Button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[12px]">
          {gated.unlocked.map((tpl) => (
            <ViralTemplateCard key={tpl.id} tpl={tpl} onCopy={copyTemplate} />
          ))}
          {gated.lockedPreview.map((tpl) => (
            <LockedTemplateCard key={tpl.id} tpl={tpl} onUpgrade={() => router.push("/billing")} />
          ))}
          {gated.lockedRemaining > 0 && <LockedMoreCard count={gated.lockedRemaining} onUpgrade={() => router.push("/billing")} />}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-[14px] text-textItemBlur">{t("no_templates", "No templates in this category yet.")}</div>
        )}
      </div>
    </div>
  )
}
