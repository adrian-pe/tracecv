import { jsonResponse, optionsResponse } from "@/lib/api"
import { requireAuthenticatedUser } from "@/lib/auth"
import {
  createActivity,
  upsertUser,
  upsertUserSkills,
  type Activity,
} from "@/lib/db"
import { extractSkills } from "@/lib/skill-engine"

export const runtime = "nodejs"

type CreateActivityRequest = {
  type?: string
  source?: string
  title?: string
  url?: string
}

export async function POST(request: Request) {
  const { user, response } = await requireAuthenticatedUser(request)

  if (!user) {
    return response
  }

  const body = (await request.json().catch(() => ({}))) as CreateActivityRequest

  if (!body.title) {
    return jsonResponse({ success: false, error: "Activity title is required" }, { status: 400 })
  }

  const activity: Activity = {
    id: Date.now(),
    userId: user.id,
    type: body.type,
    source: body.source,
    title: body.title,
    url: body.url,
    createdAt: new Date()
  }

  await upsertUser(user)
  const savedActivity = await createActivity(activity)

  const skills = extractSkills(savedActivity)

  await upsertUserSkills(
    skills.map((skill) => ({
      userId: savedActivity.userId,
      skill,
      activityId: savedActivity.id,
    })),
  )

  return jsonResponse({ success: true, activity: savedActivity, skills })
}

export function OPTIONS() {
  return optionsResponse()
}
