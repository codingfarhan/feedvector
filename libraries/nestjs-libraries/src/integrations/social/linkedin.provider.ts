import {
  AnalyticsData,
  AuthTokenDetails,
  PostDetails,
  PostResponse,
  SocialProvider,
} from "@gitroom/nestjs-libraries/integrations/social/social.integrations.interface"
import { makeId } from "@gitroom/nestjs-libraries/services/make.is"
import sharp from "sharp"
import { lookup } from "mime-types"
import { readOrFetch } from "@gitroom/helpers/utils/read.or.fetch"
import { SocialAbstract } from "@gitroom/nestjs-libraries/integrations/social.abstract"
import { Integration } from "@prisma/client"
import { PostPlug } from "@gitroom/helpers/decorators/post.plug"
import { LinkedinDto } from "@gitroom/nestjs-libraries/dtos/posts/providers-settings/linkedin.dto"
import imageToPDF from "image-to-pdf"
import { Readable } from "stream"
import { Rules } from "@gitroom/nestjs-libraries/chat/rules.description.decorator"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import {
  LINKEDIN_ANALYTICS_HOOK_STYLES,
  LINKEDIN_ANALYTICS_TOPICS,
  OpenaiService,
} from "@gitroom/nestjs-libraries/openai/openai.service"

dayjs.extend(utc)

type LinkedinProfilePost = {
  article_target_url?: string
  article_title?: string
  document?: { page_count?: number; title?: string; url?: string }
  images?: { url: string }[]
  num_appreciations?: number
  num_comments?: number
  num_empathy?: number
  num_entertainments?: number
  num_interests?: number
  num_likes?: number
  num_maybe?: number
  num_praises?: number
  num_reactions?: number
  num_reposts?: number
  post_url?: string
  posted?: string
  repost_stats?: Partial<LinkedinProfilePost>
  reposted?: string
  reshared?: boolean
  resharer_comment?: string
  text?: string
  urn?: string
  url?: string
  video?: { duration?: number; stream_url?: string }
}

type LinkedinProfilePerformancePost = {
  post: LinkedinProfilePost
  stats: Partial<LinkedinProfilePost>
  date: string
  text: string
  reshared: boolean
}

type LinkedinAnalyticsPostClassification = {
  hookStyle: (typeof LINKEDIN_ANALYTICS_HOOK_STYLES)[number]
  topic: (typeof LINKEDIN_ANALYTICS_TOPICS)[number]
  confidence?: "Low" | "Medium" | "High"
}

const linkedinAnalyticsOpenaiService = new OpenaiService()

@Rules(
  "LinkedIn can have maximum one attachment when selecting video, when choosing a carousel on LinkedIn minimum amount of attachment must be two, and only pictures, if uploading a video, LinkedIn can have only one attachment",
)
export class LinkedinProvider extends SocialAbstract implements SocialProvider {
  identifier = "linkedin"
  name = "LinkedIn"
  oneTimeToken = true

  isBetweenSteps = false
  scopes = ["openid", "profile", "w_member_social", "r_basicprofile", "rw_organization_admin", "w_organization_social", "r_organization_social"]
  override maxConcurrentJob = 2 // LinkedIn has professional posting limits
  refreshWait = true
  editor = "normal" as const
  maxLength() {
    return 3000
  }

  override handleErrors(body: string): { type: "refresh-token" | "bad-body" | "retry"; value: string } | undefined {
    if (body.indexOf("Unable to obtain activity") > -1) {
      return {
        type: "retry",
        value: "Unable to obtain activity",
      }
    }

    if (body.indexOf("resource is forbidden") > -1) {
      return {
        type: "retry",
        value: "Resource is forbidden",
      }
    }

    return undefined
  }

