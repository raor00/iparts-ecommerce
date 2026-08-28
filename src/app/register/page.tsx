import { AuthForm } from "@/components/auth-form"

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div className="auth-shell">
      <p className="kicker">iParts Ecommerce</p>
      <h1>Crear cuenta de cliente</h1>
      <p className="muted">
        Todos los campos de identidad y envío son obligatorios. Sin eso no se puede pagar. Contraseña mínimo 8
        caracteres.
      </p>
      <AuthForm mode="register" next={next ?? "/account"} />
    </div>
  )
}
