"use client"

import Image from "next/image"
import { FormEvent, useEffect, useMemo, useState } from "react"

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

type ProfileVerification = {
  profileHash?: string | null
  hash?: string | null
  verifiedAt?: string | null
  network?: string | null
  transactionHash?: string | null
  explorerUrl?: string | null
  error?: string | null
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
  profileHash?: string | null
  hash?: string | null
  verifiedAt?: string | null
  network?: string | null
  transactionHash?: string | null
  explorerUrl?: string | null
  verificationError?: string | null
  verification?: ProfileVerification | null
}

type VerificationSummary = {
  profileHash: string | null
  verifiedAt: string | null
  network: string | null
  transactionHash: string | null
  explorerUrl: string | null
  error: string | null
  status: "unverified" | "hash-generated" | "anchored" | "error"
  label: string
}

type SkillGroup = {
  title: string
  skills: string[]
}

type AuthenticatedUser = {
  id: string
  email: string | null
}

type HomeClientProps = {
  user: AuthenticatedUser | null
}

type Connector = {
  id: string
  provider: "github"
  providerAccountId: string
  username: string
  status: "connected" | "disconnected" | "revoked"
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"

function getGitHubUsername(input: string) {
  const trimmedInput = input.trim()

  if (!trimmedInput) {
    return ""
  }

  const withProtocol = /^https?:\/\//i.test(trimmedInput)
    ? trimmedInput
    : `https://${trimmedInput}`

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
    day: "numeric",
  }).format(new Date(date))
}

function groupTechnicalSkills(skills: string[]): SkillGroup[] {
  const categories = [
    {
      title: "Frontend",
      pattern:
        /(react|next|vue|angular|javascript|typescript|css|html|tailwind|ui|frontend)/i,
    },
    {
      title: "Backend y APIs",
      pattern:
        /(node|express|api|rest|graphql|backend|java|go|php|ruby|server)/i,
    },
    {
      title: "Datos e IA",
      pattern:
        /(python|data|sql|postgres|mysql|mongo|machine|ai|ml|analytics)/i,
    },
    {
      title: "Cloud, DevOps y tooling",
      pattern:
        /(docker|kubernetes|aws|azure|gcp|ci|cd|devops|linux|terraform|vercel)/i,
    },
  ]

  const groupedSkills = categories.map((category) => ({
    title: category.title,
    skills: skills.filter((skill) => category.pattern.test(skill)),
  }))

  const groupedSkillNames = new Set(
    groupedSkills.flatMap((group) => group.skills),
  )
  const otherSkills = skills.filter((skill) => !groupedSkillNames.has(skill))

  return [
    ...groupedSkills.filter((group) => group.skills.length > 0),
    ...(otherSkills.length > 0
      ? [{ title: "Otras habilidades", skills: otherSkills }]
      : []),
  ]
}

function getVerificationSummary(
  result: GitHubResponse | null,
): VerificationSummary {
  const verification = result?.verification
  const profileHash =
    result?.profileHash ??
    result?.hash ??
    verification?.profileHash ??
    verification?.hash ??
    null
  const transactionHash =
    result?.transactionHash ?? verification?.transactionHash ?? null
  const explorerUrl = result?.explorerUrl ?? verification?.explorerUrl ?? null
  const error = result?.verificationError ?? verification?.error ?? null

  if (error) {
    return {
      profileHash,
      verifiedAt: result?.verifiedAt ?? verification?.verifiedAt ?? null,
      network: result?.network ?? verification?.network ?? null,
      transactionHash,
      explorerUrl,
      error,
      status: "error",
      label: "Error de verificación",
    }
  }

  if (transactionHash) {
    return {
      profileHash,
      verifiedAt: result?.verifiedAt ?? verification?.verifiedAt ?? null,
      network: result?.network ?? verification?.network ?? null,
      transactionHash,
      explorerUrl,
      error: null,
      status: "anchored",
      label: "Anclado on-chain",
    }
  }

  if (profileHash) {
    return {
      profileHash,
      verifiedAt: result?.verifiedAt ?? verification?.verifiedAt ?? null,
      network: result?.network ?? verification?.network ?? null,
      transactionHash: null,
      explorerUrl: null,
      error: null,
      status: "hash-generated",
      label: "Hash generado",
    }
  }

  return {
    profileHash: null,
    verifiedAt: null,
    network: null,
    transactionHash: null,
    explorerUrl: null,
    error: null,
    status: "unverified",
    label: "No verificado",
  }
}

