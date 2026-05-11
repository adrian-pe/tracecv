import { jsonResponse, optionsResponse } from "@/lib/api"
import { getProfileData } from "@/lib/db"

export const runtime = "nodejs"

type ProfileRouteContext = {
  params: {
    userId: string
  }
}

export async function GET(_request: Request, { params }: ProfileRouteContext) {
  const userId = decodeURIComponent(params.userId)
  const { activities, skills } = await getProfileData(userId)

  return jsonResponse({
    userId,
    skills,
    activities,
  })
}

export function OPTIONS() {
  return optionsResponse()
}
