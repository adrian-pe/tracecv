export type Activity = {
  id: number | string
  userId: string
  type?: string
  source?: string
  title: string
  url?: string
  description?: string | null
  language?: string | null
  stars?: number
  createdAt: Date
  updatedAt?: Date
}

export type UserSkill = {
  userId: string
  skill: string
  activityId?: number | string
  source?: string
}

export type User = {
  id: string
  email: string | null
  authProviderId: string
  createdAt: Date
}

export type Wallet = {
  id: string
  userId: string
  chain: string
  publicAddress: string
  encryptedSecretRef: string | null
  status: string
  createdAt: Date
}

export type ProfileSnapshot = {
  id: string
  userId: string
  hash: string
  schemaVersion: string
  receipt: Record<string, unknown> | null
  transactionHash: string | null
  network: string | null
  createdAt: Date
}

type SupabaseActivityRow = {
  id: string
  user_id: string
  type?: string | null
  source?: string | null
  title: string
  url?: string | null
  description?: string | null
  language?: string | null
  stars?: number | null
  created_at: string
  updated_at?: string | null
}

type SupabaseUserSkillRow = {
  user_id: string
  skill: string
  activity_id?: string | null
  source?: string | null
}

type SupabaseUserRow = {
  id: string
  email?: string | null
  auth_provider_id: string
  created_at: string
}

type SupabaseProfileSnapshotInsert = {
  user_id: string
  hash: string
  schema_version: string
  receipt?: Record<string, unknown> | null
  transaction_hash?: string | null
  network?: string | null
}

const SUPABASE_REST_ERROR_MESSAGE =
  "Supabase Postgres no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."

function getSupabaseRestConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return {
    restUrl: `${url}/rest/v1`,
    serviceRoleKey,
  }
}

function getSupabaseHeaders(prefer?: string) {
  const config = getSupabaseRestConfig()

  if (!config) {
    throw new Error(SUPABASE_REST_ERROR_MESSAGE)
  }

  return {
    config,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
  }
}

function parseSupabaseJson<T>(body: string): T | null {
  if (!body.trim()) {
    return null
  }

  try {
    return JSON.parse(body) as T
  } catch {
    return null
  }
}

