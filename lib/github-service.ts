const GITHUB_API_BASE_URL =
  process.env.GITHUB_API_BASE_URL ?? "https://api.github.com"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

export type GitHubProfile = {
  name: string | null
  bio: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
}

export type GitHubRepository = {
  id: number
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  created_at: string
  updated_at: string
  topics?: string[]
}

export type EnrichedGitHubData = {
  profile: GitHubProfile
  repositories: GitHubRepository[]
  languages: string[]
  topics: string[]
  username: string
  userId: string | null
}

type GitHubErrorPayload = {
  message?: string
}

function createGitHubHeaders(accessToken?: string | null) {
  const token = accessToken?.trim() || GITHUB_TOKEN

  return {
    Accept: "application/vnd.github.v3+json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function requestGitHub<T>(path: string, accessToken?: string | null): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    headers: createGitHubHeaders(accessToken),
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    const payload = (await response
      .json()
      .catch(() => ({}))) as GitHubErrorPayload
    const reason = payload.message ?? response.statusText

    if (response.status === 404) {
      throw new Error("GitHub resource not found")
    }

    throw new Error(`GitHub API error (${response.status}): ${reason}`)
  }

  return response.json() as Promise<T>
}

export async function fetchUserProfile(
  username: string,
  accessToken?: string | null,
): Promise<GitHubProfile> {
  try {
    return await requestGitHub<GitHubProfile>(
      `/users/${encodeURIComponent(username)}`,
      accessToken,
    )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "GitHub resource not found"
    ) {
      throw new Error(`GitHub user "${username}" not found`)
    }

    throw error
  }
}

export async function fetchUserRepositories(
  username: string,
  accessToken?: string | null,
): Promise<GitHubRepository[]> {
  return requestGitHub<GitHubRepository[]>(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc`,
    accessToken,
  )
}

export async function enrichGitHubData(
  username: string,
  userId: string | null,
  accessToken?: string | null,
): Promise<EnrichedGitHubData> {
  const [profile, repositories] = await Promise.all([
    fetchUserProfile(username, accessToken),
    fetchUserRepositories(username, accessToken),
  ])

  const languages = new Set<string>()
  const topics = new Set<string>()

  repositories.forEach((repository) => {
    if (repository.language) {
      languages.add(repository.language)
    }

    if (repository.topics) {
      repository.topics.forEach((topic) => topics.add(topic))
    }
  })

  return {
    profile,
    repositories,
    languages: Array.from(languages),
    topics: Array.from(topics),
    username,
    userId,
  }
}
