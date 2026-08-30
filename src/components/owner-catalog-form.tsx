"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SHOP_IPHONE_MODELS, type ShopIphoneModel } from "@/lib/catalog"
import type { ShopProduct } from "@/lib/store"

const QUALITIES: Record<"pantallas" | "baterias", string[]> = {
  pantallas: ["OLED", "Soft OLED", "Incell"],
  baterias: ["Con flex", "Sin flex"],
}

const BRANDS: Record<"pantallas" | "baterias", string[]> = {
  pantallas: ["JK", "GX", "ZY"],
  baterias: ["Amp", "GX", "OEM"],
}

export function OwnerCatalogForm({ products }: { products: ShopProduct[] }) {
  const router = useRouter()
  const [categorySlug, setCategorySlug] = useState<"pantallas" | "baterias">("pantallas")
  const [model, setModel] = useState<ShopIphoneModel>(SHOP_IPHONE_MODELS[0])
  const [brand, setBrand] = useState("JK")
  const [quality, setQuality] = useState("OLED")
  const [wholesalePrice, setWholesalePrice] = useState("185")
  const [quantity, setQuantity] = useState("4")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError("")
    const res = await fetch("/api/owner/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        categorySlug,
        model,
        brand,
        quality,
        wholesalePrice: Number(wholesalePrice),
        quantity: Number(quantity),
      }),
    })
    const data = (await res.json()) as { error?: string }
    setBusy(false)
    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar")
      return
    }
    router.refresh()
  }

  async function patch(sku: string, body: { wholesalePrice?: number; quantity?: number; active?: boolean }) {
    setBusy(true)
    setError("")
    const res = await fetch("/api/owner/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sku, ...body }),
    })
    const data = (await res.json()) as { error?: string }
    setBusy(false)
    if (!res.ok) {
      setError(data.error ?? "No se pudo editar")
      return
    }
    router.refresh()
  }

  return (
    <div>
      <form className="stack" onSubmit={submit}>
        <label>
          Categoría
          <select
            value={categorySlug}
            onChange={(e) => {
              const next = e.target.value as "pantallas" | "baterias"
              setCategorySlug(next)
              setQuality(QUALITIES[next][0]!)
              setBrand(BRANDS[next][0]!)
            }}
          >
            <option value="pantallas">Pantallas</option>
            <option value="baterias">Baterías</option>
          </select>
        </label>
        <label>
          Modelo
          <select value={model} onChange={(e) => setModel(e.target.value as ShopIphoneModel)}>
            {SHOP_IPHONE_MODELS.map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipo / calidad
          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            {QUALITIES[categorySlug].map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>
        <label>
          Marca
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {BRANDS[categorySlug].map((row) => (
              <option key={row} value={row}>
                {row}
              </option>
            ))}
          </select>
        </label>
        <label>
          Precio mayorista (USD)
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            required
          />
        </label>
        <label>
          Stock inicial
          <input type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </label>
        {error ? <p className="err">{error}</p> : null}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Cargar al ecommerce"}
        </button>
      </form>

      <h2 className="page-title" style={{ marginTop: 28, fontSize: 20 }}>
        En el ecommerce
      </h2>
      {products.length === 0 ? (
        <p className="muted">Todavía no hay productos. Lo que cargues acá es lo que verá el comprador.</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((row) => (
              <tr key={row.sku}>
                <td>{row.sku}</td>
                <td>
                  {row.categorySlug} · {row.quality} {row.brand} {row.model}
                </td>
                <td>${Number(row.wholesalePrice).toFixed(2)}</td>
                <td>{row.quantity}</td>
                <td>{row.active ? "Visible" : "Oculto"}</td>
                <td>
                  {row.active ? (
                    <button className="btn ghost" type="button" disabled={busy} onClick={() => void patch(row.sku, { active: false })}>
                      Desactivar
                    </button>
                  ) : (
                    <button className="btn ghost" type="button" disabled={busy} onClick={() => void patch(row.sku, { active: true })}>
                      Restaurar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
