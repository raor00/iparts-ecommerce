import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

export function hashPassword(plain: string): string {
  if (plain.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres")
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(plain, salt, 32).toString("hex")
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$")
  if (scheme !== "scrypt" || !salt || !hash) return false
  const actual = scryptSync(plain, salt, 32)
  const expected = Buffer.from(hash, "hex")
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}
