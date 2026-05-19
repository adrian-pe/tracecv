import { createHash, randomBytes } from "crypto"

import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export type AuthenticatedUser = {
  id: string
  email: string | null
}

type SupabaseIdentity = {
  id?: string
  provider?: string
  provider_id?: string | null
  identity_data?: Record<string, unknown> | null
}

type SupabaseUserResponse = {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown> | null
  identities?: SupabaseIdentity[] | null
}

type SupabaseOAuthSessionResponse = SupabaseVerifyResponse

type SupabaseGitHubOAuthState = {
  state: string
  codeVerifier: string
  redirectTo: string
  authorizationUrl: string
}

export type VerifiedGitHubIdentity = {
  provider: "github"
  providerId: string
  username: string
  identityId: string | null
  avatarUrl: string | null
  rawIdentityData: Record<string, unknown>
}

type SupabaseVerifyResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user?: SupabaseUserResponse | null
  error?: string
  error_description?: string
  msg?: string
}

const ACCESS_TOKEN_COOKIE = "tracecv-supabase-access-token"
const REFRESH_TOKEN_COOKIE = "tracecv-supabase-refresh-token"
export const GITHUB_OAUTH_STATE_COOKIE = "tracecv-github-oauth-state"
export const GITHUB_OAUTH_CODE_VERIFIER_COOKIE =
  "tracecv-github-oauth-code-verifier"
const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 60
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return { url, anonKey }
}

function getStringMetadataValue(
  metadata: Record<string, unknown> | null | undefined,
  keys: string[],
) {
  if (!metadata) {
    return null
  }

  for (const key of keys) {
    const value = metadata[key]

    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }

    if (typeof value === "number") {
      return String(value)
    }
  }

  return null
}

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function createPkceChallenge(codeVerifier: string) {
  return base64UrlEncode(createHash("sha256").update(codeVerifier).digest())
}

