import { NextRequest, NextResponse } from "next/server"

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []

function resolveAllowedOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get("origin")

  if (!requestOrigin) {
    return "*"
  }

  if (allowedOrigins.length === 0 || allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  return allowedOrigins[0] ?? requestOrigin
}

function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Origin", resolveAllowedOrigin(request))
  return response
}

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), request)
  }

  return applyCorsHeaders(NextResponse.next(), request)
}

export const config = {
  matcher: "/api/:path*"
}
