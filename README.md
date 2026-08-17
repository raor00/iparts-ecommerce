# IPARTS Ecommerce

Tienda online de **repuestos iPhone** (XR → 17 Pro Max). El stock y el precio mayorista salen en vivo del ERP IPARTS.

**Stack:** Next.js App Router + TypeScript (framework de compras web). No es Go.

## Endpoints

| Método | Ruta | Auth |
|---|---|---|
| GET | `/` | público — catálogo de modelos |
| GET | `/catalog/[model]` | público — SKUs + stock ERP |
| GET | `/product/[sku]` | público; agregar al carrito pide sesión |
| GET | `/cart` | sesión |
| GET | `/checkout` | sesión obligatoria |
| GET | `/account` | sesión — relación de compras |
| POST | `/api/auth/register` | cookie httpOnly |
| POST | `/api/auth/login` | cookie httpOnly |
| POST | `/api/auth/logout` | cookie |
| GET | `/api/auth/me` | cookie |
| GET/POST | `/api/cart` | sesión |
| POST | `/api/checkout` | sesión + token de pago |
| GET | `/api/orders` | sesión |
| GET | `/api/catalog?model=` | server → ERP `GET /ecommerce/catalog` |

El browser **nunca** llama al ERP ni ve `ECOMMERCE_API_KEY`. Las contraseñas no van a `localStorage`.

## ERP

`GET /ecommerce/catalog?model=` con header `X-Ecommerce-Key`. Solo lectura. Sin costPrice.

```
pnpm test
pnpm dev
```
