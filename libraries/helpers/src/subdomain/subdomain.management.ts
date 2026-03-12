import { parse } from "tldts"

export function getCookieUrlFromDomain(domain: string) {
  if (process.env.FRONTEND_DOMAIN) {
    return process.env.FRONTEND_DOMAIN
  }
  const url = parse(domain)
  return url.domain! ? "." + url.domain! : url.hostname!
}
