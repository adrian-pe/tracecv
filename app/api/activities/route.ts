import { jsonResponse, optionsResponse, parseUserId } from "@/lib/api"
import { db, type Activity } from "@/lib/db"
import { extractSkills } from "@/lib/skill-engine"

export const runtime = "nodejs"

type CreateActivityRequest = {
  userId?: number | string
  type?: string
  source?: string
  title?: string
  url?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CreateActivityRequest

  if (!body.title) {
    return jsonResponse({ success: false, error: "Activity title is required" }, { status: 400 })
  }

  const activity: Activity = {
    id: Date.now(),
    userId: parseUserId(body.userId),
    type: body.type,
    source: body.source,
    title: body.title,
    url: body.url,
    createdAt: new Date()
  }

  db.activities.push(activity)

  const skills = extractSkills(activity)

  skills.forEach((skill) => {
    db.userSkills.push({
      userId: activity.userId,
      skill,
      activityId: activity.id
    })
  })

  return jsonResponse({ success: true, activity, skills })
}

export function OPTIONS() {
  return optionsResponse()
}
