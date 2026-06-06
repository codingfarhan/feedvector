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
  video?: { duration?: number; stream_url?: string }
}

type LinkedinProfilePerformancePost = {
  post: LinkedinProfilePost
  stats: Partial<LinkedinProfilePost>
  date: string
  text: string
  reshared: boolean
}

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

  private linkedinProfileUrl(profile?: string | null) {
    if (!profile) {
      return ""
    }

    if (profile.startsWith("http")) {
      return profile
    }

    return `https://www.linkedin.com/in/${profile.replace(/^@/, "")}/`
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
      if (!post.repost_stats) {
        return undefined
      }

      return {
        post,
        stats: post.repost_stats,
        date,
        text: post.resharer_comment || "",
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
    return Number(stats.num_reactions || 0) + Number(stats.num_comments || 0) + Number(stats.num_reposts || 0)
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
    const text = (post.text || post.post.text || post.post.post_url || post.post.urn || "Post").replace(/\s+/g, " ").trim()

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
        `https://fresh-linkedin-profile-data.p.rapidapi.com/get-profile-posts?linkedin_url=${encodeURIComponent(linkedinUrl)}&type=posts`,
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
      const single = (label: string, value: number | string): AnalyticsData => ({
        label,
        percentageChange: 0,
        total: typeof value === "number" ? total(value) : value,
        data: [{ total: typeof value === "number" ? value : 0, date: today }],
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
          all.reactions += Number(stats.num_reactions || 0)
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
      const coveredDays =
        useLatestProfilePosts && activityTimestamps.length > 1
          ? Math.max(1, (Math.max(...activityTimestamps) - Math.min(...activityTimestamps)) / (24 * 60 * 60 * 1000))
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

      const topPosts = [...posts]
        .sort((a, b) => this.profilePostEngagement(b) - this.profilePostEngagement(a))
        .slice(0, 10)
        .map((post) => ({
          label: this.profilePostLabel(post),
          date: this.profilePostLabel(post),
          total: this.profilePostEngagement(post),
        }))

      return [
        single("Total engagement", totalEngagement),
        single("Average engagement per post", total(averageEngagement)),
        single("Total reactions", totals.reactions),
        single("Total comments", totals.comments),
        single("Total reposts", totals.reposts),
        single("Best post", bestPost ? this.profilePostEngagement(bestPost) : 0),
        single("Most-commented post", Number(mostCommentedPost?.stats.num_comments || 0)),
        single("Most-reposted post", Number(mostRepostedPost?.stats.num_reposts || 0)),
        single("Posts per week", postsPerWeek.toFixed(1)),
        {
          label: "Original vs reshared posts",
          chartType: "bar",
          percentageChange: 0,
          total: `${activityTotals.original} / ${activityTotals.reshared}`,
          data: [
            { label: "Original", date: "Original", total: activityTotals.original },
            { label: "Reshared", date: "Reshared", total: activityTotals.reshared },
          ],
        },
        single("Average post text length", posts.length ? total(totals.textLength / posts.length) : "0"),
        {
          label: "Top 10 posts by engagement",
          chartType: "horizontalBar",
          percentageChange: 0,
          data: topPosts,
          total: topPosts[0]?.total || 0,
        } as AnalyticsData,
        {
          label: "Engagement trend over time",
          chartType: "line",
          percentageChange: 0,
          data: engagementByDate,
          total: totalEngagement,
        },
        {
          label: "Reactions vs comments vs reposts",
          chartType: "bar",
          percentageChange: 0,
          total: totalEngagement,
          data: [
            { label: "Reactions", date: "Reactions", total: totals.reactions },
            { label: "Comments", date: "Comments", total: totals.comments },
            { label: "Reposts", date: "Reposts", total: totals.reposts },
          ],
        },
        {
          label: "Reaction type breakdown",
          chartType: "doughnut",
          percentageChange: 0,
          total: totals.reactions,
          data: reactionBreakdown.filter((item) => item.total > 0),
        },
        {
          label: "Media type performance",
          chartType: "bar",
          percentageChange: 0,
          data: this.groupAverage(posts, (post) => this.profilePostMediaType(post)),
        },
        {
          label: "Original vs reshared performance",
          chartType: "bar",
          percentageChange: 0,
          data: this.groupAverage(posts, (post) => (post.reshared ? "Reshared" : "Original")),
        },
        {
          label: "Post length performance",
          chartType: "bar",
          percentageChange: 0,
          data: this.groupAverage(posts, lengthBucket),
        },
        {
          label: "Posting day/time performance",
          chartType: "horizontalBar",
          percentageChange: 0,
          data: this.groupAverage(posts, (post) => dayjs.utc(post.date).utcOffset(timezone).format("ddd HH:00"))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10),
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
