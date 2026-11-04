# 05 — Glosario de Nivva

> **Objetivo:** definir los términos aprobados para la UI, sus sinónimos prohibidos y ejemplos de uso.  
> **Links:** [← 04 Voz y tono](https://github.com/rochafederico/deudas-app/wiki/04-Voz-y-tono) | [06 — CTAs →](https://github.com/rochafederico/deudas-app/wiki/06-CTAs)

---

## 📖 Tabla de términos

| Término aprobado | Sinónimos prohibidos | Definición operativa | Ejemplo de uso en UI |
|---|---|---|---|
| **Egreso** | Deuda, gasto fijo, compromiso, obligación | Salida registrada por la persona. Es de uno de dos tipos: Gasto o Gasto con vencimiento | "Agregá un egreso" / "Egresos del mes" |
| **Gasto** | Compra, consumo, gasto hormiga, gasto diario | Egreso ya pagado, sin acreedor ni vencimiento (súper, transporte, salidas) | "Agregar gasto" / "Gasto · 03/11/2026" |
| **Gasto con vencimiento** | Gasto mensual, gasto fijo, deuda | Egreso con acreedor y uno o más montos con vencimiento, periódico o único (alquiler, tarjeta, préstamo, servicio) | "Agregar gasto con vencimiento" |
| **Monto** | Cuota, importe, valor, plata, precio | Cifra numérica de un egreso, asociada a moneda y período; en un gasto con vencimiento, también a un vencimiento | "$ 15.000,00" / "US$ 15.000,00" / "Agregar monto" |
| **Acreedor** | A quién le debo, prestamista, empresa | Entidad o persona a la que se le debe el pago del egreso | "Acreedor: Banco Galicia" |
| **Tipo de deuda** | Categoría, tipo, clase | Clasificación libre del egreso (ej: tarjeta, alquiler, préstamo, servicio) | "Tipo de deuda: Tarjeta de crédito" |
| **Ingreso** | Sueldo, entrada, plata que entra | Dinero recibido en un período (sueldo, honorarios, renta, etc.) | "Agregar ingreso" / "Ingresos del mes" |
| **Moneda** | Divisa, currency, tipo de cambio | Unidad monetaria del monto (ARS, USD, etc.) | "Moneda: ARS" |
| **Vencimiento** | Fecha límite, due date, fecha de pago | Fecha en la que el monto debe pagarse | "Vencimiento: 10/05/2026" |
| **Período** | Mes, periodo, ciclo | Mes al que corresponde el monto (formato YYYY-MM) | "Período: 2026-04" |
| **Copia de seguridad** | backup, respaldo, archivo de exportación | Archivo .json que contiene todos los datos de la app para restaurar | "Hacé una copia de seguridad desde Ajustes." |
| **Ajustes** | Configuración, settings, opciones | Menú con acciones administrativas (exportar, importar, eliminar datos) | "Desde Ajustes podés exportar tus datos." |
| **Balance** | Saldo, diferencia, resultado | Diferencia entre ingresos y egresos del mes | "Balance: +$5.000 ARS" |
| **Pendientes** | Por pagar, a cobrar, impagos | Montos no marcados como pagados en el período | "Pendientes: $30.000 ARS" |
| **Refinanciación** | Renegociación, reestructuración, plan de pagos | Plan nuevo que registra la persona y reemplaza los montos sin pagar de un egreso en una moneda | "Refinanciación guardada." |
| **Refinanciado** | Reemplazado, anulado, cancelado | Monto sin pagar que una refinanciación reemplazó; queda como historial y no cuenta en los totales | "Refinanciado el 03/11/2026" |
| **Adelanto** | Anticipo, pago a cuenta, amortización | Monto ya pagado que se registra junto con una refinanciación | "Adelanto: $ 20.000,00." |

---

## 🔴 Términos técnicos internos — nunca mostrar al usuario

Estos términos son nombres internos del código. No deben aparecer en la UI:

| Término técnico | ¿Dónde está? | Cómo nombrarlo si es necesario |
|---|---|---|
| `DeudasApp` | Mensajes de error de import | "Nivva" |
| `tipoDeuda` | Nombre de campo JS | "Tipo de deuda" |
| `deudaId` | Base de datos | No se muestra al usuario |
| `IndexedDB` | Base de datos interna | "tu dispositivo" |
| `JSON` (solo) | Mensajes técnicos | "archivo de backup" o "archivo .json" |
| `módulos de datos` | Error interno | "tus datos" |
| `Error opening database` | Console/Error interno | No mostrar al usuario |

---

## 🌍 Anglicismos: cuándo usarlos y cuándo no

| Término | Decisión | Fundamento |
|---|---|---|
| `backup` | ❌ Prohibido en texto corriente | Usar "copia de seguridad" |
| `JSON` | ✅ Permitido cuando acompaña a "archivo" o ".json" | Es el estándar técnico universal |
| `feedback` | ⚠️ Tolerable solo en botón de FAB visible | Si se puede, usar "comentario" o "sugerencia" |
| `dashboard` | ❌ Prohibido | Usar "resumen" o "panorama" |
| `email` | ✅ Permitido | Es el estándar universal |
| `ARS` / `USD` | ✅ Permitido | Son códigos ISO de moneda |

---

## 📌 Notas de uso por término

### Egreso vs. Deuda
- La palabra **"deuda"** tiene connotación negativa y de problema. En la interfaz preferimos **"egreso"**.
- En contextos educativos o de onboarding, podemos usar "compromiso financiero" como alternativa más neutral.
- El repo se llama internamente "deudas-app" — esto es un nombre técnico, no de UI.

### Gasto vs. Gasto con vencimiento
- La diferencia es el vencimiento: un gasto ya está pagado; uno con vencimiento puede estar pendiente.
- "Gasto" solo nombra siempre al tipo sin vencimiento. Para hablar de los dos, se usa **"egreso"**.
- No se dice "gasto mensual": un gasto con vencimiento también puede ser un pago único.

### Monto vs. Cuota
- **"Monto"** es el término genérico para una cifra de pago. Puede ser una cuota de tarjeta, un alquiler mensual o un pago único.
- **"Cuota"** es un término más específico (implica pagos en cuotas de crédito). No usar como sinónimo de monto en todos los contextos.
- En una refinanciación se dice **"cuotas"** al escribir el plan; cada una queda guardada como un monto.

### Plata / Dinero

- Las palabras **"plata"** y **"dinero"** están prohibidas en toda la UI y el contenido de marca.
- Nivva **no gestiona dinero** — gestiona **números que el usuario ingresa**. La app solo registra y visualiza; no interpreta si son fondos, deudas o activos reales.
- En la UI, una cifra numérica es siempre un **"monto"** (nunca "plata" ni "dinero").
- En copy de redes, onboarding y documentación de cara al usuario: usar **"números"**, **"registros"** o **"compromisos"** en lugar de cualquier equivalente monetario coloquial.
- Nota: en este glosario "plata" y "dinero" aparecen únicamente en la columna **"Sinónimos prohibidos"** — su presencia ahí es intencional y documenta exactamente qué términos hay que evitar.

### Copia de seguridad
- El sistema exporta un archivo `.json` con todos los datos.
- En la UI: **"copia de seguridad"** (no "backup", no "exportación" como único término).
- El archivo descargado se llama `deudasapp-backup.json` internamente — no es necesario mostrarlo como nombre en la UI.

---

## ✅ Checklist QA — 05-Glosario

- [x] Cada término tiene: término aprobado, sinónimos prohibidos, definición, ejemplo de uso
- [x] Cubre: Egreso, Gasto, Gasto con vencimiento, Monto, Acreedor, Tipo de deuda, Ingreso, Moneda, Vencimiento, Período
- [x] Cubre: Copia de seguridad, Ajustes, Balance, Pendientes, Refinanciación, Refinanciado, Adelanto
- [x] Sección de términos técnicos internos que no deben exponerse al usuario
- [x] Regla de anglicismos con decisión por término
- [x] Links cruzados con 04-Voz y tono y 06-CTAs
- [x] Consistente con inventario de 02-Relevamiento

---

*← [04 — Voz y tono](https://github.com/rochafederico/deudas-app/wiki/04-Voz-y-tono) | [06 — CTAs →](https://github.com/rochafederico/deudas-app/wiki/06-CTAs)*