  async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in,
    } = await (
      await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token,
          client_id: process.env.LINKEDIN_CLIENT_ID!,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        }),
      })
    ).json()

    const { vanityName } = await (
      await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()

    const {
      name,
      sub: id,
      picture,
    } = await (
      await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()

    return {
      id,
      accessToken,
      refreshToken,
      expiresIn: expires_in,
      name,
      picture: picture || "",
      username: vanityName,
    }
  }

  async generateAuthUrl() {
    const state = makeId(6)
    const codeVerifier = makeId(30)
    const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${
      process.env.LINKEDIN_CLIENT_ID
    }&prompt=none&redirect_uri=${encodeURIComponent(
      `${process.env.FRONTEND_URL}/integrations/social/linkedin`,
    )}&state=${state}&scope=${encodeURIComponent(this.scopes.join(" "))}`
    return {
      url,
      codeVerifier,
      state,
    }
  }

  async authenticate(params: { code: string; codeVerifier: string; refresh?: string }) {
    const body = new URLSearchParams()
    body.append("grant_type", "authorization_code")
    body.append("code", params.code)
    body.append("redirect_uri", `${process.env.FRONTEND_URL}/integrations/social/linkedin${params.refresh ? `?refresh=${params.refresh}` : ""}`)
    body.append("client_id", process.env.LINKEDIN_CLIENT_ID!)
    body.append("client_secret", process.env.LINKEDIN_CLIENT_SECRET!)

    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
      scope,
    } = await (
      await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      })
    ).json()

    this.checkScopes(this.scopes, scope)

    const {
      name,
      sub: id,
      picture,
    } = await (
      await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()

    const { vanityName } = await (
      await fetch("https://api.linkedin.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()

    return {
      id,
      accessToken,
      refreshToken,
      expiresIn,
      name,
      picture,
      username: vanityName,
    }
  }

  async company(token: string, data: { url: string }) {
    const { url } = data
    const getCompanyVanity = url.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company\/([^/]+)\/?$/)
    if (!getCompanyVanity || !getCompanyVanity?.length) {
      throw new Error("Invalid LinkedIn company URL")
    }

    const { elements } = await (
      await fetch(`https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${getCompanyVanity[1]}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": "202601",
          Authorization: `Bearer ${token}`,
        },
      })
    ).json()

    return {
      options: elements.map((e: { localizedName: string; id: string }) => ({
        label: e.localizedName,
        value: `@[${e.localizedName}](urn:li:organization:${e.id})`,
      }))?.[0],
    }
  }

  protected async uploadPicture(fileName: string, accessToken: string, personId: string, picture: any, type = "personal" as "company" | "personal") {
    // Determine the appropriate endpoint based on file type
    const isVideo = fileName.indexOf("mp4") > -1
    const isPdf = fileName.toLowerCase().indexOf("pdf") > -1

    let endpoint: string
    if (isVideo) {
      endpoint = "videos"
    } else if (isPdf) {
      endpoint = "documents"
    } else {
      endpoint = "images"
    }

    const {
      value: { uploadUrl, image, video, document, uploadInstructions, ...all },
    } = await (
      await this.fetch(`https://api.linkedin.com/rest/${endpoint}?action=initializeUpload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": "202601",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          initializeUploadRequest: {
            owner: type === "personal" ? `urn:li:person:${personId}` : `urn:li:organization:${personId}`,
            ...(isVideo
              ? {
                  fileSizeBytes: picture.length,
                  uploadCaptions: false,
                  uploadThumbnail: false,
                }
              : {}),
          },
        }),
      })
    ).json()

    const sendUrlRequest = uploadInstructions?.[0]?.uploadUrl || uploadUrl
    const finalOutput = video || image || document

    const etags = []
    for (let i = 0; i < picture.length; i += 1024 * 1024 * 2) {
      const upload = await this.fetch(
        sendUrlRequest,
        {
          method: "PUT",
          headers: {
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202601",
            Authorization: `Bearer ${accessToken}`,
            ...(isVideo ? { "Content-Type": "application/octet-stream" } : isPdf ? { "Content-Type": "application/pdf" } : {}),
          },
          body: picture.slice(i, i + 1024 * 1024 * 2),
        },
        "linkedin",
        0,
        true,
      )

      etags.push(upload.headers.get("etag"))
    }

    if (isVideo) {
      const a = await this.fetch("https://api.linkedin.com/rest/videos?action=finalizeUpload", {
        method: "POST",
        body: JSON.stringify({
          finalizeUploadRequest: {
            video,
            uploadToken: "",
            uploadedPartIds: etags,
          },
        }),
        headers: {
          "X-Restli-Protocol-Version": "2.0.0",
          "LinkedIn-Version": "202601",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
    }

    return finalOutput
  }

  protected fixText(text: string) {
    const pattern = /@\[.+?]\(urn:li:organization.+?\)/g
    const matches = text.match(pattern) || []
    const splitAll = text.split(pattern)
    const splitTextReformat = splitAll.map((p) => {
      return p
        .replace(/\\/g, "\\\\")
        .replace(/</g, "\\<")
        .replace(/>/g, "\\>")
        .replace(/#/g, "\\#")
        .replace(/~/g, "\\~")
        .replace(/_/g, "\\_")
        .replace(/\|/g, "\\|")
        .replace(/\[/g, "\\[")
        .replace(/]/g, "\\]")
        .replace(/\*/g, "\\*")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)")
        .replace(/\{/g, "\\{")
        .replace(/}/g, "\\}")
        .replace(/@/g, "\\@")
    })

    const connectAll = splitTextReformat.reduce((all, current) => {
      const match = matches.shift()
      all.push(current)
      if (match) {
        all.push(match)
      }
      return all
    }, [] as string[])

    return connectAll.join("")
  }

  private async convertImagesToPdfCarousel(
    postDetails: PostDetails<LinkedinDto>[],
    firstPost: PostDetails<LinkedinDto>,
  ): Promise<PostDetails<LinkedinDto>[]> {
    if (!firstPost.media?.length) {
      return postDetails
    }

    // Fetch all images and get their dimensions
    const images = await Promise.all(
      firstPost.media.map(async (media) => {
        const raw = await readOrFetch(media.path)
        const image = sharp(raw, { animated: false }).toFormat("jpeg")
        const { width, height } = await image.metadata()
        const buffer = await image.toBuffer()
        return { buffer, width: width || 0, height: height || 0 }
      }),
    )

    // Find the largest image by area to use as the PDF page size
    const largest = images.reduce((max, img) => (img.width * img.height > max.width * max.height ? img : max))

    const imageBuffers = images.map((img) => img.buffer)

    // Create a PDF sized to the largest image; it fills the page,
    // smaller images are fitted and centered within the same dimensions
    const pdfStream = imageToPDF(imageBuffers, [largest.width, largest.height]) as unknown as Readable
    const pdfBuffer = await this.streamToBuffer(pdfStream)

    // Replace the first post's media with the single PDF
    const [first, ...rest] = postDetails
    return [
      {
        ...first,
        media: [
          {
            type: "image" as const,
            path: "carousel.pdf",
            buffer: pdfBuffer,
          } as any,
        ],
      },
      ...rest,
    ]
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on("data", (chunk) => chunks.push(chunk))
      stream.on("end", () => resolve(Buffer.concat(chunks)))
      stream.on("error", reject)
    })
  }

  private async processMediaForPosts(
    postDetails: PostDetails<LinkedinDto>[],
    accessToken: string,
    personId: string,
    type: "company" | "personal",
  ): Promise<Record<string, string[]>> {
    const mediaUploads = await Promise.all(
      postDetails.flatMap(
        (post) =>
          post.media?.map(async (media) => {
            let mediaBuffer: Buffer

            // Check if media has a buffer (from PDF conversion)
            if (media && typeof media === "object" && "buffer" in media && Buffer.isBuffer(media.buffer)) {
              mediaBuffer = (media as any).buffer
            } else {
              mediaBuffer = await this.prepareMediaBuffer(media.path)
            }

            const uploadedMediaId = await this.uploadPicture(media.path, accessToken, personId, mediaBuffer, type)

            return {
              id: uploadedMediaId,
              postId: post.id,
            }
          }) || [],
      ),
    )

    return mediaUploads.reduce((acc, upload) => {
      if (!upload?.id) return acc

      acc[upload.postId] = acc[upload.postId] || []
      acc[upload.postId].push(upload.id)
      return acc
    }, {} as Record<string, string[]>)
  }

  private async prepareMediaBuffer(mediaUrl: string): Promise<Buffer> {
    const isVideo = mediaUrl.indexOf("mp4") > -1

    if (isVideo) {
      return Buffer.from(await readOrFetch(mediaUrl))
    }

    return await sharp(await readOrFetch(mediaUrl), {
      animated: lookup(mediaUrl) === "image/gif",
    })
      .toFormat("jpeg")
      .resize({ width: 1000 })
      .toBuffer()
  }

  private buildPostContent(isPdf: boolean, mediaIds: string[], pdfTitle?: string) {
    if (mediaIds.length === 0) {
      return {}
    }

    if (mediaIds.length === 1) {
      return {
        content: {
          media: {
            ...(isPdf ? { title: pdfTitle || "slides" } : {}),
            id: mediaIds[0],
          },
        },
      }
    }

    return {
      content: {
        multiImage: {
          images: mediaIds.map((id) => ({ id })),
        },
      },
    }
  }

  private createLinkedInPostPayload(
    id: string,
    type: "company" | "personal",
    message: string,
    mediaIds: string[],
    isPdf: boolean,
    pdfTitle?: string,
  ) {
    const author = type === "personal" ? `urn:li:person:${id}` : `urn:li:organization:${id}`

    return {
      author,
      commentary: this.fixText(message),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [] as string[],
        thirdPartyDistributionChannels: [] as string[],
      },
      ...this.buildPostContent(isPdf, mediaIds, pdfTitle),
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }
  }

  private async createMainPost(
    id: string,
    accessToken: string,
    firstPost: PostDetails<LinkedinDto>,
    mediaIds: string[],
    type: "company" | "personal",
    isPdf: boolean,
  ): Promise<string> {
    const pdfTitle = isPdf ? firstPost.settings?.carousel_name || "slides" : undefined

    const postPayload = this.createLinkedInPostPayload(id, type, firstPost.message, mediaIds, isPdf, pdfTitle)

    const response = await this.fetch(`https://api.linkedin.com/rest/posts`, {
      method: "POST",
      headers: {
        "LinkedIn-Version": "202601",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(postPayload),
    })

    if (response.status !== 201 && response.status !== 200) {
      throw new Error("Error posting to LinkedIn")
    }

    return response.headers.get("x-restli-id")!
  }

  private async createCommentPost(
    id: string,
    accessToken: string,
    post: PostDetails,
    parentPostId: string,
    type: "company" | "personal",
  ): Promise<string> {
    const actor = type === "personal" ? `urn:li:person:${id}` : `urn:li:organization:${id}`

    const response = await this.fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(parentPostId)}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        actor,
        object: parentPostId,
        message: {
          text: this.fixText(post.message),
        },
      }),
    })

    const { object } = await response.json()
    return object
  }

  private createPostResponse(postId: string, originalPostId: string, isMainPost: boolean = false): PostResponse {
    const baseUrl = isMainPost ? "https://www.linkedin.com/feed/update/" : "https://www.linkedin.com/embed/feed/update/"

    return {
      status: "posted",
      postId,
      id: originalPostId,
      releaseURL: `${baseUrl}${postId}`,
    }
  }

  async post(
    id: string,
    accessToken: string,
    postDetails: PostDetails<LinkedinDto>[],
    integration: Integration,
    type = "personal" as "company" | "personal",
  ): Promise<PostResponse[]> {
    let processedPostDetails = postDetails
    const [firstPost] = postDetails

    // Check if we should convert images to PDF carousel
    if (firstPost.settings?.post_as_images_carousel) {
      processedPostDetails = await this.convertImagesToPdfCarousel(postDetails, firstPost)
    }

    const [processedFirstPost] = processedPostDetails

    // Process and upload media for the first post only
    const uploadedMedia = await this.processMediaForPosts([processedFirstPost], accessToken, id, type)

    // Get media IDs for the main post
    const mainPostMediaIds = (uploadedMedia[processedFirstPost.id] || []).filter(Boolean)

    // Create the main LinkedIn post
    const mainPostId = await this.createMainPost(
      id,
      accessToken,
      processedFirstPost,
      mainPostMediaIds,
      type,
      !!firstPost.settings?.post_as_images_carousel,
    )

    // Return response for main post only
    return [this.createPostResponse(mainPostId, processedFirstPost.id, true)]
  }

  async comment(
    id: string,
    postId: string,
    lastCommentId: string | undefined,
    accessToken: string,
    postDetails: PostDetails<LinkedinDto>[],
    integration: Integration,
    type = "personal" as "company" | "personal",
  ): Promise<PostResponse[]> {
    const [commentPost] = postDetails

    const commentPostId = await this.createCommentPost(id, accessToken, commentPost, postId, type)

    return [this.createPostResponse(commentPostId, commentPost.id, false)]
  }

  protected linkedinProfileUrl(profile?: string | null) {
    if (!profile) {
      return ""
    }

    if (profile.startsWith("http")) {
      return profile
    }

    return `https://www.linkedin.com/in/${profile.replace(/^@/, "")}/`
  }

  protected linkedinPostsEndpoint(linkedinUrl: string) {
    return `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=${encodeURIComponent(linkedinUrl)}&type=posts`
  }

  private profilePostActivityDate(post: LinkedinProfilePost) {
    return post.reshared ? post.reposted || post.posted : post.posted
  }

  private profilePerformancePost(post: LinkedinProfilePost): LinkedinProfilePerformancePost | undefined {
    const date = this.profilePostActivityDate(post)

    if (!date) {
      return undefined
    }

    if (post.reshared) {
      return {
        post,
        stats: post.repost_stats || post,
        date,
        text: post.resharer_comment || post.text || "",
        reshared: true,
      }
    }

    return {
      post,
      stats: post,
      date,
      text: post.text || "",
      reshared: false,
    }
  }

  private profilePostEngagement(post: LinkedinProfilePerformancePost) {
    const stats = post.stats
    return this.profilePostReactions(stats) + Number(stats.num_comments || 0) + Number(stats.num_reposts || 0)
  }

  private profilePostReactions(stats: Partial<LinkedinProfilePost>) {
    const explicitReactions = Number(stats.num_reactions || 0)
    if (explicitReactions > 0) {
      return explicitReactions
    }

    return (
      Number(stats.num_likes || 0) +
      Number(stats.num_praises || 0) +
      Number(stats.num_empathy || 0) +
      Number(stats.num_interests || 0) +
      Number(stats.num_appreciations || 0) +
      Number(stats.num_entertainments || 0) +
      Number(stats.num_maybe || 0)
    )
  }

  private profilePostMediaType(post: LinkedinProfilePerformancePost) {
    if (post.post.document) {
      return "document"
    }

    if (post.post.video) {
      return "video"
    }

    if (post.post.article_title || post.post.article_target_url) {
      return "article"
    }

    if ((post.post.images?.length || 0) > 1) {
      return "multi-image"
    }

    if ((post.post.images?.length || 0) === 1) {
      return "image"
    }

    return "text"
  }

  private profilePostLabel(post: LinkedinProfilePerformancePost) {
    const text = (post.text || post.post.text || post.post.post_url || post.post.url || post.post.urn || "Post").replace(/\s+/g, " ").trim()

    return text.length > 72 ? `${text.slice(0, 69)}...` : text
  }

  private groupAverage(posts: LinkedinProfilePerformancePost[], getKey: (post: LinkedinProfilePerformancePost) => string) {
    const grouped = posts.reduce((all, post) => {
      const key = getKey(post)
      all[key] = all[key] || { total: 0, count: 0 }
      all[key].total += this.profilePostEngagement(post)
      all[key].count += 1
      return all
    }, {} as Record<string, { total: number; count: number }>)

    return Object.entries(grouped).map(([label, value]) => ({
      label,
      date: label,
      total: Math.round(value.total / value.count),
    }))
  }

  private confidenceForSample(count: number): "Low" | "Medium" | "High" {
    if (count >= 8) {
      return "High"
    }

    if (count >= 3) {
      return "Medium"
    }

    return "Low"
  }

  private profilePostClassificationId(post: LinkedinProfilePerformancePost, index: number) {
    return post.post.urn || post.post.post_url || `${dayjs.utc(post.date).valueOf()}-${index}`
  }

  private profilePostTopic(post: LinkedinProfilePerformancePost): (typeof LINKEDIN_ANALYTICS_TOPICS)[number] {
    const text = post.text.toLowerCase()
    const topics: Array<{ label: (typeof LINKEDIN_ANALYTICS_TOPICS)[number]; keywords: string[] }> = [
      { label: "Sales and revenue", keywords: ["sales", "crm", "pipeline", "follow-up", "lead", "revenue", "deal", "conversion"] },
      { label: "Marketing and content", keywords: ["marketing", "content", "linkedin", "post", "writing", "creator", "audience", "brand"] },
      { label: "Product and service", keywords: ["product", "service", "offer", "feature", "customer", "client", "pricing"] },
      { label: "Operations and systems", keywords: ["process", "system", "workflow", "handoff", "operation", "automation", "ops"] },
      { label: "Leadership and management", keywords: ["leadership", "manager", "management", "decision", "strategy", "team"] },
      { label: "Hiring and culture", keywords: ["hiring", "recruit", "culture", "interview", "talent", "candidate"] },
      { label: "Founder journey", keywords: ["founder", "startup", "build", "business", "operator", "company"] },
      { label: "Career and professional growth", keywords: ["career", "skill", "role", "job", "experience", "learned", "promotion"] },
      { label: "Customer insights", keywords: ["customer", "client", "user", "buyer", "audience", "feedback"] },
      { label: "Industry trends", keywords: ["trend", "market", "industry", "shift", "future", "ai"] },
      { label: "Personal productivity", keywords: ["productivity", "focus", "routine", "habit", "calendar", "time"] },
      { label: "Case studies and proof", keywords: ["case study", "result", "proof", "testimonial", "before", "after"] },
      { label: "Opinion and commentary", keywords: ["opinion", "take", "believe", "think", "point of view", "pov"] },
    ]

    return topics.find((topic) => topic.keywords.some((keyword) => text.includes(keyword)))?.label || "Opinion and commentary"
  }

  private profilePostHookStyle(post: LinkedinProfilePerformancePost): (typeof LINKEDIN_ANALYTICS_HOOK_STYLES)[number] {
    const firstLine = post.text.split("\n").map((line) => line.trim()).find(Boolean) || post.text
    const normalized = firstLine.toLowerCase()

    if (normalized.endsWith("?")) {
      return "Question-led"
    }

    if (normalized.startsWith("most ") || normalized.includes("not the problem") || normalized.includes("wrong")) {
      return "Contrarian statement"
    }

    if (normalized.includes("mistake") || normalized.includes("confession") || normalized.includes("i was wrong")) {
      return "Mistake/confession"
    }

    if (normalized.includes("problem") || normalized.includes("fix")) {
      return "Problem diagnosis"
    }

    if (/^\d+[\).\s-]/.test(normalized) || normalized.includes("things ") || normalized.includes("ways ")) {
      return "List-led"
    }

    if (/\d+%|\$\d+|\d+x/.test(normalized)) {
      return "Data/stat-led"
    }

    if (normalized.includes("prediction") || normalized.includes("trend") || normalized.includes("future")) {
      return "Prediction/trend"
    }

    if (normalized.startsWith('"') || normalized.startsWith("“")) {
      return "Quote/borrowed insight"
    }

    if (normalized.includes("result") || normalized.includes("grew") || normalized.includes("increased")) {
      return "Result-led"
    }

    if (normalized.startsWith("how ") || normalized.startsWith("here's how") || normalized.startsWith("here is how")) {
      return "Process breakdown"
    }

    if (normalized.includes("before") && normalized.includes("after")) {
      return "Before / after"
    }

    if (normalized.startsWith("i ") || normalized.startsWith("we ")) {
      return "Personal observation"
    }

    return "Direct statement"
  }

  private async profilePostClassifications(posts: LinkedinProfilePerformancePost[]) {
    const fallback = posts.reduce((all, post, index) => {
      all[this.profilePostClassificationId(post, index)] = {
        hookStyle: this.profilePostHookStyle(post),
        topic: this.profilePostTopic(post),
        confidence: "Low",
      }
      return all
    }, {} as Record<string, LinkedinAnalyticsPostClassification>)

    if (!process.env.OPENAI_API_KEY || posts.length === 0) {
      return fallback
    }

    try {
      const classifications = await linkedinAnalyticsOpenaiService.classifyLinkedinAnalyticsPosts({
        posts: posts.map((post, index) => ({
          id: this.profilePostClassificationId(post, index),
          text: post.text,
        })),
      })

      return classifications.reduce((all, classification) => {
        if (
          LINKEDIN_ANALYTICS_HOOK_STYLES.includes(classification.hookStyle as any) &&
          LINKEDIN_ANALYTICS_TOPICS.includes(classification.topic as any)
        ) {
          all[classification.id] = {
            hookStyle: classification.hookStyle,
            topic: classification.topic,
            confidence: classification.confidence,
          }
        }

        return all
      }, fallback)
    } catch (err) {
      console.error("Error classifying LinkedIn analytics posts:", err)
      return fallback
    }
  }

  private profilePostCtaStyle(post: LinkedinProfilePerformancePost) {
    const lines = post.text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
    const ending = lines.slice(-3).join(" ").toLowerCase()

    if (!ending) {
      return "No clear CTA"
    }

    if (ending.includes("dm") || ending.includes("message me") || ending.includes("send me")) {
      return "DM prompt"
    }

    if (ending.includes("book") || ending.includes("call")) {
      return "Booking prompt"
    }

    if (ending.includes("comment") || ending.includes("what do you think") || ending.includes("curious")) {
      return "Comment prompt"
    }

    if (ending.endsWith("?")) {
      return "Question prompt"
    }

    return "Soft close"
  }

  private groupPerformance(posts: LinkedinProfilePerformancePost[], getKey: (post: LinkedinProfilePerformancePost) => string, averageEngagement: number) {
    const grouped = posts.reduce((all, post) => {
      const key = getKey(post)
      all[key] = all[key] || { total: 0, count: 0 }
      all[key].total += this.profilePostEngagement(post)
      all[key].count += 1
      return all
    }, {} as Record<string, { total: number; count: number }>)

    return Object.entries(grouped)
      .map(([label, value]) => {
        const average = value.count ? value.total / value.count : 0
        return {
          label,
          date: label,
          total: Math.round(average),
          count: value.count,
          vsAverage: averageEngagement ? Math.round(((average - averageEngagement) / averageEngagement) * 100) : 0,
          confidence: this.confidenceForSample(value.count),
        }
      })
      .sort((a, b) => Number(b.total) - Number(a.total))
  }

  private bestPatternLabel(patterns: Array<{ label: string; total: number | string; count?: number }>, fallback: string) {
    return patterns.find((pattern) => Number(pattern.total) > 0)?.label || fallback
  }

  async analytics(id: string, accessToken: string, date: number, context?: any): Promise<AnalyticsData[]> {
    const integration = (context?.integration || context) as Integration | undefined
    const timezone = typeof context?.timezone === "number" ? context.timezone : 0
    const rapidApiKey = process.env.RAPIDAPI_KEY
    const linkedinUrl = this.linkedinProfileUrl(integration?.profile)

    if (!rapidApiKey || !linkedinUrl) {
      return []
    }

    try {
      const response = await this.fetch(
        this.linkedinPostsEndpoint(linkedinUrl),
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": rapidApiKey,
            "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
            "Content-Type": "application/json",
          },
        },
      )

      const result = (await response.json()) as {
        data?: LinkedinProfilePost[]
      }

      const useLatestProfilePosts = date === -1
      const returnedPosts = useLatestProfilePosts ? (result.data || []).slice(0, 50) : result.data || []
      const nowInTimezone = dayjs.utc().utcOffset(timezone)
      const since = useLatestProfilePosts ? undefined : nowInTimezone.subtract(date, "days").startOf("day")
      const activityPosts = returnedPosts.filter((post) => {
        const activityDate = this.profilePostActivityDate(post)

        if (!activityDate) {
          return false
        }

        if (useLatestProfilePosts) {
          return true
        }

        return dayjs.utc(activityDate).utcOffset(timezone).isAfter(since)
      })

      if (activityPosts.length === 0) {
        return []
      }

      const posts = activityPosts.map((post) => this.profilePerformancePost(post)).filter((post): post is LinkedinProfilePerformancePost => !!post)

      const today = nowInTimezone.format("YYYY-MM-DD")
      const numberFormat = new Intl.NumberFormat("en-US")
      const total = (value: number) => numberFormat.format(Math.round(value))
      const single = (label: string, value: number | string, key?: string, meta?: Record<string, any>): AnalyticsData => ({
        key,
        label,
        percentageChange: 0,
        total: typeof value === "number" ? total(value) : value,
        data: [{ total: typeof value === "number" ? value : 0, date: today }],
        meta,
      })

      const activityTotals = activityPosts.reduce(
        (all, post) => {
          if (post.reshared) {
            all.reshared += 1
          } else {
            all.original += 1
          }

          return all
        },
        {
          original: 0,
          reshared: 0,
        },
      )

      const totals = posts.reduce(
        (all, post) => {
          const stats = post.stats
          all.reactions += this.profilePostReactions(stats)
          all.comments += Number(stats.num_comments || 0)
          all.reposts += Number(stats.num_reposts || 0)
          all.textLength += post.text.length
          return all
        },
        {
          reactions: 0,
          comments: 0,
          reposts: 0,
          textLength: 0,
        },
      )

      const totalEngagement = totals.reactions + totals.comments + totals.reposts
      const averageEngagement = posts.length ? totalEngagement / posts.length : 0
      const activityTimestamps = activityPosts.map((post) => dayjs.utc(this.profilePostActivityDate(post)!).valueOf()).filter(Number.isFinite)
      const oldestActivityTimestamp = activityTimestamps.length ? Math.min(...activityTimestamps) : undefined
      const newestActivityTimestamp = activityTimestamps.length ? Math.max(...activityTimestamps) : undefined
      const coveredDays =
        useLatestProfilePosts && oldestActivityTimestamp && newestActivityTimestamp
          ? Math.max(1, (newestActivityTimestamp - oldestActivityTimestamp) / (24 * 60 * 60 * 1000))
          : date
      const postsPerWeek = activityPosts.length / Math.max(coveredDays / 7, 1)
      const bestPost = posts.reduce<LinkedinProfilePerformancePost | undefined>(
        (best, post) => (!best || this.profilePostEngagement(post) > this.profilePostEngagement(best) ? post : best),
        undefined,
      )
      const mostCommentedPost = posts.reduce<LinkedinProfilePerformancePost | undefined>(
        (best, post) => (!best || Number(post.stats.num_comments || 0) > Number(best.stats.num_comments || 0) ? post : best),
        undefined,
      )
      const mostRepostedPost = posts.reduce<LinkedinProfilePerformancePost | undefined>(
        (best, post) => (!best || Number(post.stats.num_reposts || 0) > Number(best.stats.num_reposts || 0) ? post : best),
        undefined,
      )

      const engagementByDate = Object.entries(
        posts.reduce((all, post) => {
          const key = dayjs.utc(post.date).utcOffset(timezone).format("YYYY-MM-DD")
          all[key] = (all[key] || 0) + this.profilePostEngagement(post)
          return all
        }, {} as Record<string, number>),
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, value]) => ({ label, date: label, total: value }))
      const trendFirstHalf = engagementByDate.slice(0, Math.max(1, Math.floor(engagementByDate.length / 2)))
      const trendSecondHalf = engagementByDate.slice(Math.max(1, Math.floor(engagementByDate.length / 2)))
      const trendFirstAverage = trendFirstHalf.reduce((sum, point) => sum + Number(point.total || 0), 0) / Math.max(trendFirstHalf.length, 1)
      const trendSecondAverage = trendSecondHalf.reduce((sum, point) => sum + Number(point.total || 0), 0) / Math.max(trendSecondHalf.length, 1)
      const engagementTrendChange = trendFirstAverage ? Math.round(((trendSecondAverage - trendFirstAverage) / trendFirstAverage) * 100) : 0

      const reactionBreakdown = [
        ["Likes", "num_likes"],
        ["Praise", "num_praises"],
        ["Empathy", "num_empathy"],
        ["Interest", "num_interests"],
        ["Appreciation", "num_appreciations"],
        ["Entertainment", "num_entertainments"],
        ["Maybe", "num_maybe"],
      ].map(([label, key]) => ({
        label,
        date: label,
        total: posts.reduce((sum, post) => sum + Number((post.stats as any)[key] || 0), 0),
      }))

      const lengthBucket = (post: LinkedinProfilePerformancePost) => {
        const length = post.text.length
        if (length <= 100) return "0-100 chars"
        if (length <= 300) return "101-300 chars"
        if (length <= 700) return "301-700 chars"
        return "700+ chars"
      }
      const postClassifications = await this.profilePostClassifications(posts)
      const originalPostIndexes = new Map(posts.map((post, index) => [post, index]))
      const classificationFor = (post: LinkedinProfilePerformancePost) =>
        postClassifications[this.profilePostClassificationId(post, originalPostIndexes.get(post) || 0)] || {
          hookStyle: this.profilePostHookStyle(post),
          topic: this.profilePostTopic(post),
          confidence: "Low",
        }

      const topPosts = [...posts]
        .sort((a, b) => this.profilePostEngagement(b) - this.profilePostEngagement(a))
        .slice(0, 10)
        .map((post) => ({
          label: this.profilePostLabel(post),
          date: this.profilePostLabel(post),
          total: this.profilePostEngagement(post),
          comments: Number(post.stats.num_comments || 0),
          reposts: Number(post.stats.num_reposts || 0),
          reactions: this.profilePostReactions(post.stats),
          format: this.profilePostMediaType(post),
          topic: classificationFor(post).topic,
          hookStyle: classificationFor(post).hookStyle,
          classificationConfidence: classificationFor(post).confidence,
          ctaStyle: this.profilePostCtaStyle(post),
          reshared: post.reshared,
          postUrl: post.post.post_url || post.post.url,
          publishedAt: dayjs.utc(post.date).utcOffset(timezone).format("ddd, MMM D [at] h:mm A"),
          timestamp: dayjs.utc(post.date).utcOffset(timezone).valueOf(),
          vsAverage: averageEngagement ? Number((this.profilePostEngagement(post) / averageEngagement).toFixed(1)) : 0,
        }))
      const mediaPerformance = this.groupPerformance(posts, (post) => this.profilePostMediaType(post), averageEngagement)
      const lengthPerformance = this.groupPerformance(posts, lengthBucket, averageEngagement)
      const postingWindowPerformance = this.groupPerformance(posts, (post) => dayjs.utc(post.date).utcOffset(timezone).format("ddd HH:00"), averageEngagement)
        .sort((a, b) => Number(b.total) - Number(a.total))
        .slice(0, 10)
      const originalResharedPerformance = this.groupPerformance(posts, (post) => (post.reshared ? "Reshared" : "Original"), averageEngagement)
      const topicPerformance = this.groupPerformance(posts, (post) => classificationFor(post).topic, averageEngagement)
      const hookPerformance = this.groupPerformance(posts, (post) => classificationFor(post).hookStyle, averageEngagement)
      const ctaPerformance = this.groupPerformance(posts, (post) => this.profilePostCtaStyle(post), averageEngagement)
      const bestMedia = mediaPerformance[0]
      const bestLength = lengthPerformance[0]
      const bestPostingWindow = postingWindowPerformance[0]
      const bestTopic = topicPerformance[0]
      const bestHook = hookPerformance[0]
      const bestCta = ctaPerformance[0]
      const originalPerformance = originalResharedPerformance.find((item) => item.label === "Original")
      const resharedPerformance = originalResharedPerformance.find((item) => item.label === "Reshared")
      const originalMultiplier =
        originalPerformance && resharedPerformance && Number(resharedPerformance.total) > 0
          ? Number((Number(originalPerformance.total) / Number(resharedPerformance.total)).toFixed(1))
          : undefined
      const bestPostEngagement = bestPost ? this.profilePostEngagement(bestPost) : 0
      const bestPostMeta = bestPost
        ? {
            preview: this.profilePostLabel(bestPost),
            engagement: bestPostEngagement,
            vsAverage: averageEngagement ? Number((bestPostEngagement / averageEngagement).toFixed(1)) : 0,
            topic: classificationFor(bestPost).topic,
            hookStyle: classificationFor(bestPost).hookStyle,
            classificationConfidence: classificationFor(bestPost).confidence,
            format: this.profilePostMediaType(bestPost),
            publishedAt: dayjs.utc(bestPost.date).utcOffset(timezone).format("dddd [at] h:mm A"),
            postUrl: bestPost.post.post_url || bestPost.post.url,
          }
        : undefined
      const nextDecision = {
        write: `A ${this.bestPatternLabel(topicPerformance, "practical")} post using a ${this.bestPatternLabel(hookPerformance, "direct statement").toLowerCase()} hook`,
        use: `${this.bestPatternLabel(mediaPerformance, "text")} format, ${this.bestPatternLabel(lengthPerformance, "301-700 chars")}`,
        publish: bestPostingWindow?.label ? `${bestPostingWindow.label.replace(":00", "")}:00 local time` : "your next consistent posting window",
        why:
          bestMedia && bestLength
            ? `${bestMedia.label} posts and ${bestLength.label} posts are currently your strongest classified patterns.`
            : "This combines the strongest available patterns from your recent posts.",
        confidence: this.confidenceForSample(Math.max(bestMedia?.count || 0, bestLength?.count || 0, bestPostingWindow?.count || 0)),
      }

      return [
        {
          key: "performance_overview",
          label: "Performance overview",
          percentageChange: engagementTrendChange,
          total: total(averageEngagement),
          data: [{ total: averageEngagement, date: today }],
          insight: `Your posts average ${total(averageEngagement)} engagements across ${posts.length} posts.`,
          recommendation: engagementTrendChange >= 0 ? "Double down on the post patterns below." : "Use the pattern analysis below to reset the next few posts.",
          meta: {
            averageEngagement: Math.round(averageEngagement),
            totalEngagement,
            reactions: totals.reactions,
            comments: totals.comments,
            reposts: totals.reposts,
            postsAnalyzed: posts.length,
          },
        },
        single("Total engagement", totalEngagement, "total_engagement"),
        single("Average engagement per post", total(averageEngagement), "average_engagement_per_post"),
        single("Total reactions received", totals.reactions, "total_reactions"),
        single("Total comments received", totals.comments, "total_comments"),
        single("Total reposts of your posts", totals.reposts, "total_reposts"),
        single("Engagement on your best post", bestPostEngagement, "best_post_engagement", bestPostMeta),
        single("Most-commented on post", Number(mostCommentedPost?.stats.num_comments || 0), "most_commented_post", {
          preview: mostCommentedPost ? this.profilePostLabel(mostCommentedPost) : "",
          postUrl: mostCommentedPost?.post.post_url || mostCommentedPost?.post.url,
        }),
        single("Your post with most Reposts", Number(mostRepostedPost?.stats.num_reposts || 0), "most_reposted_post", {
          preview: mostRepostedPost ? this.profilePostLabel(mostRepostedPost) : "",
          postUrl: mostRepostedPost?.post.post_url || mostRepostedPost?.post.url,
        }),
        single("Average posts per week", postsPerWeek.toFixed(1), "posts_per_week", {
          postsAnalyzed: activityPosts.length,
          coveredDays: Math.ceil(coveredDays),
          period:
            useLatestProfilePosts && oldestActivityTimestamp && newestActivityTimestamp
              ? `${dayjs.utc(oldestActivityTimestamp).utcOffset(timezone).format("MMM D")} - ${dayjs
                  .utc(newestActivityTimestamp)
                  .utcOffset(timezone)
                  .format("MMM D")}`
              : `Last ${date} days`,
        }),
        {
          key: "original_vs_reshared_mix",
          label: "Original vs reshared mix",
          chartType: "bar",
          percentageChange: 0,
          total: `${activityTotals.original} / ${activityTotals.reshared}`,
          data: [
            { label: "Original", date: "Original", total: activityTotals.original },
            { label: "Reshared", date: "Reshared", total: activityTotals.reshared },
          ],
          insight:
            typeof originalMultiplier === "number"
              ? `Original posts average ${originalMultiplier}x the engagement of reshared posts.`
              : `${activityTotals.original} original and ${activityTotals.reshared} reshared posts analyzed.`,
          recommendation: "Keep reshared posts as support content; use original posts for your main weekly strategy.",
          meta: {
            performance: originalResharedPerformance,
          },
        },
        single("Average post text length", posts.length ? total(totals.textLength / posts.length) : "0", "average_post_text_length"),
        {
          key: "top_posts_by_engagement",
          label: "Top 10 posts by engagement",
          chartType: "horizontalBar",
          percentageChange: 0,
          data: topPosts,
          total: topPosts[0]?.total || 0,
          insight: "Study and repurpose the posts that beat your account average.",
          recommendation: "Start with posts that have both comments and reposts, not only reactions.",
        } as AnalyticsData,
        {
          key: "engagement_trend",
          label: "Engagement trend over time",
          chartType: "line",
          percentageChange: engagementTrendChange,
          data: engagementByDate,
          total: totalEngagement,
          insight: engagementTrendChange >= 0 ? "Engagement is trending upward in this period." : "Engagement is trending downward in this period.",
          recommendation: engagementTrendChange >= 0 ? "Repeat the strongest topics and formats." : "Use the best-performing format and hook style for the next post.",
        },
        {
          key: "response_mix",
          label: "Reactions vs comments vs reposts",
          chartType: "bar",
          percentageChange: 0,
          total: totalEngagement,
          data: [
            { label: "Reactions", date: "Reactions", total: totals.reactions },
            { label: "Comments", date: "Comments", total: totals.comments },
            { label: "Reposts", date: "Reposts", total: totals.reposts },
          ],
          meta: {
            averageComments: posts.length ? totals.comments / posts.length : 0,
            averageReposts: posts.length ? totals.reposts / posts.length : 0,
            averageReactions: posts.length ? totals.reactions / posts.length : 0,
          },
        },
        {
          key: "reaction_type_breakdown",
          label: "Reaction type breakdown",
          chartType: "doughnut",
          percentageChange: 0,
          total: totals.reactions,
          data: reactionBreakdown.filter((item) => item.total > 0),
        },
        {
          key: "media_type_performance",
          label: "Media type performance",
          chartType: "bar",
          percentageChange: 0,
          data: mediaPerformance,
          insight: bestMedia ? `${bestMedia.label} posts have the strongest average engagement.` : "Not enough posts to compare media types.",
          recommendation: bestMedia ? `Use ${bestMedia.label} when the idea supports it; sample size confidence is ${bestMedia.confidence}.` : undefined,
          confidence: bestMedia?.confidence,
        },
        {
          key: "original_vs_reshared_performance",
          label: "Original vs reshared posts performance",
          chartType: "bar",
          percentageChange: 0,
          data: originalResharedPerformance,
          insight:
            typeof originalMultiplier === "number"
              ? `Original posts average ${originalMultiplier}x reshared posts.`
              : "Original and reshared performance are not both available yet.",
          recommendation: "Prioritize original posts unless resharing adds a strong personal point of view.",
        },
        {
          key: "post_length_performance",
          label: "Post length performance",
          chartType: "bar",
          percentageChange: 0,
          data: lengthPerformance,
          insight: bestLength ? `${bestLength.label} is your strongest-performing length bucket.` : "Not enough posts to compare length buckets.",
          recommendation: bestLength ? `Keep the next post around ${bestLength.label}.` : undefined,
          confidence: bestLength?.confidence,
        },
        {
          key: "posting_day_time_performance",
          label: "Posting day/time performance",
          chartType: "horizontalBar",
          percentageChange: 0,
          data: postingWindowPerformance,
          insight: bestPostingWindow ? `${bestPostingWindow.label} is your strongest detected posting window.` : "Not enough posts to compare posting windows.",
          recommendation: bestPostingWindow ? `Test your next strong post around ${bestPostingWindow.label}.` : undefined,
          confidence: bestPostingWindow?.confidence,
        },
        {
          key: "topic_performance",
          label: "Best topic / pillar",
          percentageChange: 0,
          total: bestTopic?.label || "Not enough data",
          data: topicPerformance,
          insight: bestTopic ? `${bestTopic.label} is your strongest detected topic.` : "Not enough posts to detect a topic pattern.",
          recommendation: bestTopic ? `Use ${bestTopic.label.toLowerCase()} as the subject of your next post.` : undefined,
          confidence: bestTopic?.confidence,
        },
        {
          key: "hook_style_performance",
          label: "Best hook style",
          percentageChange: 0,
          total: bestHook?.label || "Not enough data",
          data: hookPerformance,
          insight: bestHook ? `${bestHook.label} hooks are performing best.` : "Not enough posts to detect a hook pattern.",
          recommendation: bestHook ? `Open the next post with a ${bestHook.label.toLowerCase()} hook.` : undefined,
          confidence: bestHook?.confidence,
        },
        {
          key: "cta_style_performance",
          label: "Best CTA style",
          percentageChange: 0,
          total: bestCta?.label || "Not enough data",
          data: ctaPerformance,
          insight: bestCta ? `${bestCta.label} is your strongest detected CTA style.` : "Not enough posts to detect a CTA pattern.",
          recommendation: bestCta ? `Close the next post with a ${bestCta.label.toLowerCase()}.` : undefined,
          confidence: bestCta?.confidence,
        },
        {
          key: "next_content_decision",
          label: "Your next content decision",
          percentageChange: 0,
          total: nextDecision.write,
          data: [{ total: Math.round(averageEngagement), date: today }],
          recommendation: `${nextDecision.write}. Use ${nextDecision.use}. Publish around ${nextDecision.publish}.`,
          confidence: nextDecision.confidence,
          meta: nextDecision,
        },
      ]
    } catch (err) {
      console.error("Error fetching LinkedIn profile analytics:", err)
      return []
    }
  }

  @PostPlug({
    identifier: "linkedin-add-comment",
    title: "Add comments by a different account",
    description: "Add accounts to comment on your post",
    pickIntegration: ["linkedin", "linkedin-page"],
    fields: [
      {
        name: "comment",
        description: "The comment to add to the post",
        type: "textarea",
        placeholder: "Enter your comment here",
      },
    ],
  })
  async addComment(integration: Integration, originalIntegration: Integration, postId: string, information: any, isPersonal = true) {
    return this.comment(
      integration.internalId,
      postId,
      undefined,
      integration.token,
      [
        {
          id: makeId(10),
          message: information.comment,
          media: [],
          settings: {
            post_as_images_carousel: false,
          },
        },
      ],
      integration,
      isPersonal ? "personal" : "company",
    )
  }

  @PostPlug({
    identifier: "linkedin-repost-post-users",
    title: "Add Re-posters",
    description: "Add accounts to repost your post",
    pickIntegration: ["linkedin", "linkedin-page"],
    fields: [],
  })
  async repostPostUsers(integration: Integration, originalIntegration: Integration, postId: string, information: any, isPersonal = true) {
    await this.fetch(`https://api.linkedin.com/rest/posts`, {
      body: JSON.stringify({
        author: (isPersonal ? "urn:li:person:" : `urn:li:organization:`) + `${integration.internalId}`,
        commentary: "",
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
        reshareContext: {
          parent: postId,
        },
      }),
      method: "POST",
      headers: {
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
        "LinkedIn-Version": "202601",
        Authorization: `Bearer ${integration.token}`,
      },
    })
  }

  override async mention(token: string, data: { query: string }) {
    const { elements } = await (
      await fetch(
        `https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(
          data.query,
        )}&projection=(elements*(id,localizedName,logoV2(original~:playableStreams)))`,
        {
          headers: {
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
            "LinkedIn-Version": "202601",
            Authorization: `Bearer ${token}`,
          },
        },
      )
    ).json()

    return elements.map((p: any) => ({
      id: String(p.id),
      label: p.localizedName,
      image: p.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier || "",
    }))
  }

  mentionFormat(idOrHandle: string, name: string) {
    return `@[${name.replace("@", "")}](urn:li:organization:${idOrHandle})`
  }
}
