import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { randomUUID } from "node:crypto"
import { emptyCart, type Cart } from "./cart"

export type ShopUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  isVip: boolean
  createdAt: string
}

export type ShopOrder = {
  id: string
  userId: string
  createdAt: string
  status: "paid" | "failed" | "awaiting_payment"
  total: string
  paymentRef: string
  paymentMethod?: string
  processorFee?: string
  ownerFee?: string
  merchantNet?: string
  lines: { sku: string; name: string; quantity: number; unitPrice: string }[]
}

export type OwnerLedgerEntry = {
  id: string
  createdAt: string
  orderId: string
  amount: string
  note: string
}

type Db = {
  users: ShopUser[]
  carts: Record<string, Cart>
  orders: ShopOrder[]
  ownerWallet: { balance: string; entries: OwnerLedgerEntry[] }
}

function defaultDb(): Db {
  return { users: [], carts: {}, orders: [], ownerWallet: { balance: "0.00", entries: [] } }
}

export function loadDb(path: string): Db {
  try {
    const raw = readFileSync(path, "utf8")
    const parsed = JSON.parse(raw) as Partial<Db>
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      carts: parsed.carts && typeof parsed.carts === "object" ? parsed.carts : {},
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      ownerWallet:
        parsed.ownerWallet && typeof parsed.ownerWallet === "object"
          ? {
              balance: parsed.ownerWallet.balance ?? "0.00",
              entries: Array.isArray(parsed.ownerWallet.entries) ? parsed.ownerWallet.entries : [],
            }
          : { balance: "0.00", entries: [] },
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
  input: { email: string; name: string; passwordHash: string; isVip?: boolean },
): ShopUser {
  const email = input.email.trim().toLowerCase()
  if (db.users.some((u) => u.email === email)) throw new Error("Ese correo ya está registrado")
  const user: ShopUser = {
    id: randomUUID(),
    email,
    name: input.name.trim() || email,
    passwordHash: input.passwordHash,
    isVip: Boolean(input.isVip),
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  return user
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
