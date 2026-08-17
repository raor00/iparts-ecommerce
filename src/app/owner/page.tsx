import { redirect } from "next/navigation"
import { readSession, withDb } from "@/lib/http"

export default async function OwnerWalletPage() {
  const session = await readSession()
  if (!session) redirect("/login?next=/owner")
  const wallet = withDb((db) => db.ownerWallet)
  return (
    <div>
      <p className="kicker">Pasarela IPARTS</p>
      <h1 className="page-title">Wallet del dueño</h1>
      <p className="muted">2.5% de cada cobro confirmado. No incluye la comisión del procesador.</p>
      <p className="price">${wallet.balance}</p>
      {wallet.entries.length === 0 ? (
        <p className="muted">Todavía no hay comisiones. Confirmá un pedido en checkout.</p>
      ) : (
        <table className="cart-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Monto</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {wallet.entries.map((row) => (
              <tr key={row.id}>
                <td>{row.orderId}</td>
                <td>${row.amount}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