async function requestSupabase<T>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const { config, headers } = getSupabaseHeaders(init.prefer)
  const response = await fetch(`${config.restUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...init.headers,
    },
    cache: "no-store",
  })
  const body = await response.text()

  if (!response.ok) {
    const payload = parseSupabaseJson<{
      message?: string
      details?: string
      hint?: string
    }>(body)
    const message = payload?.message ?? response.statusText
    const details = [payload?.details, payload?.hint].filter(Boolean).join(" ")

    throw new Error(
      `Supabase Postgres request failed (${response.status}): ${message}${
        details ? ` ${details}` : ""
      }`,
    )
  }

  return (parseSupabaseJson<T>(body) ?? null) as T
}

function toActivity(row: SupabaseActivityRow): Activity {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type ?? undefined,
    source: row.source ?? undefined,
    title: row.title,
    url: row.url ?? undefined,
    description: row.description ?? null,
    language: row.language ?? null,
    stars: row.stars ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
  }
}

function toUserSkill(row: SupabaseUserSkillRow): UserSkill {
  return {
    userId: row.user_id,
    skill: row.skill,
    activityId: row.activity_id ?? undefined,
    source: row.source ?? undefined,
  }
}

function activityToInsert(activity: Activity) {
  return {
    id: String(activity.id),
    user_id: activity.userId,
    type: activity.type ?? null,
    source: activity.source ?? null,
    title: activity.title,
    url: activity.url ?? null,
    description: activity.description ?? null,
    language: activity.language ?? null,
    stars: activity.stars ?? null,
    created_at: activity.createdAt.toISOString(),
    updated_at: activity.updatedAt?.toISOString() ?? null,
  }
}

function userSkillToInsert(userSkill: UserSkill) {
  return {
    user_id: userSkill.userId,
    skill: userSkill.skill,
    activity_id: userSkill.activityId ? String(userSkill.activityId) : null,
    source: userSkill.source ?? null,
  }
}

function userToInsert(user: { id: string; email: string | null }) {
  return {
    id: user.id,
    email: user.email,
    auth_provider_id: user.id,
  }
}

export async function upsertUser(user: { id: string; email: string | null }) {
  const rows = await requestSupabase<SupabaseUserRow[]>(
    "/users?on_conflict=id",
    {
      method: "POST",
      body: JSON.stringify(userToInsert(user)),
      prefer: "resolution=merge-duplicates,return=representation",
    },
  )

  const row = rows[0]

  return {
    id: row.id,
    email: row.email ?? null,
    authProviderId: row.auth_provider_id,
    createdAt: new Date(row.created_at),
  } satisfies User
}

export async function createActivity(activity: Activity) {
  const rows = await requestSupabase<SupabaseActivityRow[]>("/activities", {
    method: "POST",
    body: JSON.stringify(activityToInsert(activity)),
    prefer: "return=representation",
  })

  return toActivity(rows[0])
}

export async function upsertActivity(activity: Activity) {
  const rows = await requestSupabase<SupabaseActivityRow[]>(
    "/activities?on_conflict=id,user_id",
    {
      method: "POST",
      body: JSON.stringify(activityToInsert(activity)),
      prefer: "resolution=merge-duplicates,return=representation",
    },
  )

  return toActivity(rows[0])
}

export async function upsertActivities(activities: Activity[]) {
  if (activities.length === 0) {
    return []
  }

  const rows = await requestSupabase<SupabaseActivityRow[]>(
    "/activities?on_conflict=id,user_id",
    {
      method: "POST",
      body: JSON.stringify(activities.map(activityToInsert)),
      prefer: "resolution=merge-duplicates,return=representation",
    },
  )

  return rows.map(toActivity)
}

export async function upsertUserSkills(userSkills: UserSkill[]) {
  if (userSkills.length === 0) {
    return []
  }

  const uniqueSkills = Array.from(
    new Map(
      userSkills.map((userSkill) => [
        `${userSkill.userId}:${userSkill.skill}:${userSkill.activityId ?? ""}:${
          userSkill.source ?? ""
        }`,
        userSkill,
      ]),
    ).values(),
  )

  const rows = await requestSupabase<SupabaseUserSkillRow[]>(
    "/user_skills?on_conflict=user_id,skill,activity_id,source",
    {
      method: "POST",
      body: JSON.stringify(uniqueSkills.map(userSkillToInsert)),
      prefer: "resolution=ignore-duplicates,return=representation",
    },
  )

  return rows.map(toUserSkill)
}

export async function getActivitiesByUserId(userId: string) {
  const rows = await requestSupabase<SupabaseActivityRow[]>(
    `/activities?user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc`,
  )

  return rows.map(toActivity)
}

export async function getUserSkillsByUserId(userId: string) {
  const rows = await requestSupabase<SupabaseUserSkillRow[]>(
    `/user_skills?user_id=eq.${encodeURIComponent(userId)}&order=skill.asc`,
  )

  return rows.map(toUserSkill)
}

export async function getProfileData(userId: string) {
  const [activities, userSkills] = await Promise.all([
    getActivitiesByUserId(userId),
    getUserSkillsByUserId(userId),
  ])

  return {
    activities,
    userSkills,
    skills: [...new Set(userSkills.map((userSkill) => userSkill.skill))],
  }
}

export async function createProfileSnapshotRecord(
  snapshot: SupabaseProfileSnapshotInsert,
) {
  await requestSupabase<unknown>(
    "/profile_snapshots?on_conflict=user_id,hash",
    {
      method: "POST",
      body: JSON.stringify(snapshot),
      prefer: "resolution=ignore-duplicates,return=minimal",
    },
  )
}
