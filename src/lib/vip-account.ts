/** Demo / local: an email that starts with vip@ or vip+ is a VIP shopper. */
export function isVipEmail(email: string): boolean {
  const local = email.trim().toLowerCase().split("@")[0] ?? ""
  return local === "vip" || local.startsWith("vip+")
}
