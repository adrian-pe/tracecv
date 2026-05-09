import { jsonResponse, optionsResponse, parseUserId } from "@/lib/api"
import { db, type Activity } from "@/lib/db"
import { generateCvFromGitHub } from "@/lib/cv-generator"
import { enrichGitHubData } from "@/lib/github-service"
import { extractSkillsFromGitHub } from "@/lib/skill-engine"

export const runtime = "nodejs"
export const maxDuration = 10

type GitHubRouteContext = {
  params: {
    username: string
  }
}

type GitHubImportRequest = {
  userId?: number | string
}

export async function POST(request: Request, { params }: GitHubRouteContext) {
  try {
    const body = (await request.json().catch(() => ({}))) as GitHubImportRequest
    const userId = parseUserId(body.userId)
    const username = decodeURIComponent(params.username)

    if (!username) {
      return jsonResponse({ success: false, error: "GitHub username is required" }, { status: 400 })
    }

    const gitHubData = await enrichGitHubData(username, userId)
    const skillsFromGitHub = extractSkillsFromGitHub(
      gitHubData.languages,
      gitHubData.topics,
      gitHubData.repositories
    )
    const cv = generateCvFromGitHub({
      profile: gitHubData.profile,
      repositories: gitHubData.repositories,
      languages: gitHubData.languages,
      topics: gitHubData.topics,
      skills: skillsFromGitHub
    })
    const reposToStore = gitHubData.repositories.slice(0, 20)

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
        updatedAt: new Date(repository.updated_at)
      }

      const exists = db.activities.some((activity) => activity.id === repoActivity.id)

      if (!exists) {
        db.activities.push(repoActivity)
      }
    })

    skillsFromGitHub.forEach((skill) => {
      const exists = db.userSkills.some((userSkill) => userSkill.userId === userId && userSkill.skill === skill)

      if (!exists) {
        db.userSkills.push({
          userId,
          skill,
          source: "github"
        })
      }
    })

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
          avatar_url: gitHubData.profile.avatar_url
        }
      },
      skillsDetected: skillsFromGitHub,
      repositoriesProcessed: reposToStore.length,
      totalRepositories: gitHubData.repositories.length,
      languages: gitHubData.languages,
      topics: gitHubData.topics,
      cv
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected GitHub processing error"

    return jsonResponse(
      {
        success: false,
        error: message
      },
      { status: 400 }
    )
  }
}

export function OPTIONS() {
  return optionsResponse()
}
