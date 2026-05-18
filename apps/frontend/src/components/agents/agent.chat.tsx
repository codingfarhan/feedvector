"use client"

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { CopilotChat, CopilotKitCSSProperties } from "@copilotkit/react-ui"
import { InputProps, UserMessageProps } from "@copilotkit/react-ui/dist/components/chat/props"
import { Input } from "@gitroom/frontend/components/agents/agent.input"
import { useModals } from "@gitroom/frontend/components/layout/new-modal"
import { CopilotKit, useCopilotAction, useCopilotMessagesContext } from "@copilotkit/react-core"
import { MediaPortal, PropertiesContext } from "@gitroom/frontend/components/agents/agent"
import { useVariables } from "@gitroom/react/helpers/variable.context"
import { useParams, useRouter } from "next/navigation"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { TextMessage } from "@copilotkit/runtime-client-gql"
import { AddEditModal } from "@gitroom/frontend/components/new-launch/add.edit.modal"
import dayjs from "dayjs"
import { makeId } from "@gitroom/nestjs-libraries/services/make.is"
import { ExistingDataContextProvider } from "@gitroom/frontend/components/launches/helpers/use.existing.data"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { Button } from "@gitroom/react/form/button"
import { useFireEvents } from "@gitroom/helpers/utils/use.fire.events"

