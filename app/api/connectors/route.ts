import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import { requireAuthenticatedUser } from "@/lib/auth"
import { getConnectedAccountsByUserId } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const { user, response } = await requireAuthenticatedUser(request)

  if (response || !user) {
    return response
  }

  const connectedAccounts = await getConnectedAccountsByUserId(user.id)
  const connectors = connectedAccounts
    .filter((account) => account.provider === "github" && account.status === "connected")
    .map((account) => ({
      id: account.id,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      username: account.username,
      status: account.status,
    }))

  return NextResponse.json({ success: true, connectors })
}

export function OPTIONS() {
  return optionsResponse()
}
