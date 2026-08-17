import { AuthForm } from "@/components/auth-form"

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return (
    <div>
      <h1>Crear cuenta</h1>
      <AuthForm mode="register" next={next ?? "/account"} />
    </div>
  )
}
