import { jsonResponse, optionsResponse } from "@/lib/api"
import { requireAuthenticatedUser } from "@/lib/auth"
import {
  createProfileSnapshotRecord,
  getProfileData,
  upsertUser,
} from "@/lib/db"
import {
  createProfileSnapshot,
  PROFILE_SNAPSHOT_SCHEMA_VERSION,
} from "@/lib/profile-snapshot"
import { anchorHashOnStellar } from "@/lib/stellar"

export const runtime = "nodejs"

type ProfileVerifyRouteContext = {
  params: {
    userId: string
  }
}

export async function POST(
  request: Request,
  { params }: ProfileVerifyRouteContext,
) {
  const { user, response } = await requireAuthenticatedUser(request)

  if (!user) {
    return response
  }

  const requestedUserId = decodeURIComponent(params.userId)

  if (requestedUserId !== user.id) {
    return jsonResponse(
      {
        success: false,
        error: "Cannot verify a profile for a different authenticated user."
      },
      { status: 403 }
    )
  }

  const userId = user.id
  await upsertUser(user)

  const { activities, skills } = await getProfileData(userId)
  const { hash } = createProfileSnapshot({
    userId,
    skills,
    activities,
  })
  const anchorReceipt = await anchorHashOnStellar(hash)

  await createProfileSnapshotRecord({
    user_id: userId,
    hash,
    schema_version: PROFILE_SNAPSHOT_SCHEMA_VERSION,
    receipt: anchorReceipt,
    transaction_hash: anchorReceipt.transactionHash,
    network: anchorReceipt.network,
  })

  return jsonResponse(anchorReceipt)
}

export function OPTIONS() {
  return optionsResponse()
}
