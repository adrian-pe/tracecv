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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"

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

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("")
  const [result, setResult] = useState<GitHubResponse | null>(null)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const usernamePreview = useMemo(() => getGitHubUsername(githubUrl), [githubUrl])

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
          <p className="eyebrow">TraceCV · GitHub Skill Scanner</p>
          <h1>Convierte un perfil de GitHub en señales claras de talento técnico.</h1>
          <p className="hero-description">
            Pega la URL pública de GitHub de un candidato o desarrollador. TraceCV enviará el usuario al backend,
            procesará repositorios, lenguajes y topics, y mostrará aquí la respuesta completa.
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
                {isLoading ? "Analizando..." : "Analizar"}
              </button>
            </div>
            <p className="helper-text">
              {usernamePreview ? `Se analizará el usuario: ${usernamePreview}` : "También puedes escribir solo el usuario, por ejemplo: octocat."}
            </p>
          </form>

          {error ? <div className="error-message">{error}</div> : null}
        </div>

        <aside className="status-panel" aria-label="Resumen de integración">
          <span className="pulse" />
          <strong>Backend esperado</strong>
          <code>{API_BASE_URL}/github/:username</code>
          <p>Configura NEXT_PUBLIC_API_BASE_URL si tu API corre en otra URL.</p>
        </aside>
      </section>

      {result ? (
        <section className="results-grid" aria-live="polite">
          <article className="profile-card">
            <Image
              alt={`Avatar de ${result.user.username}`}
              height={118}
              src={result.user.profile.avatar_url}
              width={118}
            />
            <div>
              <p className="eyebrow">Perfil procesado</p>
              <h2>{result.user.profile.name ?? result.user.username}</h2>
              <p className="muted">@{result.user.username}</p>
              {result.user.profile.bio ? <p>{result.user.profile.bio}</p> : null}
              <div className="profile-meta">
                <span>{result.user.profile.public_repos} repos</span>
                <span>{result.user.profile.followers} seguidores</span>
                <span>{result.user.profile.following} siguiendo</span>
              </div>
              <p className="muted">Cuenta creada el {formatDate(result.user.profile.created_at)}</p>
            </div>
          </article>

          <article className="metric-card">
            <span>Repositorios procesados</span>
            <strong>{result.repositoriesProcessed}</strong>
            <p>de {result.totalRepositories} repositorios públicos encontrados</p>
          </article>

          <article className="metric-card">
            <span>Lenguajes detectados</span>
            <strong>{result.languages.length}</strong>
            <p>{result.languages.slice(0, 4).join(", ") || "Sin lenguajes reportados"}</p>
          </article>

          <article className="wide-card">
            <div className="section-heading">
              <p className="eyebrow">Respuesta del backend</p>
              <h2>Skills detectadas</h2>
            </div>
            <div className="chip-list">
              {result.skillsDetected.length ? (
                result.skillsDetected.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <p className="muted">El backend no devolvió skills para este perfil.</p>
              )}
            </div>
          </article>

          <article className="wide-card">
            <div className="section-heading">
              <p className="eyebrow">Topics</p>
              <h2>Temas encontrados</h2>
            </div>
            <div className="chip-list secondary">
              {result.topics.length ? (
                result.topics.slice(0, 30).map((topic) => <span key={topic}>{topic}</span>)
              ) : (
                <p className="muted">No hay topics públicos asociados a los repositorios.</p>
              )}
            </div>
          </article>

          <article className="json-card">
            <div className="section-heading">
              <p className="eyebrow">JSON</p>
              <h2>Respuesta cruda</h2>
            </div>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </article>
        </section>
      ) : null}
    </main>
  )
}
