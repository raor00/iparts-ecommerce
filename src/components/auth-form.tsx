"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const emptyKyc = {
  country: "VE",
  firstName: "",
  lastName: "",
  nationalId: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  postalCode: "",
  isCompany: false,
  companyName: "",
  companyTaxId: "",
}

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [kyc, setKyc] = useState(emptyKyc)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  function setField<K extends keyof typeof emptyKyc>(key: K, value: (typeof emptyKyc)[K]) {
    setKyc((prev) => ({ ...prev, [key]: value }))
  }
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
          body: JSON.stringify(
            mode === "login"
              ? { email, password }
              : { email, password, name: `${kyc.firstName} ${kyc.lastName}`.trim(), ...kyc },
          ),
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
        <>
          <label>
            País
            <input value={kyc.country} onChange={(e) => setField("country", e.target.value)} required autoComplete="country-name" />
          </label>
          <label>
            Nombre
            <input value={kyc.firstName} onChange={(e) => setField("firstName", e.target.value)} required autoComplete="given-name" />
          </label>
          <label>
            Apellido
            <input value={kyc.lastName} onChange={(e) => setField("lastName", e.target.value)} required autoComplete="family-name" />
          </label>
          <label>
            Cédula / documento
            <input value={kyc.nationalId} onChange={(e) => setField("nationalId", e.target.value)} required />
          </label>
          <label>
            Teléfono
            <input value={kyc.phone} onChange={(e) => setField("phone", e.target.value)} required autoComplete="tel" />
          </label>
          <label>
            Dirección de envío
            <input value={kyc.addressLine} onChange={(e) => setField("addressLine", e.target.value)} required autoComplete="street-address" />
          </label>
          <label>
            Ciudad
            <input value={kyc.city} onChange={(e) => setField("city", e.target.value)} required autoComplete="address-level2" />
          </label>
          <label>
            Estado
            <input value={kyc.state} onChange={(e) => setField("state", e.target.value)} required />
          </label>
          <label>
            Código postal
            <input value={kyc.postalCode} onChange={(e) => setField("postalCode", e.target.value)} required autoComplete="postal-code" />
          </label>
          <label className="muted">
            <input
              type="checkbox"
              checked={kyc.isCompany}
              onChange={(e) => setField("isCompany", e.target.checked)}
            />{" "}
            Soy empresa
          </label>
          {kyc.isCompany ? (
            <>
              <label>
                Empresa
                <input value={kyc.companyName} onChange={(e) => setField("companyName", e.target.value)} required />
              </label>
              <label>
                RIF / tax ID
                <input value={kyc.companyTaxId} onChange={(e) => setField("companyTaxId", e.target.value)} required />
              </label>
            </>
          ) : null}
        </>
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
