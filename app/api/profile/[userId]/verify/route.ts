import { jsonResponse, optionsResponse, parseUserId } from "@/lib/api"
import { db } from "@/lib/db"
import { createProfileSnapshot } from "@/lib/profile-snapshot"
import { anchorHashOnStellar } from "@/lib/stellar"

export const runtime = "nodejs"

type ProfileVerifyRouteContext = {
  params: {
    userId: string
  }
}

function getVerificationSecret() {
  return (
    process.env.PROFILE_VERIFY_SECRET?.trim() ||
    process.env.VERIFY_API_SECRET?.trim() ||
    null
  )
}

function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.get("authorization")

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null
  }

  return authorizationHeader.slice("Bearer ".length).trim()
}

function isVerificationRequestAuthorized(request: Request) {
  const verificationSecret = getVerificationSecret()

  if (!verificationSecret) {
    return false
  }

  return (
    getBearerToken(request) === verificationSecret ||
    request.headers.get("x-tracecv-verify-secret") === verificationSecret
  )
}

export async function POST(
  request: Request,
  { params }: ProfileVerifyRouteContext,
) {
  if (!isVerificationRequestAuthorized(request)) {
    return jsonResponse(
      {
        error:
          "Profile verification is protected. Configure authentication before allowing Stellar anchoring requests.",
      },
      { status: getVerificationSecret() ? 401 : 503 },
    )
  }

  const userId = parseUserId(params.userId)
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
