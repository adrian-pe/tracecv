import { NextResponse } from "next/server"

import { optionsResponse } from "@/lib/api"
import { requireAuthenticatedUser } from "@/lib/auth"
import { disconnectConnectedAccount, getConnectedAccountsByUserId } from "@/lib/db"

export const runtime = "nodejs"

type RouteContext = {
  params: {
    connectionId: string
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { user, response } = await requireAuthenticatedUser(request)

  if (response || !user) {
    return response
  }

  const { connectionId } = context.params
  const userConnections = await getConnectedAccountsByUserId(user.id)
  const connection = userConnections.find(
    (account) => account.id === connectionId && account.provider === "github",
  )

  if (!connection) {
    return NextResponse.json(
      { success: false, error: "Conexión no encontrada." },
      { status: 404 },
    )
  }

  await disconnectConnectedAccount(user.id, "github", connection.providerAccountId)

  return NextResponse.json({ success: true })
}

export function OPTIONS() {
  return optionsResponse()
}
