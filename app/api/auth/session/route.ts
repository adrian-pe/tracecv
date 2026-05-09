import { jsonResponse, optionsResponse } from "@/lib/api"
import { getCurrentUserFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const user = await getCurrentUserFromRequest(request)

  return jsonResponse({ authenticated: Boolean(user), user })
}

export function OPTIONS() {
  return optionsResponse()
}
