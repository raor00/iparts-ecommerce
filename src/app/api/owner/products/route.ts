import { assertStaff, isCheckoutAuthError } from "@/lib/checkout-auth"
import { json, readSession, withDb } from "@/lib/http"
import { addShopProduct, deactivateShopProduct, parseShopProductInput, updateShopProduct } from "@/lib/shop-catalog"

export async function GET() {
  const session = await readSession()
  try {
    assertStaff(session, ["OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const products = withDb((db) => db.products)
  return json({ products })
}

export async function POST(req: Request) {
  const session = await readSession()
  try {
    assertStaff(session, ["OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = await req.json().catch(() => ({}))
  try {
    const product = withDb((db) => addShopProduct(db, parseShopProductInput(body)))
    return json({ product }, 201)
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo guardar" }, 409)
  }
}

export async function PATCH(req: Request) {
  const session = await readSession()
  try {
    assertStaff(session, ["OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = (await req.json().catch(() => ({}))) as {
    sku?: string
    wholesalePrice?: number
    quantity?: number
    active?: boolean
  }
  const sku = body.sku?.trim() ?? ""
  if (!sku) return json({ error: "SKU requerido" }, 400)
  try {
    const product = withDb((db) =>
      updateShopProduct(db, sku, {
        ...(body.wholesalePrice != null ? { wholesalePrice: Number(body.wholesalePrice) } : {}),
        ...(body.quantity != null ? { quantity: Number(body.quantity) } : {}),
        ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      }),
    )
    return json({ product })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo editar" }, 409)
  }
}

export async function DELETE(req: Request) {
  const session = await readSession()
  try {
    assertStaff(session, ["OWNER"])
  } catch (err) {
    if (isCheckoutAuthError(err)) return json({ error: (err as Error).message }, 401)
    throw err
  }
  const body = (await req.json().catch(() => ({}))) as { sku?: string }
  const sku = body.sku?.trim() ?? ""
  if (!sku) return json({ error: "SKU requerido" }, 400)
  try {
    const product = withDb((db) => deactivateShopProduct(db, sku))
    return json({ product })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "No se pudo quitar" }, 409)
  }
}
