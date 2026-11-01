# 001 — Tareas

Spec: `specs/001-lista-montos-egreso/spec.md` · Plan: `plan.md`

Cada tarea es un PR dentro de los límites (10 archivos, 200 líneas).
Máximo 8 tareas; si hacen falta más, la spec se parte.

| ID | Tarea | Criterios que cubre | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|
| T01 | Función `calcularVencimientoDuplicado`: mismo día en el mes siguiente al vencimiento más tardío, último día del mes si no existe, misma fecha si es inválida | 6, 7, escenario de error | `src/features/montos/vencimientoDuplicado.js` (nuevo), `test/monto-duplicado.test.js` (nuevo), `test/run-repo-tests.js` | ~110 | pendiente |
| T02 | Fila `createMontoCard`: `<li>` con importe y moneda formateados, `Vence …`, estado Pagado/Pendiente, casilla "Pagado" con etiqueta, botón "Editar" con nombre accesible | 2, 3, 4 | `src/features/montos/components/montoCard.js` (nuevo), `test/monto-card.test.js` (nuevo), `test/run-repo-tests.js` | ~170 | pendiente |
| T03 | Menú `createMontoCardMenu`: botón "Más acciones" con `aria-haspopup`/`aria-expanded` y nombre accesible, opciones Duplicar y Eliminar, `createDropdown`, `Escape` y flechas; se suma a la fila | 5 | `src/features/montos/components/montoCardMenu.js` (nuevo), `src/features/montos/components/montoCard.js`, `test/monto-card.test.js` | ~150 | pendiente |
| T04 | `<monto-list>`: `<ul>` etiquetada y ordenada, estado vacío, región `aria-live` (`anunciar`), `confirm()` con el texto de la spec antes de emitir `monto:delete`, `enfocarTrasEliminar`, eventos `monto:edit`/`monto:duplicate` | 1, 8, 9, 10, 11 | `src/features/montos/components/MontoList.js` (nuevo), `test/monto-list.test.js` (nuevo), `test/run-repo-tests.js` | ~190 | pendiente |
| T05 | Integrar `<monto-list>` en `DebtForm`: sacar la tabla, `renderMontosList` de filas y el contenedor con `max-height`; conectar `monto:edit`, y `monto:duplicate`/`monto:delete` a la lógica actual (misma fecha) para no romper nada entre tareas; ajustar tests de `deudas.test.js` acoplados a la tabla. `DebtForm` se achica | 1, 3, 4, 12 | `src/features/deudas/components/DebtForm.js`, `test/deudas.test.js`, `test/monto-list.test.js` | ~190 | pendiente |
| T06 | En `DebtForm`, duplicar con `calcularVencimientoDuplicado` y sumar anuncio y foco a duplicar y eliminar; sacar la lógica vieja | 6, 8, 9, 10 | `src/features/deudas/components/DebtForm.js`, `test/deudas.test.js`, `test/monto-list.test.js` | ~120 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Cobertura de criterios

| Criterio | Tareas |
|---|---|
| 1 Lista `<ul>` etiquetada y ordenada, sin tabla | T04, T05 |
| 2 Formato de importe y vencimiento | T02 |
| 3 Estado y casilla "Pagado" | T02, T05 |
| 4 Botón "Editar" | T02, T05 |
| 5 Menú "Más acciones" | T03 |
| 6 Duplicar al mes siguiente | T01, T06 |
| 7 Último día del mes | T01 |
| 8 Confirmar al eliminar | T04, T06 |
| 9 Foco tras eliminar | T04, T06 |
| 10 Anuncios `aria-live` | T04, T06 |
| 11 Estado vacío | T04 |
| 12 Sin scroll propio | T05 |

## Orden y dependencias

T01 → T02 → T03 → T04 → T05 → T06

T01 a T04 son archivos nuevos y no cambian la app. T05 la cambia (la lista
nueva aparece en el modal). T06 completa duplicar y eliminar.
