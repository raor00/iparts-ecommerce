import { describe, expect, it } from "vitest"
import { emptyProfile, isProfileComplete, parseProfile } from "./profile"

describe("customer KYC profile", () => {
  it("rejects an empty profile and accepts a full consumer profile", () => {
    expect(isProfileComplete(emptyProfile())).toBe(false)
    expect(
      isProfileComplete(
        parseProfile({
          country: "VE",
          firstName: "Ana",
          lastName: "Díaz",
          nationalId: "V-123",
          phone: "0412",
          addressLine: "Calle 1",
          city: "Caracas",
          state: "DC",
          postalCode: "1010",
        }),
      ),
    ).toBe(true)
  })

  it("requires company tax data when isCompany", () => {
    const base = {
      country: "VE",
      firstName: "Ana",
      lastName: "Díaz",
      nationalId: "V-123",
      phone: "0412",
      addressLine: "Calle 1",
      city: "Caracas",
      state: "DC",
      postalCode: "1010",
      isCompany: true,
    }
    expect(isProfileComplete(parseProfile(base))).toBe(false)
    expect(isProfileComplete(parseProfile({ ...base, companyName: "CA", companyTaxId: "J-1" }))).toBe(true)
  })
})
