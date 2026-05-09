import { jsonResponse, optionsResponse } from "@/lib/api"
import { requireAuthenticatedUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { createProfileSnapshot } from "@/lib/profile-snapshot"
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
  const activities = db.activities.filter(
    (activity) => activity.userId === userId,
  )
  const skills = db.userSkills
    .filter((userSkill) => userSkill.userId === userId)
    .map((userSkill) => userSkill.skill)
  const { hash } = createProfileSnapshot({
    userId,
    skills,
    activities,
  })
  const anchorReceipt = await anchorHashOnStellar(hash)

  return jsonResponse(anchorReceipt)
}

export function OPTIONS() {
  return optionsResponse()
}
