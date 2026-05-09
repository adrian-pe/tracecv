import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export type AuthenticatedUser = {
  id: string
  email: string | null
}

type SupabaseUserResponse = {
  id: string
  email?: string | null
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
