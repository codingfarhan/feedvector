"use client"

import { useEffect, useMemo, useState } from "react"
import { useSWRConfig } from "swr"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { useToaster } from "@gitroom/react/toaster/toaster"

const roleOptions = ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer", "Job seeker / career professional"]
const audienceOptions = [
  "Founders",
  "Business owners",
  "Marketers",
  "Sales professionals",
  "Recruiters / hiring managers",
  "Developers / technical people",
  "Creators",
  "Consultants / freelancers",
  "Potential clients",
  "Industry peers",
]
const goalOptions = [
  "Get inbound leads",
  "Build authority",
  "Grow my audience",
  "Promote my product/service",
  "Get job opportunities",
  "Build network",
  "Recruit / hire talent",
]

const ProfileSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) => (
  <label className="flex flex-col gap-[8px]">
    <span className="text-[13px] font-semibold text-newTextColor">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-[44px] rounded-[10px] border border-newTableBorder bg-newTableHeader px-[12px] text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]"
    >
      <option value="" disabled>
        Select {label.toLowerCase()}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)

export const ContentProfileComponent = () => {
  const user = useUser()
  const fetch = useFetch()
  const toaster = useToaster()
  const { mutate } = useSWRConfig()
  const initialValues = useMemo(
    () => ({
      role: user?.onboardingPersonaOther || user?.onboardingPersona || "",
      audience: user?.onboardingAudience || "",
      goal: user?.onboardingGoal || "",
    }),
    [user?.onboardingAudience, user?.onboardingGoal, user?.onboardingPersona, user?.onboardingPersonaOther],
  )
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const changed = values.role !== initialValues.role || values.audience !== initialValues.audience || values.goal !== initialValues.goal
  const canSave = changed && values.role && values.audience && values.goal && !saving

  const save = async () => {
    if (!canSave) return

    setSaving(true)
    try {
      const response = await fetch("/settings/content-profile", {
        method: "POST",
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || "Could not update content profile")
      }

      await mutate("/user/self")
      toaster.show("Content profile updated", "success")
    } catch (error: any) {
      toaster.show(error?.message || "Could not update content profile", "warning")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px] text-newTextColor">
      <div className="mb-[18px]">
        <h2 className="text-[20px] font-semibold">Content profile</h2>
      </div>

      <div className="grid gap-[14px]">
        <ProfileSelect label="Role" value={values.role} options={roleOptions} onChange={(role) => setValues((current) => ({ ...current, role }))} />
        <ProfileSelect
          label="Audience"
          value={values.audience}
          options={audienceOptions}
          onChange={(audience) => setValues((current) => ({ ...current, audience }))}
        />
        <ProfileSelect label="Goal" value={values.goal} options={goalOptions} onChange={(goal) => setValues((current) => ({ ...current, goal }))} />
      </div>

      <div className="mt-[18px] flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!canSave}
          className="h-[42px] rounded-[10px] bg-[#8b5cf6] px-[16px] text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-newTableBorder disabled:text-customColor18"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  )
}
