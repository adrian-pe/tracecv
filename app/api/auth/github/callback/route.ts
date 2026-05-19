import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import {
  exchangeSupabaseOAuthCodeForGitHubIdentity,
  getCurrentUserFromRequest,
  GITHUB_OAUTH_CODE_VERIFIER_COOKIE,
  GITHUB_OAUTH_STATE_COOKIE,
} from "@/lib/auth"
import { upsertUser, upsertVerifiedGitHubConnection } from "@/lib/db"

export const runtime = "nodejs"

function getCallbackRedirect(request: Request, params: Record<string, string>) {
  const redirectUrl = new URL("/", new URL(request.url).origin)

  for (const [key, value] of Object.entries(params)) {
    redirectUrl.searchParams.set(key, value)
  }

  return redirectUrl
}

function clearOAuthCookies(response: NextResponse) {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  }

  response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", cookieOptions)
  response.cookies.set(GITHUB_OAUTH_CODE_VERIFIER_COOKIE, "", cookieOptions)
}

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie")

  if (!cookieHeader) {
    return null
  }

  const matchingCookie = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))

  if (!matchingCookie) {
    return null
  }

  return decodeURIComponent(matchingCookie.slice(name.length + 1))
}

function redirectWithError(request: Request, error: string) {
  const response = NextResponse.redirect(
    getCallbackRedirect(request, { github_connection_error: error }),
  )
  clearOAuthCookies(response)
  return response
}

export async function GET(request: Request) {
  const callbackUrl = new URL(request.url)
  const oauthError =
    callbackUrl.searchParams.get("error_description") ??
    callbackUrl.searchParams.get("error")
  const code = callbackUrl.searchParams.get("code")
  const state = callbackUrl.searchParams.get("state")
  const expectedState = getCookieValue(request, GITHUB_OAUTH_STATE_COOKIE)
  const codeVerifier = getCookieValue(request, GITHUB_OAUTH_CODE_VERIFIER_COOKIE)

  if (oauthError) {
    return redirectWithError(request, oauthError)
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return redirectWithError(request, "Callback OAuth de GitHub inválido.")
  }

  if (!codeVerifier) {
    return redirectWithError(request, "Verificador OAuth de GitHub expirado.")
  }

  const user = await getCurrentUserFromRequest(request)

  if (!user) {
    return redirectWithError(
      request,
      "Debes iniciar sesión antes de conectar GitHub.",
    )
  }

  try {
    const githubIdentity = await exchangeSupabaseOAuthCodeForGitHubIdentity(
      code,
      codeVerifier,
    )

    await upsertUser(user)
    await upsertVerifiedGitHubConnection({
      userId: user.id,
      providerId: githubIdentity.providerId,
      username: githubIdentity.username,
      metadata: {
        identity_id: githubIdentity.identityId,
        avatar_url: githubIdentity.avatarUrl,
        ...githubIdentity.rawIdentityData,
      },
    })

    const response = NextResponse.redirect(
      getCallbackRedirect(request, {
        github_connected: githubIdentity.username,
      }),
    )
    clearOAuthCookies(response)
    return response
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo verificar la cuenta de GitHub."

    return redirectWithError(request, message)
  }
}

export function OPTIONS() {
  return optionsResponse()
}
