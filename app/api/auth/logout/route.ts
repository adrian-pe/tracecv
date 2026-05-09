import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import { clearAuthCookies } from "@/lib/auth"

export const runtime = "nodejs"

export function POST() {
  const response = NextResponse.json({ success: true })
  clearAuthCookies(response)
  return response
}

export function OPTIONS() {
  return optionsResponse()
}
