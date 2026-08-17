import { AuthForm } from "@/components/auth-form"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div>
      <h1>Iniciar sesión</h1>
      <AuthForm mode="login" next={next ?? "/account"} />
    </div>
  )
}
