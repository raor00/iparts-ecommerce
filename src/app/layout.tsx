import type { Metadata } from "next"
import localFont from "next/font/local"
import { Header } from "@/components/header"
import { CategoryBar } from "@/components/category-bar"
import "./globals.css"

const generalSans = localFont({
  src: [
    { path: "../fonts/GeneralSans-Variable.ttf", style: "normal" },
    { path: "../fonts/GeneralSans-VariableItalic.ttf", style: "italic" },
  ],
  weight: "200 700",
  variable: "--font-general-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "IPARTS — Repuestos iPhone",
  description: "Mostrador de pantallas, baterías y flex iPhone XR a 17 Pro Max. Stock del almacén IPARTS.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={generalSans.variable}>
      <body className={generalSans.className}>
        <Header />
        <CategoryBar />
        <main className="page">
          <div className="wrap">{children}</div>
        </main>
      </body>
    </html>
  )
}
