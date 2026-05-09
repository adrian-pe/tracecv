"use client"

import { FormEvent, useState } from "react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [step, setStep] = useState<"request" | "verify">("request")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo enviar el código de acceso.")
      }

      setStep("verify")
      setMessage(
        data.message ?? "Revisa tu email e ingresa el código de verificación.",
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ocurrió un error inesperado.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ?? "No se pudo validar el código de verificación.",
        )
      }

      window.location.href = "/"
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Ocurrió un error inesperado.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page-shell auth-page">
      <section className="hero-card auth-card">
        <div className="hero-content">
          <p className="eyebrow">TraceCV · Acceso por email</p>
          <h1>Conéctate con tu email para guardar tu TraceCV.</h1>
          <p className="hero-description">
            Te enviaremos un código de verificación a tu email. No necesitas
            contraseña: úsalo para continuar, guardar tu CV técnico y habilitar
            la evidencia verificable.
          </p>

          {step === "request" ? (
            <form className="github-form" onSubmit={requestOtp}>
              <label htmlFor="email">Email</label>
              <div className="input-row">
                <input
                  id="email"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  required
                  type="email"
                  value={email}
                />
                <button disabled={isLoading} type="submit">
                  {isLoading ? "Enviando..." : "Enviar código"}
                </button>
              </div>
            </form>
          ) : (
            <form className="github-form" onSubmit={verifyOtp}>
              <label htmlFor="token">Código de verificación</label>
              <div className="input-row">
                <input
                  id="token"
                  inputMode="numeric"
                  name="token"
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="123456"
                  required
                  type="text"
                  value={token}
                />
                <button disabled={isLoading} type="submit">
                  {isLoading ? "Validando..." : "Entrar"}
                </button>
              </div>
              <button
                className="link-button"
                onClick={() => setStep("request")}
                type="button"
              >
                Cambiar email
              </button>
            </form>
          )}

          {message ? <div className="success-message">{message}</div> : null}
          {error ? <div className="error-message">{error}</div> : null}
        </div>
      </section>
    </main>
  )
}
