import { json, readSession, withDb } from "@/lib/http"

export async function GET() {
  const session = await readSession()
  if (!session) return json({ user: null })
  const user = withDb((db) => db.users.find((u) => u.id === session.userId))
  if (!user) return json({ user: null })
  return json({ user: { id: user.id, email: user.email, name: user.name, isVip: user.isVip } })
}
