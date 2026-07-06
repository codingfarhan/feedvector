export interface PricingInnerInterface {
  current: string
  month_price: number
  year_price: number
  channel?: number
  posts_per_month: number
  team_members: boolean
  team_member_limit?: number
  community_features: boolean
  featured_by_gitroom: boolean
  ai: boolean
  import_from_channels: boolean
  image_generator?: boolean
  image_generation_count: number
  generate_videos: number
  public_api: boolean
  webhooks: number
  autoPost: boolean
}
export interface PricingInterface {
  [key: string]: PricingInnerInterface
}

export const ACTIVE_BILLING_PLANS = ["ESSENTIAL", "GROWTH"] as const
export type ActiveBillingPlan = (typeof ACTIVE_BILLING_PLANS)[number]
export const isActiveBillingPlan = (value: string): value is ActiveBillingPlan => ACTIVE_BILLING_PLANS.includes(value as ActiveBillingPlan)

export const pricing: PricingInterface = {
  ESSENTIAL: {
    current: "ESSENTIAL",
    month_price: 179,
    year_price: 0,
    channel: 5,
    posts_per_month: 1000000,
    team_members: true,
    team_member_limit: 3,
    community_features: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    image_generation_count: 100,
    generate_videos: 35,
    public_api: true,
    webhooks: 30,
    autoPost: true,
  },
  GROWTH: {
    current: "GROWTH",
    month_price: 379,
    year_price: 0,
    channel: 1000000,
    posts_per_month: 1000000,
    team_members: true,
    team_member_limit: 1000000,
    community_features: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    image_generation_count: 200,
    generate_videos: 50,
    public_api: true,
    webhooks: 10000,
    autoPost: true,
  },
  FREE: {
    current: "FREE",
    month_price: 0,
    year_price: 0,
    channel: 3,
    image_generation_count: 2,
    posts_per_month: 20,
    team_members: true,
    community_features: true,
    featured_by_gitroom: false,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 0,
    autoPost: true,
    generate_videos: 1,
  },
  STANDARD: {
    current: "STANDARD",
    month_price: 29,
    year_price: 278,
    channel: 5,
    posts_per_month: 400,
    image_generation_count: 20,
    team_members: false,
    ai: true,
    community_features: false,
    featured_by_gitroom: false,
    import_from_channels: true,
    image_generator: false,
    public_api: true,
    webhooks: 2,
    autoPost: false,
    generate_videos: 3,
  },
  TEAM: {
    current: "TEAM",
    month_price: 39,
    year_price: 374,
    channel: 10,
    posts_per_month: 1000000,
    image_generation_count: 100,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10,
    autoPost: true,
    generate_videos: 10,
  },
  PRO: {
    current: "PRO",
    month_price: 29,
    year_price: 348,
    channel: 50,
    posts_per_month: 1000000,
    image_generation_count: 35,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 30,
    autoPost: true,
    generate_videos: 20,
  },
  ULTIMATE: {
    current: "ULTIMATE",
    month_price: 99,
    year_price: 950,
    channel: 100,
    posts_per_month: 1000000,
    image_generation_count: 500,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10000,
    autoPost: true,
    generate_videos: 60,
  },
}
