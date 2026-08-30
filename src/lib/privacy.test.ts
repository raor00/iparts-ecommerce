import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

function walk(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".test.ts")) out.push(full)
  }
  return out
}

describe("client storage", () => {
  it("does not persist auth or profile in localStorage/sessionStorage", () => {
    const root = join(process.cwd(), "src")
    const hits: string[] = []
    for (const file of walk(root)) {
      const src = readFileSync(file, "utf8")
      if (/\blocalStorage\b|\bsessionStorage\b/.test(src)) hits.push(file)
    }
    expect(hits).toEqual([])
  })
})