export default function HomeClient({ user }: HomeClientProps) {
  const isAuthenticated = Boolean(user)
  const [githubUrl, setGithubUrl] = useState("")
  const [result, setResult] = useState<GitHubResponse | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState("")
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [isConnectorsLoading, setIsConnectorsLoading] = useState(false)
  const [connectorsError, setConnectorsError] = useState("")
  const [disconnectingId, setDisconnectingId] = useState("")

  const usernamePreview = useMemo(
    () => getGitHubUsername(githubUrl),
    [githubUrl],
  )
  const technicalSkillGroups = useMemo(
    () => groupTechnicalSkills(result?.cv.technicalSkills ?? []),
    [result],
  )
  const verificationSummary = useMemo(
    () => getVerificationSummary(result),
    [result],
  )

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
    setCopyStatus("")
    setResult(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/github/${encodeURIComponent(username)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ?? "No se pudo procesar el perfil de GitHub.",
        )
      }

      setResult(data)
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error inesperado."
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCopyProfileHash() {
    if (!verificationSummary.profileHash) {
      return
    }

    try {
      await navigator.clipboard.writeText(verificationSummary.profileHash)
      setCopyStatus("Hash copiado")
    } catch {
      setCopyStatus("No se pudo copiar el hash")
    }
  }

  function handlePrintHarvardPdf() {
    window.print()
  }

  async function loadConnectors() {
    if (!isAuthenticated) {
      return
    }

    setIsConnectorsLoading(true)
    setConnectorsError("")

    try {
      const response = await fetch("/api/connectors", { cache: "no-store" })
      const data = (await response.json()) as {
        success?: boolean
        connectors?: Connector[]
        error?: string
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudieron cargar los conectores.")
      }

      setConnectors(data.connectors ?? [])
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error al cargar conectores."
      setConnectorsError(message)
    } finally {
      setIsConnectorsLoading(false)
    }
  }

  async function handleDisconnect(connectionId: string) {
    setDisconnectingId(connectionId)

    try {
      const response = await fetch(`/api/connectors/github/${connectionId}`, {
        method: "DELETE",
      })
      const data = (await response.json()) as {
        success?: boolean
        error?: string
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "No se pudo desconectar la cuenta.")
      }

      await loadConnectors()
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "No se pudo desconectar la cuenta."
      setConnectorsError(message)
    } finally {
      setDisconnectingId("")
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    void loadConnectors()
  }, [isAuthenticated])

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="hero-content">
          <p className="eyebrow">
            TraceCV · Generador de CV técnico desde GitHub
          </p>
          <h1>
            Convierte un perfil de GitHub en un CV técnico listo para revisar.
          </h1>
          <p className="hero-description">
            Pega la URL pública de GitHub de un candidato o desarrollador.
            TraceCV analiza repositorios, lenguajes, topics y señales de
            actividad para construir un resumen profesional, skills técnicas,
            proyectos destacados y roles sugeridos. Prueba el generador sin
            crear una cuenta; cuando veas el resultado podrás conectarte con tu
            email para guardar y verificar tu perfil.
          </p>

          {user ? (
            <div className="auth-session-banner">
              <span>Sesión activa: {user.email ?? user.id}</span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" })
                  window.location.href = "/"
                }}
                type="button"
              >
                Cerrar sesión
              </button>
            </div>
          ) : null}

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
          <strong>Prueba inmediata</strong>
          <code>{API_BASE_URL}/github/:username</code>
          <p>
            Genera una vista previa pública sin autenticación. Con email puedes
            guardar evidencias y continuar.
          </p>
        </aside>
      </section>


      {isAuthenticated ? (
        <section className="connectors-card" aria-label="Conectores conectados">
          <div className="connectors-card-header">
            <div>
              <p className="eyebrow">Conectores</p>
              <h3>Tus cuentas conectadas</h3>
            </div>
            <a className="connect-github-button" href="/api/auth/github/connect">
              Conectar GitHub
            </a>
          </div>

          {isConnectorsLoading ? <p className="muted">Cargando conectores...</p> : null}
          {connectorsError ? <p className="error-message">{connectorsError}</p> : null}

          {!isConnectorsLoading && connectors.length === 0 ? (
            <p className="muted">No tienes cuentas conectadas todavía.</p>
          ) : null}

          {connectors.map((connector) => (
            <article className="connector-item" key={connector.id}>
              <div>
                <h4>GitHub</h4>
                <p>Conectado a {connector.username}</p>
              </div>
              <div className="connector-actions">
                <button
                  className="disconnect"
                  disabled={disconnectingId === connector.id}
                  onClick={() => void handleDisconnect(connector.id)}
                  type="button"
                >
                  {disconnectingId === connector.id
                    ? "Desconectando..."
                    : "Desconectar"}
                </button>
                <a href="/api/auth/github/connect">Configuración</a>
              </div>
            </article>
          ))}
        </section>
      ) : null}

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
                  {result.user.profile.location ? (
                    <span>{result.user.profile.location}</span>
                  ) : null}
                  <span>{result.user.profile.public_repos} repos públicos</span>
                  <span>{result.user.profile.followers} seguidores</span>
                </div>
                {result.user.profile.bio ? (
                  <p className="muted">{result.user.profile.bio}</p>
                ) : null}
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

            <div className="cv-actions" aria-label="Acciones del CV">
              <button onClick={handlePrintHarvardPdf} type="button">
                Descargar PDF Harvard
              </button>
              <p>
                Abre el diálogo de impresión del navegador con una plantilla
                Harvard optimizada para guardar como PDF.
              </p>
            </div>

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
                <p className="muted">
                  No se detectaron skills técnicas para este perfil.
                </p>
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
                          <a
                            href={project.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {project.name}
                          </a>
                        </h4>
                        <p>
                          {project.description ??
                            "Repositorio público sin descripción."}
                        </p>
                      </div>
                      <div className="cv-project-meta">
                        {project.language ? (
                          <span>{project.language}</span>
                        ) : null}
                        <span>{project.stars} ★</span>
                        <span>
                          Actualizado: {formatDate(project.updatedAt)}
                        </span>
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
                <p className="muted">
                  No hay proyectos públicos para destacar.
                </p>
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

          <article className="metric-card" aria-label="Repositorios procesados">
            <p className="eyebrow">Repositorios procesados</p>
            <strong>{result.repositoriesProcessed}</strong>
            <span>
              de {result.totalRepositories} repositorios públicos analizados
            </span>
          </article>

          <article className="metric-card" aria-label="Lenguajes detectados">
            <p className="eyebrow">Lenguajes detectados</p>
            <strong>{result.languages.length}</strong>
            <span>
              {result.languages.length
                ? result.languages.slice(0, 4).join(", ")
                : "Sin lenguajes detectados"}
            </span>
          </article>

          {!isAuthenticated ? (
            <article
              className="auth-cta-card"
              aria-label="Conectarse con email"
            >
              <p className="eyebrow">Siguiente paso</p>
              <h3>¿Quieres guardar y verificar este CV?</h3>
              <p>
                Ya viste cómo TraceCV convierte GitHub en un perfil técnico.
                Conéctate con tu email para recibir un código de verificación,
                guardar el resultado y habilitar la evidencia verificable.
              </p>
              <a href="/login">Conectarse con email</a>
            </article>
          ) : null}

          {isAuthenticated ? (
            <article
              className={`verification-card verification-card--${verificationSummary.status}`}
              aria-label="Evidencia verificable del perfil"
            >
              <div className="verification-card-header">
                <div>
                  <p className="eyebrow">Evidencia verificable</p>
                  <h3>{verificationSummary.label}</h3>
                </div>
                <span className="verification-status-dot" aria-hidden="true" />
              </div>

              <dl className="verification-details">
                <div>
                  <dt>profileHash</dt>
                  <dd>
                    {verificationSummary.profileHash ??
                      "Pendiente de generación"}
                  </dd>
                </div>
                <div>
                  <dt>verifiedAt</dt>
                  <dd>
                    {verificationSummary.verifiedAt
                      ? formatDate(verificationSummary.verifiedAt)
                      : "Sin fecha de verificación"}
                  </dd>
                </div>
                <div>
                  <dt>network</dt>
                  <dd>{verificationSummary.network ?? "Sin red blockchain"}</dd>
                </div>
                <div>
                  <dt>transactionHash</dt>
                  <dd>
                    {verificationSummary.transactionHash ?? "Sin transacción"}
                  </dd>
                </div>
              </dl>

              {verificationSummary.error ? (
                <p className="verification-error">
                  {verificationSummary.error}
                </p>
              ) : null}

              <div className="verification-actions">
                <button
                  disabled={!verificationSummary.profileHash}
                  onClick={handleCopyProfileHash}
                  type="button"
                >
                  Copiar hash
                </button>
                {verificationSummary.transactionHash &&
                verificationSummary.explorerUrl ? (
                  <a
                    href={verificationSummary.explorerUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Ver transacción
                  </a>
                ) : null}
              </div>
              {copyStatus ? (
                <p className="copy-status" role="status">
                  {copyStatus}
                </p>
              ) : null}
            </article>
          ) : null}

          <section className="harvard-print-cv" aria-label="CV Harvard para PDF">
            <header className="harvard-print-header">
              <p className="harvard-print-name">
                {result.user.profile.name ?? result.user.username}
              </p>
              <p className="harvard-print-headline">{result.cv.headline}</p>
              <p className="harvard-print-contact">
                github.com/{result.user.username}
                {result.user.profile.location
                  ? ` · ${result.user.profile.location}`
                  : ""}
                {result.user.profile.public_repos
                  ? ` · ${result.user.profile.public_repos} repositorios públicos`
                  : ""}
              </p>
            </header>

            <section className="harvard-print-section">
              <h2>Professional Summary</h2>
              <p>{result.cv.summary}</p>
            </section>

            <section className="harvard-print-section">
              <h2>Technical Skills</h2>
              <p>{result.cv.technicalSkills.join(" · ")}</p>
            </section>

            <section className="harvard-print-section">
              <h2>Selected Projects</h2>
              {result.cv.featuredProjects.length ? (
                <ul>
                  {result.cv.featuredProjects.map((project) => (
                    <li key={`print-${project.url}`}>
                      <strong>{project.name}</strong>
                      {project.language ? ` — ${project.language}` : ""}
                      {project.stars ? ` · ${project.stars} stars` : ""}
                      <br />
                      <span>
                        {project.description ??
                          "Public GitHub repository without description."}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No public projects available.</p>
              )}
            </section>

            <section className="harvard-print-section">
              <h2>Open Source Experience</h2>
              <ul>
                {result.cv.experienceHighlights.map((highlight) => (
                  <li key={`print-highlight-${highlight}`}>{highlight}</li>
                ))}
                {result.cv.openSourceSignals.map((signal) => (
                  <li key={`print-signal-${signal}`}>{signal}</li>
                ))}
              </ul>
            </section>

            <section className="harvard-print-section">
              <h2>Target Roles</h2>
              <p>{result.cv.suggestedRoles.join(" · ")}</p>
            </section>
          </section>

          <details className="json-card">
            <summary>Ver JSON crudo para depuración</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </section>
      ) : null}
    </main>
  )
}
