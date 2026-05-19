import { jsonResponse, optionsResponse } from "@/lib/api"
import { getCurrentUserFromRequest } from "@/lib/auth"
import {
  createProfileSnapshotRecord,
  getConnectedAccountsByUserId,
  getProfileData,
  upsertActivities,
  upsertUser,
  upsertUserSkills,
  type Activity,
} from "@/lib/db"
import { generateCvFromGitHub } from "@/lib/cv-generator"
import { enrichGitHubData } from "@/lib/github-service"
import {
  createProfileSnapshot,
  PROFILE_SNAPSHOT_SCHEMA_VERSION,
} from "@/lib/profile-snapshot"
import { extractSkillsFromGitHub } from "@/lib/skill-engine"
import {
  anchorProfileSnapshotHash,
  isBlockchainAnchorConfigured,
} from "@/lib/blockchain-anchor"
import { getStellarNetworkDisplayName } from "@/lib/stellar"

export const runtime = "nodejs"
export const maxDuration = 30

type ImportBody = {
  connectionId?: string
  username?: string
  preview?: boolean
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as ImportBody
    const user = await getCurrentUserFromRequest(request)
    const userId = user?.id ?? null
    const isPreview = body.preview === true

    let username = body.username?.trim() ?? ""
    let accessToken: string | null = null

    if (!isPreview) {
      if (!userId || !body.connectionId) {
        return jsonResponse(
          { success: false, error: "Debes seleccionar una cuenta conectada." },
          { status: 401 },
        )
      }

      const connections = await getConnectedAccountsByUserId(userId)
      const connection = connections.find(
        (account) =>
          account.id === body.connectionId &&
          account.provider === "github" &&
          account.status === "connected",
      )

      if (!connection) {
        return jsonResponse(
          { success: false, error: "Conexión de GitHub inválida." },
          { status: 403 },
        )
      }

      username = connection.username
      accessToken = connection.accessTokenRef
    }

    if (!username) {
      return jsonResponse(
        { success: false, error: "GitHub username is required" },
        { status: 400 },
      )
    }

    const gitHubData = await enrichGitHubData(
      username,
      isPreview ? null : userId,
      accessToken,
    )
    const skillsFromGitHub = extractSkillsFromGitHub(
      gitHubData.languages,
      gitHubData.topics,
      gitHubData.repositories,
    )
    const cv = generateCvFromGitHub({
      profile: gitHubData.profile,
      repositories: gitHubData.repositories,
      languages: gitHubData.languages,
      topics: gitHubData.topics,
      skills: skillsFromGitHub,
    })
    const reposToStore = gitHubData.repositories.slice(0, 20)
    let profileHash: string | null = null
    let verification = null

    if (!isPreview && userId && user) {
      await upsertUser(user)

      const repoActivities: Activity[] = reposToStore.map((repository) => ({
        id: `github-${repository.id}`,
        userId,
        type: "repository",
        source: "github",
        title: repository.name,
        url: repository.html_url,
        description: repository.description,
        language: repository.language,
        stars: repository.stargazers_count,
        createdAt: new Date(repository.created_at),
        updatedAt: new Date(repository.updated_at),
      }))

      await upsertActivities(repoActivities)
      await upsertUserSkills(
        skillsFromGitHub.map((skill) => ({
          userId,
          skill,
          source: "github",
        })),
      )

      const { activities: profileActivities, skills: profileSkills } =
        await getProfileData(userId)
      const snapshot = createProfileSnapshot({
        userId,
        skills: profileSkills,
        activities: profileActivities,
      })
      profileHash = snapshot.hash

      if (isBlockchainAnchorConfigured()) {
        try {
          verification = await anchorProfileSnapshotHash({
            hash: profileHash,
            profileId: String(userId),
            schemaVersion: PROFILE_SNAPSHOT_SCHEMA_VERSION,
          })
        } catch (verificationError) {
          const verificationErrorMessage =
            verificationError instanceof Error
              ? verificationError.message
              : "No se pudo anclar el hash en Stellar."

          verification = {
            provider: "stellar" as const,
            profileHash,
            hash: profileHash,
            verifiedAt: new Date().toISOString(),
            network: getStellarNetworkDisplayName(),
            transactionHash: null,
            explorerUrl: null,
            error: verificationErrorMessage,
          }
        }
      }

      await createProfileSnapshotRecord({
        user_id: userId,
        hash: profileHash,
        schema_version: PROFILE_SNAPSHOT_SCHEMA_VERSION,
        receipt: verification,
        transaction_hash: verification?.transactionHash ?? null,
        network: verification?.network ?? null,
      })
    }

    return jsonResponse({
      success: true,
      message: `GitHub profile for "${username}" processed successfully`,
      preview: isPreview,
      user: {
        username: gitHubData.username,
        profile: {
          name: gitHubData.profile.name,
          bio: gitHubData.profile.bio,
          location: gitHubData.profile.location,
          public_repos: gitHubData.profile.public_repos,
          followers: gitHubData.profile.followers,
          following: gitHubData.profile.following,
          created_at: gitHubData.profile.created_at,
          avatar_url: gitHubData.profile.avatar_url,
        },
      },
      skillsDetected: skillsFromGitHub,
      repositoriesProcessed: reposToStore.length,
      totalRepositories: gitHubData.repositories.length,
      languages: gitHubData.languages,
      topics: gitHubData.topics,
      cv,
      profileHash,
      hash: profileHash,
      verifiedAt: verification?.verifiedAt ?? null,
      network: verification?.network ?? null,
      transactionHash: verification?.transactionHash ?? null,
      explorerUrl: verification?.explorerUrl ?? null,
      verificationError:
        verification && "error" in verification ? verification.error : null,
      verification,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected GitHub processing error"

    return jsonResponse(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    )
  }
}

export function OPTIONS() {
  return optionsResponse()
}
