import { jsonResponse, optionsResponse, parseUserId } from "@/lib/api"
import { db } from "@/lib/db"
import { createProfileSnapshot } from "@/lib/profile-snapshot"

export const runtime = "nodejs"

type ProfileSnapshotRouteContext = {
  params: {
    userId: string
  }
}

export function GET(_request: Request, { params }: ProfileSnapshotRouteContext) {
  const userId = parseUserId(params.userId)
  const activities = db.activities.filter((activity) => activity.userId === userId)
  const skills = db.userSkills.filter((userSkill) => userSkill.userId === userId).map((userSkill) => userSkill.skill)
  const { snapshot, hash } = createProfileSnapshot({
    userId,
    skills,
    activities
  })

  return jsonResponse({
    snapshot,
    hash,
    generatedAt: new Date().toISOString()
  })
}

export function OPTIONS() {
  return optionsResponse()
}
