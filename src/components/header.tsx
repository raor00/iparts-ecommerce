import Link from "next/link"
import { cartCount, cartSubtotal } from "@/lib/cart"
import { readSession, resolveCartActor, withDb } from "@/lib/http"
import { getCart } from "@/lib/store"

export async function Header() {
  const session = await readSession()
  const actor = await resolveCartActor()
  const cart = actor.cartId ? withDb((db) => getCart(db, actor.cartId!)) : { lines: [] }
  const count = cartCount(cart)
  const total = cartSubtotal(cart)
  return (
    <header className="mast">
      <div className="wrap mast-row">
        <Link className="brand" href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/brand/iparts-logo.png" alt="iParts" />
          <span className="brand-copy">
            <span className="brand-mark">
              i<span>PARTS</span>
            </span>
            <span className="brand-sub">Ecommerce</span>
          </span>
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
              {session.role === "OWNER" ? (
                <Link className="mast-link" href="/owner">
                  <span>Pasarela</span>
                  <strong>Wallet dueño</strong>
                </Link>
              ) : null}
              {session.role === "DISPATCH" || session.role === "OWNER" ? (
                <Link className="mast-link" href="/dispatch">
                  <span>Logística</span>
                  <strong>Despacho</strong>
                </Link>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <button className="btn ghost" type="submit">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <div className="auth-ctas">
              <Link className="btn ghost" href="/login">
                Iniciar sesión
              </Link>
              <Link className="btn" href="/register">
                Crear cuenta
              </Link>
            </div>
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
