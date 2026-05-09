export type Activity = {
  id: number | string
  userId: number
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
  userId: number
  skill: string
  activityId?: number | string
  source?: string
}

export type TraceCvDb = {
  users: unknown[]
  activities: Activity[]
  skills: string[]
  userSkills: UserSkill[]
}

const createInMemoryDb = (): TraceCvDb => ({
  users: [],
  activities: [],
  skills: [],
  userSkills: []
})

declare global {
  // eslint-disable-next-line no-var
  var traceCvDb: TraceCvDb | undefined
}

export const db = globalThis.traceCvDb ?? (globalThis.traceCvDb = createInMemoryDb())
