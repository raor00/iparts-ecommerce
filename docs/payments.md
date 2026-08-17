# Pasarela IPARTS — integraciones, comisiones y partición

Documento de trabajo. Las tarifas de terceros son las publicadas por cada proveedor; se confirman en su dashboard al abrir la cuenta merchant. No se inventa un procesador.

## Qué es cada peso

Cada cobro se parte en **tres bolsillos**:

| Bolsillo | Quién | Qué es |
|---|---|---|
| Procesador | Binance / NOWPayments / banco Zelle | Lo que cobra la red o el PSP |
| Wallet dueño | Tu wallet de pasarela | Comisión IPARTS por operar el riel (hoy **2.5%** = 250 bps) |
| Neto almacén | IPARTS comercio | Lo que queda del pedido |

Fórmula (centavos, redondeo half-up):

```
processor = gross × processorBps / 10000 + fixed
owner     = min(gross × 250 / 10000, gross − processor)
merchant  = gross − processor − owner
```

Código: `src/lib/payment-split.ts`. Checkout lo ejecuta **antes** de marcar pagado. El 2.5% del dueño se acredita en `ownerWallet` (`/owner`).

## Estándares de mercado (referencia)

| Tipo | Rango habitual | Uso |
|---|---|---|
| Tarjeta online US/EU | **2.9% + $0.30** (Stripe) · PayPal cross-border **~3.49% + fijo** | Comprador con Visa/MC |
| Marketplace / Connect | Procesador + **0.25% + $0.25** payout + tu application fee | Si hubiera vendedores terceros |
| Crypto misma moneda | **0.5%–1%** (NOWPayments 0.5% USDT→USDT; Coinbase Commerce 1%; BitPay 1–2% + $0.25) | USDT |
| Binance Pay on-network | **0% publicado** entre wallets Binance; retiro off-network cobra fee de red | Clientes que ya pagan en USDT |
| Zelle | Red **sin API merchant**. El banco receptor puede cobrar **0% o ~1%** (ej. Truist 1% tope $15) | Solo P2P + confirmación humana |
| Take rate marketplace partes | **3–8%** plataforma + procesador | Si IPARTS cobrara a talleres/vendedores |
| Take rate “dueño del riel” (shop propio) | **1.5–3%** interno | Contabilidad de pasarela vs almacén |

Para IPARTS vendiendo su propio inventario, **2.5% a tu wallet** es un riel interno razonable: cubre operación de cobro sin parecer comisión de marketplace (8%+). Se cambia en `PLATFORM_FEE_BPS`.

## Qué se puede integrar de verdad

### 1. Binance Pay — sí, primera línea

- Docs: https://developers.binance.com/docs/binance-pay/introduction
- Alta merchant + KYC, API Key / Secret, webhook `PAY_SUCCESS`.
- Flujo: `createOrder` → QR / deeplink → webhook → marcar `paid` y acreditar dueño.
- Comisión: Binance no publica un % tipo Stripe; FAQ merchant: payout on-network sin fee de red. El retiro a wallet externa sí tiene fee de red.
- Partición dueño: no hay “split nativo” a dos wallets. Cobramos el bruto, el código mueve **2.5%** a `ownerWallet` y el resto queda como neto almacén. Si más adelante querés dos wallets Binance, se hace una transferencia interna post-webhook.

Pendiente para ir a producción: `BINANCE_PAY_API_KEY`, `BINANCE_PAY_API_SECRET`, certificado, URL de webhook.

### 2. USDT vía NOWPayments — sí, respaldo

- Precio oficial: **0.5%** misma moneda, **1%** con conversión + fee de red.
- Fuente: https://nowpayments.io/pricing
- Útil si el cliente no tiene Binance pero sí USDT (TRC20/BSC).

### 3. Zelle — no como pasarela automática

- Zelle **no vende API merchant** a un shop VE.
- Es P2P del banco US. El cliente transfiere a una cuenta; un operador marca “recibido”.
- No se puede destinar automáticamente un % a tu wallet cripto.
- En el shop queda como método **awaiting_payment** (registra referencia; no acredita dueño hasta confirmar).
- Riesgo: chargeback/disputa bancaria, nombre no coincide, no hay idempotencia.

### 4. Tarjeta Stripe / PayPal — no ahora

- Stripe no onboardea merchants en Venezuela.
- PayPal cross-border ~3.49% + fijo; congelamientos frecuentes en alto riesgo (repuestos/electronics).
- Activar solo con entidad US/EU.

## Qué hay que hacer (checklist)

1. **Ya en el shop:** métodos, split 2.5%, ledger `/owner`, Zelle en espera, Binance/NOWPayments como intención + token hasta tener keys.
2. **Cuenta Binance Pay Merchant** y guardar keys solo en env (nunca en el repo).
3. **Webhook firmado** `PAY_SUCCESS` → `processPayment` definitivo (reemplaza el token demo).
4. **Opcional NOWPayments** con IPN.
5. **Zelle:** cuenta US + SOP de conciliación diaria (no automatizable de verdad).
6. **Dokploy:** `ECOMMERCE_API_KEY` en iparts-api para stock real (otro riel, no pagos).
7. No mezclar el 2.5% de pasarela con el markup VIP 18% del mostrador: son capas distintas (precio vs cobro).

## Cómo probarlo

1. http://localhost:3000 — cuenta + carrito.
2. Checkout: elegí Binance Pay, poné `intent_demo`, confirmá.
3. Pedido en **Mis compras** muestra procesador / dueño / neto.
4. http://localhost:3000/owner — wallet del dueño sube 2.5%.
5. Repetí con Zelle: el pedido queda `awaiting_payment` y el wallet **no** suma hasta que exista confirmación.

Ejemplo $100 Binance Pay (0% procesador + 2.5% dueño):

- Procesador $0.00
- Dueño $2.50
- Neto almacén $97.50
