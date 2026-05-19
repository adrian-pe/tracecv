import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import {
  createSupabaseGitHubOAuthState,
  GITHUB_OAUTH_CODE_VERIFIER_COOKIE,
  GITHUB_OAUTH_STATE_COOKIE,
  requireAuthenticatedUser,
} from "@/lib/auth"

export const runtime = "nodejs"

const OAUTH_COOKIE_MAX_AGE = 60 * 10

export async function GET(request: Request) {
  const { response } = await requireAuthenticatedUser(request)

  if (response) {
    return response
  }

  const oauthState = createSupabaseGitHubOAuthState(request)
  const redirectResponse = NextResponse.redirect(oauthState.authorizationUrl)
  const cookieOptions = {
    httpOnly: true,
    maxAge: OAUTH_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }

  redirectResponse.cookies.set(
    GITHUB_OAUTH_STATE_COOKIE,
    oauthState.state,
    cookieOptions,
  )
  redirectResponse.cookies.set(
    GITHUB_OAUTH_CODE_VERIFIER_COOKIE,
    oauthState.codeVerifier,
    cookieOptions,
  )

  return redirectResponse
}

export function OPTIONS() {
  return optionsResponse()
}
