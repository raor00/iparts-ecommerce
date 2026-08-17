import { AuthForm } from "@/components/auth-form"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div className="auth-shell">
      <p className="kicker">Cuenta IPARTS</p>
      <h1>Entrar al mostrador</h1>
      <p className="muted">Misma cuenta para carrito, VIP y pedidos. La contraseña no se guarda en el navegador.</p>
      <AuthForm mode="login" next={next ?? "/account"} />
    </div>
  )
}
