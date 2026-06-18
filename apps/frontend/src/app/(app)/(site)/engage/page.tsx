export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { LinkedinCommentOpportunities } from "@gitroom/frontend/components/engage/linkedin-comment-opportunities"
import { isGeneralServerSide } from "@gitroom/helpers/utils/is.general.server.side"

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? "FeedVector" : "Gitroom"} Engage`,
  description: "",
}

export default async function Index() {
  return <LinkedinCommentOpportunities />
}
