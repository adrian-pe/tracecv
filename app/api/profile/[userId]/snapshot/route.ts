import { jsonResponse, optionsResponse } from "@/lib/api"
import { getProfileData } from "@/lib/db"
import { createProfileSnapshot } from "@/lib/profile-snapshot"

export const runtime = "nodejs"

type ProfileSnapshotRouteContext = {
  params: {
    userId: string
  }
}

export async function GET(
  _request: Request,
  { params }: ProfileSnapshotRouteContext,
) {
  const userId = decodeURIComponent(params.userId)
  const { activities, skills } = await getProfileData(userId)
  const { snapshot, hash } = createProfileSnapshot({
    userId,
    skills,
    activities,
  })

  return jsonResponse({
    snapshot,
    hash,
    generatedAt: new Date().toISOString(),
  })
}

export function OPTIONS() {
  return optionsResponse()
}