function getRequestOrigin(request: Request) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL

  if (configuredOrigin) {
    return configuredOrigin.replace(/\/$/, "")
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")
  const forwardedHost = request.headers.get("x-forwarded-host")

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

function getAuthHeaders(anonKey: string, accessToken?: string) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken ?? anonKey}`,
    "Content-Type": "application/json",
  }
}

function getSupabaseError(payload: SupabaseVerifyResponse, fallback: string) {
  return payload.error_description ?? payload.msg ?? payload.error ?? fallback
}

function normalizeUser(
  user: SupabaseUserResponse | null | undefined,
): AuthenticatedUser | null {
  if (!user?.id) {
    return null
  }

  return {
    id: user.id,
    email: user.email ?? null,
  }
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

export function createSupabaseGitHubOAuthState(
  request: Request,
): SupabaseGitHubOAuthState {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error(
      "Supabase Auth no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  const state = base64UrlEncode(randomBytes(32))
  const codeVerifier = base64UrlEncode(randomBytes(64))
  const redirectTo = `${getRequestOrigin(request)}/api/auth/github/callback`
  const authorizationUrl = new URL(`${config.url}/auth/v1/authorize`)
  authorizationUrl.searchParams.set("provider", "github")
  authorizationUrl.searchParams.set("redirect_to", redirectTo)
  authorizationUrl.searchParams.set("state", state)
  authorizationUrl.searchParams.set(
    "code_challenge",
    createPkceChallenge(codeVerifier),
  )
  authorizationUrl.searchParams.set("code_challenge_method", "s256")

  return {
    state,
    codeVerifier,
    redirectTo,
    authorizationUrl: authorizationUrl.toString(),
  }
}

export function extractVerifiedGitHubIdentity(
  user: SupabaseUserResponse | null | undefined,
): VerifiedGitHubIdentity | null {
  const identities = user?.identities ?? []
  const githubIdentity = identities.find(
    (identity) => identity.provider?.toLowerCase() === "github",
  )

  if (!githubIdentity) {
    return null
  }

  const metadata = githubIdentity.identity_data ?? {}
  const providerId =
    githubIdentity.provider_id ??
    getStringMetadataValue(metadata, ["provider_id", "sub", "id"])
  const username = getStringMetadataValue(metadata, [
    "user_name",
    "preferred_username",
    "login",
    "username",
    "name",
  ])

  if (!providerId || !username) {
    return null
  }

  return {
    provider: "github",
    providerId,
    username,
    identityId: githubIdentity.id ?? null,
    avatarUrl:
      getStringMetadataValue(metadata, ["avatar_url", "picture"]) ?? null,
    rawIdentityData: metadata,
  }
}

export async function exchangeSupabaseOAuthCodeForGitHubIdentity(
  code: string,
  codeVerifier: string,
) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error(
      "Supabase Auth no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  const response = await fetch(`${config.url}/auth/v1/token?grant_type=pkce`, {
    method: "POST",
    headers: getAuthHeaders(config.anonKey),
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  })
  const payload = (await response
    .json()
    .catch(() => ({}))) as SupabaseOAuthSessionResponse

  if (!response.ok || !payload.access_token) {
    throw new Error(
      getSupabaseError(
        payload,
        "No se pudo resolver el callback OAuth de GitHub.",
      ),
    )
  }

  const userResponse = await fetch(`${config.url}/auth/v1/user`, {
    headers: getAuthHeaders(config.anonKey, payload.access_token),
    cache: "no-store",
  })
  const authenticatedUser = (await userResponse
    .json()
    .catch(() => null)) as SupabaseUserResponse | null

  if (!userResponse.ok || !authenticatedUser) {
    throw new Error(
      "No se pudo obtener la identidad autenticada de GitHub desde Supabase.",
    )
  }

  const githubIdentity = extractVerifiedGitHubIdentity(authenticatedUser)

  if (!githubIdentity) {
    throw new Error(
      "No se encontró una identidad de GitHub verificada en la sesión OAuth.",
    )
  }

  return githubIdentity
}

export function isAuthConfigured() {
  return getSupabaseConfig() !== null
}

export async function requestEmailOtp(email: string) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error(
      "Supabase Auth no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  const response = await fetch(`${config.url}/auth/v1/otp`, {
    method: "POST",
    headers: getAuthHeaders(config.anonKey),
    body: JSON.stringify({
      email,
      should_create_user: true,
    }),
  })

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({}))) as SupabaseVerifyResponse
    throw new Error(
      getSupabaseError(
        payload,
        "No se pudo solicitar el código de verificación.",
      ),
    )
  }
}

export async function verifyEmailOtp(email: string, token: string) {
  const config = getSupabaseConfig()

  if (!config) {
    throw new Error(
      "Supabase Auth no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  const response = await fetch(`${config.url}/auth/v1/verify`, {
    method: "POST",
    headers: getAuthHeaders(config.anonKey),
    body: JSON.stringify({
      email,
      token,
      type: "email",
    }),
  })
  const payload = (await response
    .json()
    .catch(() => ({}))) as SupabaseVerifyResponse

  if (!response.ok || !payload.access_token || !payload.user) {
    throw new Error(getSupabaseError(payload, "Código inválido o expirado."))
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresIn: payload.expires_in ?? DEFAULT_ACCESS_TOKEN_MAX_AGE,
    user: normalizeUser(payload.user),
  }
}

async function getUserFromAccessToken(accessToken: string) {
  const config = getSupabaseConfig()

  if (!config) {
    return null
  }

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: getAuthHeaders(config.anonKey, accessToken),
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  const user = (await response
    .json()
    .catch(() => null)) as SupabaseUserResponse | null
  return normalizeUser(user)
}

export async function getCurrentUserFromRequest(request: Request) {
  const accessToken = getCookieValue(request, ACCESS_TOKEN_COOKIE)

  if (!accessToken) {
    return null
  }

  return getUserFromAccessToken(accessToken)
}

export async function getCurrentUserFromCookies() {
  const accessToken = cookies().get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) {
    return null
  }

  return getUserFromAccessToken(accessToken)
}

export async function requireAuthenticatedUser(request: Request) {
  const user = await getCurrentUserFromRequest(request)

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Authentication required. Inicia sesión con email para continuar.",
        },
        { status: 401 },
      ),
    }
  }

  return { user, response: null }
}

export function setAuthCookies(
  response: NextResponse,
  session: Awaited<ReturnType<typeof verifyEmailOtp>>,
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
    httpOnly: true,
    maxAge: session.expiresIn,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  if (session.refreshToken) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
      httpOnly: true,
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
}
