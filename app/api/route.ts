import { jsonResponse, optionsResponse } from "@/lib/api"

export const runtime = "nodejs"

export function GET() {
  return jsonResponse({ status: "ok", message: "TraceCV API running 🚀" })
}

export function OPTIONS() {
  return optionsResponse()
}
