import { jsonResponse, optionsResponse, parseUserId } from "@/lib/api"
import { db } from "@/lib/db"

export const runtime = "nodejs"

type ProfileRouteContext = {
  params: {
    userId: string
  }
}

export function GET(_request: Request, { params }: ProfileRouteContext) {
  const userId = parseUserId(params.userId)
  const activities = db.activities.filter((activity) => activity.userId === userId)
  const skills = db.userSkills.filter((userSkill) => userSkill.userId === userId).map((userSkill) => userSkill.skill)
  const uniqueSkills = [...new Set(skills)]

  return jsonResponse({
    userId,
    skills: uniqueSkills,
    activities
  })
}

export function OPTIONS() {
  return optionsResponse()
}
