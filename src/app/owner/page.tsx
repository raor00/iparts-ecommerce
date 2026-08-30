import { redirect } from "next/navigation"
import { OwnerCatalogForm } from "@/components/owner-catalog-form"
import { readSession, withDb } from "@/lib/http"
import { ownerKpis } from "@/lib/order-flow"

export default async function OwnerWalletPage() {
  const session = await readSession()
  if (!session || session.role !== "OWNER") redirect("/login?next=/owner")
  const { wallet, products, kpis } = withDb((db) => ({
    wallet: db.ownerWallet,
    products: db.products,
    kpis: ownerKpis(db),
  }))
  return (
    <div>
      <p className="kicker">Administrador</p>
      <h1 className="page-title">Catálogo del ecommerce</h1>
      <p className="muted">
        Pedidos {kpis.orderCount} · Cobrados {kpis.collectedCount} · Despachados {kpis.shippedCount} · Ventas $
        {kpis.revenue}
      </p>
      {kpis.topProducts.length > 0 ? (
        <p className="muted">Mayor flujo: {kpis.topProducts.map((row) => `${row.name} (${row.quantity})`).join(" · ")}</p>
      ) : null}
      <p className="muted">
        Solo pantallas y baterías. Cada carga genera un SKU único (modelo + marca + tipo). Lo que está Visible es lo que
        ve el comprador. No se guarda en el navegador.
      </p>
      <OwnerCatalogForm products={products} />

      <p className="kicker" style={{ marginTop: 36 }}>
        Pasarela IPARTS
      </p>
      <h2 className="page-title">Wallet del dueño</h2>
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
