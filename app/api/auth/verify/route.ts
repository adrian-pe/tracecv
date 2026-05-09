import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import { setAuthCookies, verifyEmailOtp } from "@/lib/auth"

export const runtime = "nodejs"

type VerifyRequest = {
  email?: string
  token?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VerifyRequest
  const email = body.email?.trim().toLowerCase()
  const token = body.token?.trim()

  if (!email || !token) {
    return NextResponse.json(
      { success: false, error: "Email and verification code are required" },
      { status: 400 },
    )
  }

  try {
    const session = await verifyEmailOtp(email, token)

    if (!session.user) {
      return NextResponse.json(
        { success: false, error: "Supabase did not return a user session" },
        { status: 401 },
      )
    }

    const response = NextResponse.json({ success: true, user: session.user })
    setAuthCookies(response, session)
    return response
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo validar el código de verificación.",
      },
      { status: 401 },
    )
  }
}

export function OPTIONS() {
  return optionsResponse()
}
