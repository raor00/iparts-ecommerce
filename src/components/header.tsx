import Link from "next/link"
import { cartSubtotal } from "@/lib/cart"
import { readSession, withDb } from "@/lib/http"
import { getCart } from "@/lib/store"

export async function Header() {
  const session = await readSession()
  const cart = session ? withDb((db) => getCart(db, session.userId)) : { lines: [] }
  const count = cart.lines.reduce((sum, line) => sum + line.quantity, 0)
  const total = cartSubtotal(cart)
  return (
    <header className="mast">
      <div className="wrap mast-row">
        <Link className="brand" href="/">
          <span className="brand-mark">
            i<span>PARTS</span>
          </span>
          <span className="brand-sub">Shop</span>
        </Link>
        <form className="search" action="/search" method="get">
          <input name="q" type="search" placeholder="Buscar pantalla, batería, modelo…" aria-label="Buscar repuestos" />
          <button type="submit">Buscar</button>
        </form>
        <div className="mast-actions">
          {session ? (
            <>
              <Link className="mast-link" href="/account">
                <span>{session.isVip ? "Cuenta VIP" : "Mi cuenta"}</span>
                <strong>{session.email.split("@")[0]}</strong>
              </Link>
              <Link className="mast-link" href="/owner">
                <span>Pasarela</span>
                <strong>Wallet dueño</strong>
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn ghost" type="submit">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <Link className="mast-link" href="/login">
              <span>Identifícate</span>
              <strong>Entrar / crear cuenta</strong>
            </Link>
          )}
          <Link className="cart-pill" href="/cart">
            <span>Carrito {count > 0 ? `(${count})` : ""}</span>
            <strong className="amt">${total}</strong>
          </Link>
        </div>
      </div>
    </header>
  )
}
