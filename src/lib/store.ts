import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { emptyCart, mergeCarts, type Cart } from "./cart"
import type { ShopRole } from "./checkout-auth"
import { emptyProfile, type CustomerProfile } from "./profile"
import { applySale, type StockMovement } from "./stock-ledger"

export type ShopUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  isVip: boolean
  role: ShopRole
  profile: CustomerProfile
  createdAt: string
}

export type ShopOrder = {
  id: string
  userId: string
  createdAt: string
  status: "paid" | "failed" | "awaiting_payment" | "ready_to_pack" | "packed" | "shipped"
  total: string
  paymentRef: string
  paymentMethod?: string
  processorFee?: string
  ownerFee?: string
  merchantNet?: string
  dispatchStatus?: "none" | "ready_to_pack" | "packed" | "shipped"
  shippingSnapshot?: CustomerProfile
  lines: { sku: string; name: string; quantity: number; unitPrice: string }[]
}

export type OwnerLedgerEntry = {
  id: string
  createdAt: string
  orderId: string
  amount: string
  note: string
}

export type Db = {
  users: ShopUser[]
  carts: Record<string, Cart>
  orders: ShopOrder[]
  ownerWallet: { balance: string; entries: OwnerLedgerEntry[] }
  stock: Record<string, number>
  movements: StockMovement[]
}

function defaultDb(): Db {
  return {
    users: [],
    carts: {},
    orders: [],
    ownerWallet: { balance: "0.00", entries: [] },
    stock: {},
    movements: [],
  }
}

export function loadDb(path: string): Db {
  try {
    const raw = readFileSync(path, "utf8")
    const parsed = JSON.parse(raw) as Partial<Db>
    return {
      users: Array.isArray(parsed.users)
        ? parsed.users.map((u) => ({
            ...u,
            role: u.role === "DISPATCH" || u.role === "OWNER" ? u.role : "CUSTOMER",
            profile: u.profile ?? emptyProfile(),
          }))
        : [],
      carts: parsed.carts && typeof parsed.carts === "object" ? parsed.carts : {},
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      ownerWallet:
        parsed.ownerWallet && typeof parsed.ownerWallet === "object"
          ? {
              balance: parsed.ownerWallet.balance ?? "0.00",
              entries: Array.isArray(parsed.ownerWallet.entries) ? parsed.ownerWallet.entries : [],
            }
          : { balance: "0.00", entries: [] },
      stock: parsed.stock && typeof parsed.stock === "object" ? parsed.stock : {},
      movements: Array.isArray(parsed.movements) ? parsed.movements : [],
    }
  } catch {
    return defaultDb()
  }
}

export function saveDb(path: string, db: Db): void {
  mkdirSync(dirname(path), { recursive: true })
  const tmp = `${path}.${process.pid}.tmp`
  writeFileSync(tmp, JSON.stringify(db, null, 2))
  renameSync(tmp, path)
}

export function createUser(
  db: Db,
  input: {
    email: string
    name: string
    passwordHash: string
    isVip?: boolean
    role?: ShopRole
    profile?: CustomerProfile
  },
): ShopUser {
  const email = input.email.trim().toLowerCase()
  if (db.users.some((u) => u.email === email)) throw new Error("Ese correo ya está registrado")
  const profile = input.profile ?? emptyProfile()
  const first = profile.firstName || input.name.trim()
  const user: ShopUser = {
    id: randomUUID(),
    email,
    name: first || email,
    passwordHash: input.passwordHash,
    isVip: Boolean(input.isVip),
    role: input.role ?? "CUSTOMER",
    profile,
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  return user
}

export function findUserById(db: Db, id: string): ShopUser | undefined {
  return db.users.find((u) => u.id === id)
}

export function updateUserProfile(db: Db, userId: string, profile: CustomerProfile): ShopUser {
  const user = findUserById(db, userId)
  if (!user) throw new Error("Usuario no encontrado")
  user.profile = profile
  user.name = `${profile.firstName} ${profile.lastName}`.trim() || user.name
  return user
}

export function seedCatalogStock(db: Db, sku: string, quantity: number): void {
  if (db.stock[sku] == null) db.stock[sku] = Math.max(0, Math.floor(quantity))
}

export function availableQty(db: Db, sku: string, catalogQty: number): number {
  if (db.stock[sku] == null) db.stock[sku] = Math.max(0, Math.floor(catalogQty))
  return db.stock[sku] ?? 0
}

export function decrementSale(db: Db, lines: { sku: string; quantity: number }[], refId: string, userId: string): void {
  for (const line of lines) {
    const prev = db.stock[line.sku] ?? 0
    const result = applySale(prev, line.quantity)
    if (!result.ok) throw new Error(`Sin stock para ${line.sku}`)
    db.stock[line.sku] = result.newQty
    db.movements.unshift({
      id: `MOV-${randomUUID().slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      sku: line.sku,
      type: "SALE",
      qty: line.quantity,
      prevQty: prev,
      newQty: result.newQty,
      refType: "ORDER",
      refId,
      userId,
    })
  }
}

export function paidOrdersForDispatch(db: Db): ShopOrder[] {
  return db.orders.filter((o) => o.status === "paid" || o.status === "ready_to_pack" || o.dispatchStatus === "ready_to_pack")
}

export function setDispatchStatus(db: Db, orderId: string, dispatchStatus: "packed" | "shipped"): ShopOrder {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Pedido no encontrado")
  if (order.status !== "paid" && order.status !== "ready_to_pack" && order.status !== "packed") {
    throw new Error("El pedido aún no está cobrado")
  }
  order.dispatchStatus = dispatchStatus
  order.status = dispatchStatus === "shipped" ? "shipped" : "packed"
  return order
}

export function findUserByEmail(db: Db, email: string): ShopUser | undefined {
  return db.users.find((u) => u.email === email.trim().toLowerCase())
}

export function getCart(db: Db, userId: string): Cart {
  return db.carts[userId] ?? emptyCart()
}

export function putCart(db: Db, userId: string, cart: Cart): void {
  db.carts[userId] = cart
}

export function absorbGuestCart(db: Db, guestCartId: string, userId: string): void {
  putCart(db, userId, mergeCarts(getCart(db, userId), getCart(db, guestCartId)))
  putCart(db, guestCartId, emptyCart())
}

export function addOrder(db: Db, order: Omit<ShopOrder, "id" | "createdAt">): ShopOrder {
  const saved: ShopOrder = {
    ...order,
    id: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }
  db.orders.unshift(saved)
  return saved
}

export function ordersForUser(db: Db, userId: string): ShopOrder[] {
  return db.orders.filter((o) => o.userId === userId)
}

export function creditOwnerWallet(db: Db, input: { orderId: string; amount: string; note: string }): void {
  const add = Math.round(Number(input.amount) * 100)
  if (!Number.isFinite(add) || add <= 0) return
  const current = Math.round(Number(db.ownerWallet.balance) * 100) || 0
  db.ownerWallet.balance = ((current + add) / 100).toFixed(2)
  db.ownerWallet.entries.unshift({
    id: `OWN-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    orderId: input.orderId,
    amount: input.amount,
    note: input.note,
  })
}
