import Link from "next/link"
import { readSession } from "@/lib/http"

export async function Header() {
  const session = await readSession()
  return (
    <header className="top">
      <div className="top-inner">
        <Link className="brand" href="/">
          IPARTS Shop
        </Link>
        <nav className="nav">
          <Link href="/">Catálogo</Link>
          <Link href="/cart">Carrito</Link>
          {session ? (
            <>
              <Link href="/account">{session.isVip ? "VIP" : "Mi cuenta"}</Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn secondary" type="submit">
                  Salir
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/register">Crear cuenta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
