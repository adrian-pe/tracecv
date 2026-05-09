import { createHash } from "node:crypto"

import type { Activity } from "@/lib/db"

export const PROFILE_SNAPSHOT_SCHEMA_VERSION = "profile-snapshot/v1"

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type ProfileSnapshotInput = {
  userId: string
  skills: string[]
  activities: Activity[]
}

export type ProfileSnapshotTimestamps = {
  createdAt: string | null
  updatedAt: string | null
}

export type ProfileSnapshotDocument = {
  schemaVersion: typeof PROFILE_SNAPSHOT_SCHEMA_VERSION
  userId: string
  skills: string[]
  activities: JsonValue[]
  timestamps: ProfileSnapshotTimestamps
}

export type ProfileSnapshotResult = {
  snapshot: string
  hash: string
}

function toIsoTimestamp(value: Date | string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function normalizeJsonValue(value: unknown): JsonValue | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item) ?? null)
  }

  if (typeof value === "object") {
    const normalizedObject: { [key: string]: JsonValue } = {}

    for (const key of Object.keys(value).sort()) {
      const normalizedValue = normalizeJsonValue((value as Record<string, unknown>)[key])

      if (normalizedValue !== undefined) {
        normalizedObject[key] = normalizedValue
      }
    }

    return normalizedObject
  }

  return String(value)
}

function canonicalStringify(value: JsonValue): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalStringify(item)).join(",")}]`
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`)
    .join(",")}}`
}

function compareActivities(left: JsonValue, right: JsonValue): number {
  return canonicalStringify(left).localeCompare(canonicalStringify(right))
}

function buildTimestamps(activities: Activity[]): ProfileSnapshotTimestamps {
  const createdAtValues = activities.map((activity) => toIsoTimestamp(activity.createdAt)).filter((value): value is string => value !== null)
  const updatedAtValues = activities
    .map((activity) => toIsoTimestamp(activity.updatedAt ?? activity.createdAt))
    .filter((value): value is string => value !== null)

  return {
    createdAt: createdAtValues.length > 0 ? createdAtValues.sort()[0] : null,
    updatedAt: updatedAtValues.length > 0 ? updatedAtValues.sort().at(-1) ?? null : null
  }
}

export function buildProfileSnapshotDocument({ userId, skills, activities }: ProfileSnapshotInput): ProfileSnapshotDocument {
  return {
    schemaVersion: PROFILE_SNAPSHOT_SCHEMA_VERSION,
    userId,
    skills: [...new Set(skills)].sort((left, right) => left.localeCompare(right)),
    activities: activities.map((activity) => normalizeJsonValue(activity) ?? null).sort(compareActivities),
    timestamps: buildTimestamps(activities)
  }
}

export function createProfileSnapshot(input: ProfileSnapshotInput): ProfileSnapshotResult {
  const snapshotDocument = buildProfileSnapshotDocument(input)
  const snapshot = canonicalStringify(snapshotDocument)
  const hash = createHash("sha256").update(snapshot, "utf8").digest("hex")

  return {
    snapshot,
    hash
  }
}
