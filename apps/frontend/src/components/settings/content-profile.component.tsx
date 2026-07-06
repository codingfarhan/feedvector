"use client"

import { useEffect, useMemo, useState } from "react"
import { useSWRConfig } from "swr"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { useToaster } from "@gitroom/react/toaster/toaster"
import { useIntegrationList } from "@gitroom/frontend/components/launches/helpers/use.integration.list"

const roleOptions = ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer", "Job seeker / career professional"]
const companyRoleOptions = [
  "an accounting services firm",
  "a legal services firm",
  "a marketing agency",
  "a consulting services firm",
  "a software company",
  "a SaaS company",
  "an IT services company",
  "a financial services firm",
  "a real estate business",
  "a healthcare practice",
  "an HR / recruiting firm",
  "an ecommerce brand",
  "a design studio",
  "a coaching business",
  "a B2B service provider",
  "a local services business",
]
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
const companyAudienceOptions = [
  "Small business owners",
  "Startup founders",
  "B2B companies",
  "Local businesses",
  "Professional services firms",
  "Marketing teams",
  "Sales teams",
  "Finance teams",
  "Operations leaders",
  "HR / recruiting teams",
  "Enterprise buyers",
  "Potential clients",
  "Industry partners",
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
const companyGoalOptions = goalOptions.filter((goal) => goal !== "Get job opportunities")

type IntegrationItem = {
  id: string
  name: string
  identifier: string
  picture?: string
  inBetweenSteps?: boolean
  onboardingRole?: string | null
  onboardingAudience?: string | null
  onboardingGoal?: string | null
}

const optionsWithCurrentValue = (options: string[], value: string) => (value && !options.includes(value) ? [value, ...options] : options)

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
  const { data: integrations = [] } = useIntegrationList()
  const linkedInIntegrations = useMemo(
    () => integrations.filter((integration: IntegrationItem) => ["linkedin", "linkedin-page"].includes(integration.identifier) && !integration.inBetweenSteps),
    [integrations],
  )
  const [selectedIntegrationId, setSelectedIntegrationId] = useState("")
  const selectedIntegration =
    linkedInIntegrations.find((integration: IntegrationItem) => integration.id === selectedIntegrationId) || linkedInIntegrations[0]
  const isCompanyPage = selectedIntegration?.identifier === "linkedin-page"
  const initialValues = useMemo(
    () => ({
      role: selectedIntegration?.onboardingRole || user?.onboardingPersonaOther || user?.onboardingPersona || "",
      audience: selectedIntegration?.onboardingAudience || user?.onboardingAudience || "",
      goal: selectedIntegration?.onboardingGoal || user?.onboardingGoal || "",
    }),
    [
      selectedIntegration?.onboardingAudience,
      selectedIntegration?.onboardingGoal,
      selectedIntegration?.onboardingRole,
      user?.onboardingAudience,
      user?.onboardingGoal,
      user?.onboardingPersona,
      user?.onboardingPersonaOther,
    ],
  )
  const resolvedRoleOptions = useMemo(
    () => optionsWithCurrentValue(isCompanyPage ? companyRoleOptions : roleOptions, initialValues.role),
    [initialValues.role, isCompanyPage],
  )
  const resolvedAudienceOptions = useMemo(
    () => optionsWithCurrentValue(isCompanyPage ? companyAudienceOptions : audienceOptions, initialValues.audience),
    [initialValues.audience, isCompanyPage],
  )
  const resolvedGoalOptions = useMemo(
    () => optionsWithCurrentValue(isCompanyPage ? companyGoalOptions : goalOptions, initialValues.goal),
    [initialValues.goal, isCompanyPage],
  )
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!selectedIntegrationId && linkedInIntegrations[0]?.id) {
      setSelectedIntegrationId(linkedInIntegrations[0].id)
    }
  }, [linkedInIntegrations, selectedIntegrationId])

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
        body: JSON.stringify({
          integrationId: selectedIntegration?.id,
          ...values,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || "Could not update content profile")
      }

      await mutate("/user/self")
      await mutate("/integrations/list")
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
        <p className="mt-[6px] text-[13px] leading-[20px] text-customColor18">
          Choose the LinkedIn identity whose content profile you want to edit.
        </p>
      </div>

      <div className="grid gap-[14px]">
        {linkedInIntegrations.length > 0 && (
          <label className="flex flex-col gap-[8px]">
            <span className="text-[13px] font-semibold text-newTextColor">LinkedIn identity</span>
            <select
              value={selectedIntegration?.id || ""}
              onChange={(event) => setSelectedIntegrationId(event.target.value)}
              className="h-[44px] rounded-[10px] border border-newTableBorder bg-newTableHeader px-[12px] text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]"
            >
              {linkedInIntegrations.map((integration: IntegrationItem) => (
                <option key={integration.id} value={integration.id}>
                  {integration.name} ({integration.identifier === "linkedin-page" ? "Company page" : "Personal profile"})
                </option>
              ))}
            </select>
          </label>
        )}
        <ProfileSelect
          label={isCompanyPage ? "Company type" : "Role"}
          value={values.role}
          options={resolvedRoleOptions}
          onChange={(role) => setValues((current) => ({ ...current, role }))}
        />
        <ProfileSelect
          label="Audience"
          value={values.audience}
          options={resolvedAudienceOptions}
          onChange={(audience) => setValues((current) => ({ ...current, audience }))}
        />
        <ProfileSelect label="Goal" value={values.goal} options={resolvedGoalOptions} onChange={(goal) => setValues((current) => ({ ...current, goal }))} />
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
