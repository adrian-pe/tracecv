import type { GitHubProfile, GitHubRepository } from "./github-service"

export type GeneratedCvProject = {
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  topics: string[]
  updatedAt: string
}

export type GeneratedCv = {
  headline: string
  summary: string
  technicalSkills: string[]
  featuredProjects: GeneratedCvProject[]
  experienceHighlights: string[]
  openSourceSignals: string[]
  suggestedRoles: string[]
  languagesAndTools: string[]
}

type GenerateCvInput = {
  profile: GitHubProfile
  repositories: GitHubRepository[]
  languages: string[]
  topics: string[]
  skills: string[]
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function formatTopic(topic: string): string {
  return topic
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function createHeadline(profile: GitHubProfile, skills: string[], languages: string[]): string {
  if (profile.bio) {
    return profile.bio
  }

  const primaryCapabilities = uniqueValues([...skills, ...languages]).slice(0, 3)

  if (primaryCapabilities.length > 0) {
    return `Developer focused on ${primaryCapabilities.join(", ")}`
  }

  return "Software developer with a public GitHub portfolio"
}

function createSummary(profile: GitHubProfile, repositories: GitHubRepository[], languages: string[]): string {
  const repoCount = repositories.length || profile.public_repos
  const languageSummary = languages.slice(0, 5).join(", ")
  const languageSentence = languageSummary ? ` Primary languages include ${languageSummary}.` : ""

  return `${profile.name ?? "This developer"} maintains ${repoCount} public repositories and has ${profile.followers} GitHub followers.${languageSentence}`
}

function createExperienceHighlights(repositories: GitHubRepository[], languages: string[], topics: string[]): string[] {
  const highlights = [
    repositories.length > 0 ? `Maintains ${repositories.length} public repositories on GitHub.` : null,
    languages.length > 0 ? `Works across ${languages.slice(0, 6).join(", ")}.` : null,
    topics.length > 0 ? `Repository topics show focus areas including ${topics.slice(0, 6).map(formatTopic).join(", ")}.` : null
  ]

  const starredRepositories = repositories.filter((repository) => repository.stargazers_count > 0)
  const totalStars = repositories.reduce((total, repository) => total + repository.stargazers_count, 0)

  if (starredRepositories.length > 0) {
    highlights.push(`Earned ${totalStars} stars across ${starredRepositories.length} repositories.`)
  }

  return highlights.filter((highlight): highlight is string => Boolean(highlight))
}

function createOpenSourceSignals(profile: GitHubProfile, repositories: GitHubRepository[]): string[] {
  const signals = [
    `Public GitHub presence since ${new Date(profile.created_at).getFullYear()}.`,
    `${profile.followers} followers and ${profile.public_repos} public repositories.`
  ]

  const reposWithDescriptions = repositories.filter((repository) => repository.description)
  const reposWithTopics = repositories.filter((repository) => repository.topics && repository.topics.length > 0)
  const topRepository = repositories.reduce<GitHubRepository | null>((currentTop, repository) => {
    if (!currentTop || repository.stargazers_count > currentTop.stargazers_count) {
      return repository
    }

    return currentTop
  }, null)

  if (reposWithDescriptions.length > 0) {
    signals.push(`${reposWithDescriptions.length} repositories include project descriptions.`)
  }

  if (reposWithTopics.length > 0) {
    signals.push(`${reposWithTopics.length} repositories use GitHub topics for discoverability.`)
  }

  if (topRepository && topRepository.stargazers_count > 0) {
    signals.push(`Most-starred repository is ${topRepository.name} with ${topRepository.stargazers_count} stars.`)
  }

  return signals
}

function createSuggestedRoles(skills: string[], languages: string[], topics: string[]): string[] {
  const combinedSignals = uniqueValues([...skills, ...languages, ...topics.map(formatTopic)]).map((signal) => signal.toLowerCase())
  const roles = new Set<string>()

  if (combinedSignals.some((signal) => ["react", "vue", "angular", "javascript", "typescript"].includes(signal))) {
    roles.add("Frontend Developer")
  }

  if (combinedSignals.some((signal) => ["node.js", "nodejs", "express", "api development", "rest apis", "graphql"].includes(signal))) {
    roles.add("Backend Developer")
  }

  if (combinedSignals.some((signal) => ["python", "machine learning", "ai", "data", "sql"].includes(signal))) {
    roles.add("Data/AI Engineer")
  }

  if (combinedSignals.some((signal) => ["docker", "kubernetes", "aws", "gcp", "azure"].includes(signal))) {
    roles.add("DevOps Engineer")
  }

  if (combinedSignals.some((signal) => ["blockchain", "web3", "cryptocurrency", "solidity"].includes(signal))) {
    roles.add("Web3 Developer")
  }

  if (roles.size === 0) {
    roles.add("Software Engineer")
  }

  return Array.from(roles).slice(0, 5)
}

function rankRepositories(repositories: GitHubRepository[]): GitHubRepository[] {
  return [...repositories].sort((leftRepository, rightRepository) => {
    const starDifference = rightRepository.stargazers_count - leftRepository.stargazers_count

    if (starDifference !== 0) {
      return starDifference
    }

    const updatedDifference = new Date(rightRepository.updated_at).getTime() - new Date(leftRepository.updated_at).getTime()

    if (updatedDifference !== 0) {
      return updatedDifference
    }

    const descriptionDifference = Number(Boolean(rightRepository.description)) - Number(Boolean(leftRepository.description))

    if (descriptionDifference !== 0) {
      return descriptionDifference
    }

    return Number(Boolean(rightRepository.topics?.length)) - Number(Boolean(leftRepository.topics?.length))
  })
}

export function generateCvFromGitHub({
  profile,
  repositories,
  languages,
  topics,
  skills
}: GenerateCvInput): GeneratedCv {
  const featuredProjects = rankRepositories(repositories)
    .slice(0, 5)
    .map((repository) => ({
      name: repository.name,
      url: repository.html_url,
      description: repository.description,
      language: repository.language,
      stars: repository.stargazers_count,
      topics: repository.topics ?? [],
      updatedAt: repository.updated_at
    }))

  const technicalSkills = uniqueValues(skills)
  const languagesAndTools = uniqueValues([...languages, ...topics.map(formatTopic)])

  return {
    headline: createHeadline(profile, technicalSkills, languages),
    summary: createSummary(profile, repositories, languages),
    technicalSkills,
    featuredProjects,
    experienceHighlights: createExperienceHighlights(repositories, languages, topics),
    openSourceSignals: createOpenSourceSignals(profile, repositories),
    suggestedRoles: createSuggestedRoles(technicalSkills, languages, topics),
    languagesAndTools
  }
}
