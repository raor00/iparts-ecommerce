import { redirect } from "next/navigation"
import { readSession, withDb } from "@/lib/http"
import { paidOrdersForDispatch } from "@/lib/store"
import { DispatchBoard } from "@/components/dispatch-board"

export default async function DispatchPage() {
  const session = await readSession()
  const role = session?.role ?? "CUSTOMER"
  if (!session || (role !== "DISPATCH" && role !== "OWNER")) redirect("/login?next=/dispatch")
  const orders = withDb((db) => paidOrdersForDispatch(db))
  return (
    <div>
      <p className="kicker">Logística</p>
      <h1 className="page-title">Despacho</h1>
      <p className="muted">Solo pedidos cobrados. Armá el paquete con los datos de envío del cliente.</p>
      <DispatchBoard orders={orders} />
    </div>
  )
}
