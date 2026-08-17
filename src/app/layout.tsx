import type { Metadata } from "next"
import { Header } from "@/components/header"
import "./globals.css"

export const metadata: Metadata = {
  title: "IPARTS Shop — Repuestos iPhone",
  description: "Repuestos iPhone XR a 17 Pro Max con stock en vivo del ERP IPARTS",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
