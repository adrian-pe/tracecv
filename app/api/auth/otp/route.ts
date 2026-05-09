import { jsonResponse, optionsResponse } from "@/lib/api"
import { requestEmailOtp } from "@/lib/auth"

export const runtime = "nodejs"

type OtpRequest = {
  email?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as OtpRequest
  const email = body.email?.trim().toLowerCase()

  if (!email) {
    return jsonResponse({ success: false, error: "Email is required" }, { status: 400 })
  }

  try {
    await requestEmailOtp(email)
    return jsonResponse({ success: true, message: "OTP enviado. Revisa tu email para continuar." })
  } catch (error) {
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "No se pudo enviar el OTP." },
      { status: 400 }
    )
  }
}

export function OPTIONS() {
  return optionsResponse()
}
