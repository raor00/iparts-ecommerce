"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { CustomerProfile } from "@/lib/profile"
import { ProfileFields } from "./profile-fields"

export function ProfileEditor({ initial }: { initial: CustomerProfile }) {
  const [profile, setProfile] = useState(initial)
  const [error, setError] = useState("")
  const [ok, setOk] = useState("")
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError("")
        setOk("")
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(profile),
        })
        const data = (await res.json()) as { error?: string }
        setBusy(false)
        if (!res.ok) {
          setError(data.error ?? "No se pudo guardar")
          return
        }
        setOk("Datos guardados")
        router.refresh()
      }}
    >
      <ProfileFields value={profile} onChange={setProfile} />
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="stock">{ok}</p> : null}
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Guardando…" : "Guardar datos de cliente"}
      </button>
    </form>
  )
}
