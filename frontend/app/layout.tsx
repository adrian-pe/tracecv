import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "TraceCV | Analizador de GitHub",
  description: "Conecta un perfil de GitHub y visualiza las habilidades detectadas por TraceCV."
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
