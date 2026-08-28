import { AuthForm } from "@/components/auth-form"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div className="auth-shell">
      <p className="kicker">iParts Ecommerce</p>
      <h1>Iniciar sesión</h1>
      <p className="muted">Entrá con tu cuenta de cliente. La contraseña no se guarda en el navegador.</p>
      <AuthForm mode="login" next={next ?? "/account"} />
    </div>
  )
}