export const AgentChat: FC = () => {
  const { backendUrl } = useVariables()
  const params = useParams<{ id: string }>()
  const { properties } = useContext(PropertiesContext)
  const t = useT()
  const user = useUser()
  const router = useRouter()
  const onFreePlan = user?.tier.current == "FREE"
  const blockForTrial = !!user?.trialActive
  const shouldBlock = onFreePlan || blockForTrial

  if (shouldBlock) {
    return (
      <div className="trz agent bg-newBgColorInner flex flex-col gap-[15px] transition-all flex-1 items-center relative">
        <div className="absolute left-0 w-full h-full pb-[20px]">
          <div className="w-full h-full flex flex-col gap-[16px] p-[20px] blur-sm pointer-events-none select-none">
            <div className="text-[18px] font-medium text-newTableText">{t("your_assistant", "Your Assistant")}</div>
            <div className="flex flex-col gap-[12px]">
              <div className="max-w-[70%] bg-newTableHeader border border-newTableBorder rounded-[12px] px-[12px] py-[10px] text-[14px]">
                {t("agent_mock_prompt", "Draft a launch post for our new feature and schedule it for LinkedIn and X.")}
              </div>
              <div className="max-w-[70%] self-end bg-btnPrimary/20 border border-newTableBorder rounded-[12px] px-[12px] py-[10px] text-[14px]">
                {t("agent_mock_reply", "Here is a ready-to-post draft with a suggested image prompt.")}
              </div>
              <div className="max-w-[70%] bg-newTableHeader border border-newTableBorder rounded-[12px] px-[12px] py-[10px] text-[14px]">
                {t("agent_mock_followup", "Can you also generate a short caption and hashtags?")}
              </div>
            </div>
            <div className="mt-auto h-[48px] rounded-[10px] bg-newTableHeader border border-newTableBorder" />
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-newBgColorInner/90 border border-newTableBorder rounded-[12px] px-[24px] py-[20px] text-center max-w-[460px] shadow-lg">
            <div className="text-[20px] font-semibold mb-[6px]">
              {t("upgrade_to_use_agent", "Upgrade to Pro to use the AI Agent for managing social media")}
            </div>
            <div className="text-[14px] text-newTableText mb-[16px]">
              {t("trial_agent_cta", "Create posts, schedule content, and automate workflows with your AI assistant.")}
            </div>
            <div className="flex justify-center">
              <Button onClick={() => router.push("/billing")}>{t("upgrade_to_pro", "Upgrade to Pro")}</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CopilotKit
      {...(params.id === "new" ? {} : { threadId: params.id })}
      credentials="include"
      runtimeUrl={backendUrl + "/copilot/agent"}
      showDevConsole={false}
      agent="feedvector"
      properties={{
        integrations: properties,
      }}
    >
      <OpenEvent id={params.id} />
      <Hooks />
      <LoadMessages id={params.id} />
      <div
        style={
          {
            "--copilot-kit-primary-color": "var(--new-btn-text)",
            "--copilot-kit-background-color": "var(--new-bg-color)",
          } as CopilotKitCSSProperties
        }
        className="trz agent bg-newBgColorInner flex flex-col gap-[15px] transition-all flex-1 items-center relative"
      >
        <div className="absolute left-0 w-full h-full pb-[20px]">
          <CopilotChat
            className="w-full h-full"
            labels={{
              title: t("your_assistant", "Your Assistant"),
              initial: t(
                "agent_welcome_message",
                `Hello, I am your FeedVector agent 🙌🏻.
              
I can schedule a post or multiple posts to multiple channels and generate pictures and videos.

You can select the channels you want to use from the left menu.

You can see your previous conversations from the right menu.

You can also use me as an MCP Server, check Settings >> Public API
`,
              ),
            }}
            UserMessage={Message}
            Input={NewInput}
          />
        </div>
      </div>
    </CopilotKit>
  )
}

const OpenEvent: FC<{ id: string }> = ({ id }) => {
  const fireEvents = useFireEvents()
  useEffect(() => {
    fireEvents("agent_chat_opened", { threadId: id })
  }, [fireEvents, id])
  return null
}

const LoadMessages: FC<{ id: string }> = ({ id }) => {
  const { setMessages } = useCopilotMessagesContext()
  const fetch = useFetch()

  const loadMessages = useCallback(async (idToSet: string) => {
    const data = await (await fetch(`/copilot/${idToSet}/list`)).json()
    setMessages(
      data.uiMessages.map((p: any) => {
        return new TextMessage({
          content: p.content,
          role: p.role,
        })
      }),
    )
  }, [])

  useEffect(() => {
    if (id === "new") {
      setMessages([])
      return
    }
    loadMessages(id)
  }, [id])

  return null
}

const Message: FC<UserMessageProps> = (props) => {
  const convertContentToImagesAndVideo = useMemo(() => {
    return (props.message?.content || "")
      .replace(/Video: (http.*mp4\n)/g, (match, p1) => {
        return `<video controls class="h-[150px] w-[150px] rounded-[8px] mb-[10px]"><source src="${p1.trim()}" type="video/mp4">Your browser does not support the video tag.</video>`
      })
      .replace(/Image: (http.*\n)/g, (match, p1) => {
        return `<img src="${p1.trim()}" class="h-[150px] w-[150px] max-w-full border border-newBgColorInner" />`
      })
      .replace(/\[\-\-Media\-\-\](.*)\[\-\-Media\-\-\]/g, (match, p1) => {
        return `<div class="flex justify-center mt-[20px]">${p1}</div>`
      })
      .replace(/(\[--integrations--\][\s\S]*?\[--integrations--\])/g, (match, p1) => {
        return ``
      })
  }, [props.message?.content])
  return (
    <div
      className="copilotKitMessage copilotKitUserMessage max-w-full break-words"
      dangerouslySetInnerHTML={{ __html: convertContentToImagesAndVideo }}
    />
  )
}
const NewInput: FC<InputProps> = (props) => {
  const [media, setMedia] = useState([] as { path: string; id: string }[])
  const [value, setValue] = useState("")
  const { properties } = useContext(PropertiesContext)
  const params = useParams<{ id: string }>()
  const fireEvents = useFireEvents()
  return (
    <>
      <MediaPortal value={value} media={media} setMedia={(e) => setMedia(e.target.value)} />
      <Input
        {...props}
        onChange={setValue}
        onSend={(text) => {
          fireEvents("agent_message_sent", {
            threadId: params.id,
            chars: text.length,
            has_media: media.length > 0,
            integrations_count: properties.length,
          })
          const send = props.onSend(
            text +
              (media.length > 0
                ? "\n[--Media--]" +
                  media.map((m) => ((m.path || "").toLowerCase().includes(".mp4") ? `Video: ${m.path}` : `Image: ${m.path}`)).join("\n") +
                  "\n[--Media--]"
                : "") +
              `
${
  properties.length
    ? `[--integrations--]
Use the following social media platforms: ${JSON.stringify(
        properties.map((p) => ({
          id: p.id,
          platform: p.identifier,
          profilePicture: p.picture,
          additionalSettings: p.additionalSettings,
        })),
      )}
[--integrations--]`
    : ``
}`,
          )
          setValue("")
          setMedia([])
          return send
        }}
      />
    </>
  )
}

export const Hooks: FC = () => {
  const modals = useModals()

  useCopilotAction({
    name: "manualPosting",
    description: "This tool should be triggered when the user wants to manually add the generated post",
    parameters: [
      {
        name: "list",
        type: "object[]",
        description: "list of posts to schedule to different social media (integration ids)",
        attributes: [
          {
            name: "integrationId",
            type: "string",
            description: "The integration id",
          },
          {
            name: "date",
            type: "string",
            description: "UTC date of the scheduled post",
          },
          {
            name: "settings",
            type: "object",
            description: "Settings for the integration [input:settings]",
          },
          {
            name: "posts",
            type: "object[]",
            description: "list of posts / comments (one under another)",
            attributes: [
              {
                name: "content",
                type: "string",
                description: "the content of the post",
              },
              {
                name: "attachments",
                type: "object[]",
                description: "list of attachments",
                attributes: [
                  {
                    name: "id",
                    type: "string",
                    description: "id of the attachment",
                  },
                  {
                    name: "path",
                    type: "string",
                    description: "url of the attachment",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    renderAndWaitForResponse: ({ args, status, respond }) => {
      if (status === "executing") {
        return <OpenModal args={args} respond={respond} />
      }

      return null
    },
  })
  return null
}

const OpenModal: FC<{
  respond: (value: any) => void
  args: {
    list: {
      integrationId: string
      date: string
      settings?: Record<string, any>
      posts: { content: string; attachments: { id: string; path: string }[] }[]
    }[]
  }
}> = ({ args, respond }) => {
  const modals = useModals()
  const { properties } = useContext(PropertiesContext)
  const startModal = useCallback(async () => {
    for (const integration of args.list) {
      await new Promise((res) => {
        const group = makeId(10)
        modals.openModal({
          id: "add-edit-modal",
          closeOnClickOutside: false,
          removeLayout: true,
          closeOnEscape: false,
          withCloseButton: false,
          askClose: true,
          size: "80%",
          title: ``,
          classNames: {
            modal: "w-[100%] max-w-[1400px] text-textColor",
          },
          children: (
            <ExistingDataContextProvider
              value={{
                group,
                integration: integration.integrationId,
                integrationPicture: properties.find((p) => p.id === integration.integrationId).picture || "",
                settings: integration.settings || {},
                posts: integration.posts.map((p) => ({
                  approvedSubmitForOrder: "NO",
                  content: p.content,
                  createdAt: new Date().toISOString(),
                  state: "DRAFT",
                  id: makeId(10),
                  settings: JSON.stringify(integration.settings || {}),
                  group,
                  integrationId: integration.integrationId,
                  integration: properties.find((p) => p.id === integration.integrationId),
                  publishDate: dayjs.utc(integration.date).toISOString(),
                  image: p.attachments.map((a) => ({
                    id: a.id,
                    path: a.path,
                  })),
                })),
              }}
            >
              <AddEditModal
                date={dayjs.utc(integration.date)}
                allIntegrations={properties}
                integrations={properties.filter((p) => p.id === integration.integrationId)}
                onlyValues={integration.posts.map((p) => ({
                  content: p.content,
                  id: makeId(10),
                  settings: integration.settings || {},
                  image: p.attachments.map((a) => ({
                    id: a.id,
                    path: a.path,
                  })),
                }))}
                reopenModal={() => {}}
                mutate={() => res(true)}
              />
            </ExistingDataContextProvider>
          ),
        })
      })
    }

    respond("User scheduled all the posts")
  }, [args, respond, properties])

  useEffect(() => {
    startModal()
  }, [])
  return <div onClick={() => respond("continue")}>Opening manually ${JSON.stringify(args)}</div>
}
