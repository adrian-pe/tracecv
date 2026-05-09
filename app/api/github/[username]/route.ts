import { jsonResponse, optionsResponse } from "@/lib/api"
import {
  anchorProfileSnapshotHash,
  isBlockchainAnchorConfigured,
} from "@/lib/blockchain-anchor"
import { getCurrentUserFromRequest } from "@/lib/auth"
import { db, type Activity } from "@/lib/db"
import { generateCvFromGitHub } from "@/lib/cv-generator"
import { enrichGitHubData } from "@/lib/github-service"
import {
  createProfileSnapshot,
  PROFILE_SNAPSHOT_SCHEMA_VERSION,
} from "@/lib/profile-snapshot"
import { extractSkillsFromGitHub } from "@/lib/skill-engine"
import { getStellarNetworkDisplayName } from "@/lib/stellar"

export const runtime = "nodejs"
export const maxDuration = 30

type GitHubRouteContext = {
  params: {
    username: string
  }
}

export async function POST(request: Request, { params }: GitHubRouteContext) {
  try {
    const user = await getCurrentUserFromRequest(request)
    const userId = user?.id ?? null
    const username = decodeURIComponent(params.username)

    if (!username) {
      return jsonResponse(
        { success: false, error: "GitHub username is required" },
        { status: 400 },
      )
    }

    const gitHubData = await enrichGitHubData(username, userId)
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

    if (userId) {
      reposToStore.forEach((repository) => {
        const repoActivity: Activity = {
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
        }

        const exists = db.activities.some(
          (activity) =>
            activity.id === repoActivity.id && activity.userId === userId,
        )

        if (!exists) {
          db.activities.push(repoActivity)
        }
      })

      skillsFromGitHub.forEach((skill) => {
        const exists = db.userSkills.some(
          (userSkill) =>
            userSkill.userId === userId && userSkill.skill === skill,
        )

        if (!exists) {
          db.userSkills.push({
            userId,
            skill,
            source: "github",
          })
        }
      })

      const profileActivities = db.activities.filter(
        (activity) => activity.userId === userId,
      )
      const profileSkills = db.userSkills
        .filter((userSkill) => userSkill.userId === userId)
        .map((userSkill) => userSkill.skill)
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
    }

    return jsonResponse({
      success: true,
      message: `GitHub profile for "${username}" processed successfully`,
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
