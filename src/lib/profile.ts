export type CustomerProfile = {
  country: string
  firstName: string
  lastName: string
  nationalId: string
  phone: string
  addressLine: string
  city: string
  state: string
  postalCode: string
  isCompany: boolean
  companyName: string
  companyTaxId: string
}

export const PROFILE_FIELDS = [
  "country",
  "firstName",
  "lastName",
  "nationalId",
  "phone",
  "addressLine",
  "city",
  "state",
  "postalCode",
] as const

export function emptyProfile(): CustomerProfile {
  return {
    country: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    isCompany: false,
    companyName: "",
    companyTaxId: "",
  }
}

export function isProfileComplete(profile: CustomerProfile | null | undefined): boolean {
  if (!profile) return false
  for (const key of PROFILE_FIELDS) {
    if (!profile[key]?.trim()) return false
  }
  if (profile.isCompany && (!profile.companyName.trim() || !profile.companyTaxId.trim())) return false
  return true
}

export function parseProfile(raw: unknown): CustomerProfile {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}
  const str = (k: string) => (typeof o[k] === "string" ? o[k].trim() : "")
  return {
    country: str("country"),
    firstName: str("firstName"),
    lastName: str("lastName"),
    nationalId: str("nationalId"),
    phone: str("phone"),
    addressLine: str("addressLine"),
    city: str("city"),
    state: str("state"),
    postalCode: str("postalCode"),
    isCompany: o["isCompany"] === true || o["isCompany"] === "true",
    companyName: str("companyName"),
    companyTaxId: str("companyTaxId"),
  }
}

export function profileCompleteError(): string {
  return "Completá todos los datos de envío e identificación antes de pagar"
}
