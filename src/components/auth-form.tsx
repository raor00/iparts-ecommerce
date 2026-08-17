"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })
        const data = (await res.json()) as { error?: string }
        setBusy(false)
        if (!res.ok) {
          setError(data.error ?? "No se pudo entrar")
          return
        }
        router.push(next)
        router.refresh()
      }}
    >
      {mode === "register" && (
        <label>
          Nombre
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
      )}
      <label>
        Correo
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      {error && <p className="err">{error}</p>}
      <button className="btn" disabled={busy} type="submit">
        {mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>
      <p className="muted">
        {mode === "login" ? (
          <Link href={`/register?next=${encodeURIComponent(next)}`}>Crear cuenta</Link>
        ) : (
          <Link href={`/login?next=${encodeURIComponent(next)}`}>Ya tengo cuenta</Link>
        )}
      </p>
    </form>
  )
}
