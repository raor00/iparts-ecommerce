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
  status: "paid" | "failed"
  total: string
  paymentRef: string
  lines: { sku: string; name: string; quantity: number; unitPrice: string }[]
}

type Db = {
  users: ShopUser[]
  carts: Record<string, Cart>
  orders: ShopOrder[]
}

function defaultDb(): Db {
  return { users: [], carts: {}, orders: [] }
}

export function loadDb(path: string): Db {
  try {
    const raw = readFileSync(path, "utf8")
    const parsed = JSON.parse(raw) as Partial<Db>
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      carts: parsed.carts && typeof parsed.carts === "object" ? parsed.carts : {},
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
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
