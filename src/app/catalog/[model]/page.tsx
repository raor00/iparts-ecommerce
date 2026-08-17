import { redirect, notFound } from "next/navigation"
import { PART_CATEGORIES, modelFromSlug } from "@/lib/catalog"

export default async function CatalogModelPage({
  params,
  searchParams,
}: {
  params: Promise<{ model: string }>
  searchParams: Promise<{ cat?: string }>
}) {
  const { model: slug } = await params
  const { cat } = await searchParams
  const model = modelFromSlug(slug)
  if (!model) notFound()
  const category = PART_CATEGORIES.find((row) => row.slug === cat)?.slug ?? "pantallas"
  redirect(`/c/${category}?model=${encodeURIComponent(model)}`)
}
