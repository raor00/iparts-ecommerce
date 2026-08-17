import { join } from "node:path"

export function shopConfig() {
  return {
    erpBaseUrl: process.env.ERP_API_URL ?? "",
    ecommerceApiKey: process.env.ECOMMERCE_API_KEY ?? "",
    sessionSecret: process.env.SESSION_SECRET ?? "",
    dataPath: process.env.SHOP_DATA_PATH ?? join(process.cwd(), "data", "store.json"),
    secureCookies: process.env.NODE_ENV === "production",
  }
}
