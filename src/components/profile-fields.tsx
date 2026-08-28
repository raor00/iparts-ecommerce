"use client"

import type { CustomerProfile } from "@/lib/profile"

export function ProfileFields({
  value,
  onChange,
}: {
  value: CustomerProfile
  onChange: (next: CustomerProfile) => void
}) {
  function set<K extends keyof CustomerProfile>(key: K, v: CustomerProfile[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <div className="stack">
      <p className="kicker">Datos de cliente</p>
      <label>
        País
        <input value={value.country} onChange={(e) => set("country", e.target.value)} required autoComplete="country-name" />
      </label>
      <label>
        Nombre
        <input value={value.firstName} onChange={(e) => set("firstName", e.target.value)} required autoComplete="given-name" />
      </label>
      <label>
        Apellido
        <input value={value.lastName} onChange={(e) => set("lastName", e.target.value)} required autoComplete="family-name" />
      </label>
      <label>
        Cédula / documento
        <input value={value.nationalId} onChange={(e) => set("nationalId", e.target.value)} required />
      </label>
      <label>
        Teléfono
        <input value={value.phone} onChange={(e) => set("phone", e.target.value)} required autoComplete="tel" />
      </label>
      <label>
        Dirección de envío
        <input value={value.addressLine} onChange={(e) => set("addressLine", e.target.value)} required autoComplete="street-address" />
      </label>
      <label>
        Ciudad
        <input value={value.city} onChange={(e) => set("city", e.target.value)} required autoComplete="address-level2" />
      </label>
      <label>
        Estado
        <input value={value.state} onChange={(e) => set("state", e.target.value)} required />
      </label>
      <label>
        Código postal
        <input value={value.postalCode} onChange={(e) => set("postalCode", e.target.value)} required autoComplete="postal-code" />
      </label>
      <label className="muted">
        <input type="checkbox" checked={value.isCompany} onChange={(e) => set("isCompany", e.target.checked)} /> Soy empresa
      </label>
      {value.isCompany ? (
        <>
          <label>
            Empresa
            <input value={value.companyName} onChange={(e) => set("companyName", e.target.value)} required />
          </label>
          <label>
            RIF / tax ID
            <input value={value.companyTaxId} onChange={(e) => set("companyTaxId", e.target.value)} required />
          </label>
        </>
      ) : null}
    </div>
  )
}
