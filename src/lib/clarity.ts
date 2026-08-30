export function clarityTagUrl(projectId: string | undefined): string | null {
  const id = projectId?.trim()
  if (!id) return null
  return `https://www.clarity.ms/tag/${id}`
}
