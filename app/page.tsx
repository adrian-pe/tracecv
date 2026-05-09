"use client"

import Image from "next/image"
import { FormEvent, useMemo, useState } from "react"

type GitHubProfile = {
  name: string | null
  bio: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  avatar_url: string
}

type GeneratedCvProject = {
  name: string
  url: string
  description: string | null
  language: string | null
  stars: number
  topics: string[]
  updatedAt: string
}

type GeneratedCv = {
  headline: string
  summary: string
  technicalSkills: string[]
  featuredProjects: GeneratedCvProject[]
  experienceHighlights: string[]
  openSourceSignals: string[]
  suggestedRoles: string[]
  languagesAndTools: string[]
}

type GitHubResponse = {
  success: boolean
  message: string
  user: {
    username: string
    profile: GitHubProfile
  }
  skillsDetected: string[]
  repositoriesProcessed: number
  totalRepositories: number
  languages: string[]
  topics: string[]
  cv: GeneratedCv
}

type SkillGroup = {
  title: string
  skills: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"

function getGitHubUsername(input: string) {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return ""
  }

  const withProtocol = /^https?:\/\//i.test(trimmedInput) ? trimmedInput : `https://${trimmedInput}`

  try {
    const url = new URL(withProtocol)
    const isGitHubUrl = url.hostname.replace(/^www\./, "") === "github.com"
    const username = url.pathname.split("/").filter(Boolean)[0]

    if (isGitHubUrl && username) {
      return username
    }
  } catch {
    // Si no es una URL válida, se trata como usuario directo.
  }

  return trimmedInput.replace(/^@/, "").split("/")[0]
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(date))
}

