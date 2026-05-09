import type { Activity } from "./db"
import type { GitHubRepository } from "./github-service"

export function extractSkills(activity: Activity): string[] {
  const skills: string[] = []
  const title = activity.title.toLowerCase()

  if (title.includes("solidity") || title.includes("web3")) {
    skills.push("Blockchain")
  }

  if (title.includes("react")) {
    skills.push("React")
  }

  if (activity.source === "github") {
    skills.push("Programming")
  }

  return skills
}

export function extractSkillsFromGitHub(
  languages: string[] = [],
  topics: string[] = [],
  repositories: GitHubRepository[] = []
): string[] {
  const skillsSet = new Set<string>()

  const languageSkillMap: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    csharp: "C#",
    cpp: "C++",
    c: "C",
    go: "Go",
    rust: "Rust",
    ruby: "Ruby",
    php: "PHP",
    swift: "Swift",
    kotlin: "Kotlin",
    sql: "SQL",
    r: "R",
    solidity: "Blockchain",
    vyper: "Blockchain"
  }

  languages.forEach((language) => {
    const lowerLanguage = language.toLowerCase()
    const skill = languageSkillMap[lowerLanguage] ?? language
    skillsSet.add(skill)
  })

  const topicSkillMap: Record<string, string> = {
    "machine-learning": "Machine Learning",
    ml: "Machine Learning",
    ai: "AI",
    "artificial-intelligence": "AI",
    web3: "Web3",
    blockchain: "Blockchain",
    crypto: "Cryptocurrency",
    react: "React",
    vue: "Vue",
    angular: "Angular",
    nodejs: "Node.js",
    express: "Express",
    django: "Django",
    flask: "Flask",
    fastapi: "FastAPI",
    docker: "Docker",
    kubernetes: "Kubernetes",
    aws: "AWS",
    gcp: "GCP",
    azure: "Azure",
    mongodb: "MongoDB",
    postgresql: "PostgreSQL",
    mysql: "MySQL",
    redis: "Redis",
    api: "API Development",
    rest: "REST APIs",
    graphql: "GraphQL"
  }

  topics.forEach((topic) => {
    const lowerTopic = topic.toLowerCase().replace(/ /g, "-")
    const skill = topicSkillMap[lowerTopic]

    if (skill) {
      skillsSet.add(skill)
    }
  })

  repositories.forEach((repository) => {
    if (repository.description) {
      const description = repository.description.toLowerCase()

      if (description.includes("machine learning") || description.includes("neural network")) {
        skillsSet.add("Machine Learning")
      }

      if (description.includes("web3") || description.includes("blockchain")) {
        skillsSet.add("Blockchain")
      }

      if (description.includes("api")) {
        skillsSet.add("API Development")
      }

      if (description.includes("database") || description.includes("db")) {
        skillsSet.add("Database Design")
      }
    }

    if (repository.stargazers_count >= 100) {
      skillsSet.add("Open Source Contributor")
    }
  })

  return Array.from(skillsSet)
}
