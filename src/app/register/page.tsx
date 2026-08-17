import { AuthForm } from "@/components/auth-form"

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div className="auth-shell">
      <p className="kicker">Nueva cuenta</p>
      <h1>Crear usuario</h1>
      <p className="muted">
        Mínimo 8 caracteres. Precio de mostrador por defecto. Para probar VIP en local, registrá
        <code> vip@iparts.local</code> o <code>vip+nombre@correo.com</code>.
      </p>
      <AuthForm mode="register" next={next ?? "/account"} />
    </div>
  )
}