function groupTechnicalSkills(skills: string[]): SkillGroup[] {
  const categories = [
    { title: "Frontend", pattern: /(react|next|vue|angular|javascript|typescript|css|html|tailwind|ui|frontend)/i },
    { title: "Backend y APIs", pattern: /(node|express|api|rest|graphql|backend|java|go|php|ruby|server)/i },
    { title: "Datos e IA", pattern: /(python|data|sql|postgres|mysql|mongo|machine|ai|ml|analytics)/i },
    { title: "Cloud, DevOps y tooling", pattern: /(docker|kubernetes|aws|azure|gcp|ci|cd|devops|linux|terraform|vercel)/i }
  ]

  const groupedSkills = categories.map((category) => ({
    title: category.title,
    skills: skills.filter((skill) => category.pattern.test(skill))
  }))

  const groupedSkillNames = new Set(groupedSkills.flatMap((group) => group.skills))
  const otherSkills = skills.filter((skill) => !groupedSkillNames.has(skill))

  return [
    ...groupedSkills.filter((group) => group.skills.length > 0),
    ...(otherSkills.length > 0 ? [{ title: "Otras habilidades", skills: otherSkills }] : [])
  ]
}

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("")
  const [result, setResult] = useState<GitHubResponse | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const usernamePreview = useMemo(() => getGitHubUsername(githubUrl), [githubUrl])
  const technicalSkillGroups = useMemo(() => groupTechnicalSkills(result?.cv.technicalSkills ?? []), [result])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const username = getGitHubUsername(githubUrl)

    if (!username) {
      setError("Ingresa una URL o usuario de GitHub para continuar.")
      setResult(null)
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/github/${encodeURIComponent(username)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: 1 })
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo procesar el perfil de GitHub.")
      }

      setResult(data)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Ocurrió un error inesperado."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-content">
          <p className="eyebrow">TraceCV · Generador de CV técnico desde GitHub</p>
          <h1>Convierte un perfil de GitHub en un CV técnico listo para revisar.</h1>
          <p className="hero-description">
            Pega la URL pública de GitHub de un candidato o desarrollador. TraceCV analizará repositorios, lenguajes y topics
            para construir un resumen profesional, skills técnicas, proyectos destacados y roles sugeridos.
          </p>

          <form className="github-form" onSubmit={handleSubmit}>
            <label htmlFor="github-url">URL de GitHub</label>
            <div className="input-row">
              <input
                id="github-url"
                name="github-url"
                onChange={(event) => setGithubUrl(event.target.value)}
                placeholder="https://github.com/octocat"
                type="text"
                value={githubUrl}
              />
              <button disabled={isLoading} type="submit">
                {isLoading ? "Generando CV..." : "Generar CV"}
              </button>
            </div>
            <p className="helper-text">
              {usernamePreview
                ? `Se analizará el usuario: ${usernamePreview}`
                : "También puedes escribir solo el usuario, por ejemplo: octocat."}
            </p>
          </form>

          {error ? <div className="error-message">{error}</div> : null}
        </div>

        <aside className="status-panel" aria-label="Resumen de integración">
          <span className="pulse" />
          <strong>API integrada</strong>
          <code>{API_BASE_URL}/github/:username</code>
          <p>Lista para Vercel con API Routes serverless dentro de la misma app.</p>
        </aside>
      </section>

      {result ? (
        <section className="results-grid" aria-live="polite">
          <article className="cv-card">
            <header className="cv-header">
              <Image
                alt={`Avatar de ${result.user.username}`}
                height={128}
                src={result.user.profile.avatar_url}
                width={128}
              />
              <div className="cv-identity">
                <p className="eyebrow">CV técnico generado</p>
                <h2>{result.user.profile.name ?? result.user.username}</h2>
                <p className="cv-headline">{result.cv.headline}</p>
                <div className="cv-meta">
                  <span>@{result.user.username}</span>
                  {result.user.profile.location ? <span>{result.user.profile.location}</span> : null}
                  <span>{result.user.profile.public_repos} repos públicos</span>
                  <span>{result.user.profile.followers} seguidores</span>
                </div>
                {result.user.profile.bio ? <p className="muted">{result.user.profile.bio}</p> : null}
                <a
                  className="github-link"
                  href={`https://github.com/${result.user.username}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver perfil en GitHub
                </a>
              </div>
            </header>

            <section className="cv-section">
              <div className="section-heading">
                <p className="eyebrow">Resumen profesional</p>
                <h3>Perfil técnico</h3>
              </div>
              <p>{result.cv.summary}</p>
            </section>

            <section className="cv-section">
              <div className="section-heading">
                <p className="eyebrow">Skills técnicas</p>
                <h3>Habilidades agrupadas</h3>
              </div>
              {technicalSkillGroups.length ? (
                <div className="cv-skill-grid">
                  {technicalSkillGroups.map((group) => (
                    <div className="cv-skill-group" key={group.title}>
                      <h4>{group.title}</h4>
                      <div className="chip-list">
                        {group.skills.map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">No se detectaron skills técnicas para este perfil.</p>
              )}
            </section>

            <section className="cv-section">
              <div className="section-heading">
                <p className="eyebrow">Proyectos destacados</p>
                <h3>Repositorios con mayor señal</h3>
              </div>
              {result.cv.featuredProjects.length ? (
                <div className="cv-project-list">
                  {result.cv.featuredProjects.map((project) => (
                    <article className="cv-project" key={project.url}>
                      <div>
                        <h4>
                          <a href={project.url} rel="noreferrer" target="_blank">
                            {project.name}
                          </a>
                        </h4>
                        <p>{project.description ?? "Repositorio público sin descripción."}</p>
                      </div>
                      <div className="cv-project-meta">
                        {project.language ? <span>{project.language}</span> : null}
                        <span>{project.stars} ★</span>
                        <span>Actualizado: {formatDate(project.updatedAt)}</span>
                      </div>
                      {project.topics.length ? (
                        <div className="chip-list secondary">
                          {project.topics.slice(0, 6).map((topic) => (
                            <span key={`${project.url}-${topic}`}>{topic}</span>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="muted">No hay proyectos públicos para destacar.</p>
              )}
            </section>

            <section className="cv-section cv-two-columns">
              <div>
                <div className="section-heading">
                  <p className="eyebrow">Experiencia/open source</p>
                  <h3>Señales detectadas</h3>
                </div>
                <ul className="cv-list">
                  {result.cv.experienceHighlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                  {result.cv.openSourceSignals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="section-heading">
                  <p className="eyebrow">Roles sugeridos</p>
                  <h3>Posibles encajes</h3>
                </div>
                <div className="role-list">
                  {result.cv.suggestedRoles.map((role) => (
                    <span key={role}>{role}</span>
                  ))}
                </div>
              </div>
            </section>
          </article>

          <details className="json-card">
            <summary>Ver JSON crudo para depuración</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </section>
      ) : null}
    </main>
  )
}
