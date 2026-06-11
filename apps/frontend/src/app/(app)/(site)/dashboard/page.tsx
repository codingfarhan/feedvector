export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { LinkedinStrategyDashboard } from "@gitroom/frontend/components/dashboard/linkedin-strategy-dashboard"
import { isGeneralServerSide } from "@gitroom/helpers/utils/is.general.server.side"

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? "FeedVector" : "Gitroom"} Dashboard`,
  description: "",
}

export default async function Index() {
  return <LinkedinStrategyDashboard />
}
