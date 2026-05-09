import { NextResponse } from "next/server"

export function jsonResponse<T>(payload: T, init?: ResponseInit) {
  return NextResponse.json(payload, init)
}


export function getCorsHeaders() {
  return {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  }
}

export function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders()
  })
}
