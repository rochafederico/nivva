# 004 — Plan técnico

Spec: `specs/004-refinanciar-egreso/spec.md` · Flujo: `flujo.md`

## Enfoque

Los montos reemplazados van a un almacén propio, `refinanciados`. Todo lo que hoy lee `montos` (totales, vencidos,
avisos, "Editar egreso", avance, lista del mes) deja de verlos sin tocar ese código (criterios 14, 15 y 16), y `syncMontosUseCase` no los puede borrar. El adelanto y las cuotas son montos comunes (9 y 11).

`refinanciarEgreso` hace todo en una sola transacción sobre `montos` y `refinanciados`: si falla, no cambia nada
(escenario de error). La ventana se crea a pedido y se agrega a `document.body`, como `dataActions`, sin tocar
`ResumenMes`. Sigue la forma de `GastoModal`: un formulario con `app-form` y el aviso al terminar de cerrarse.

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/shared/database/schema.js`, `initDB.js`, `localStorageFallback.js` | Cambia (T01); el respaldo baja al unir su comentario inicial | Almacén, versión 7 | 8, 64, 234 → <234 |
| `src/features/refinanciar/RefinanciadoEntity.js`, `refinanciarRepository.js` | Nuevo (T01) | Datos y transacción | — |
| `src/features/refinanciar/planCuotas.js` | Nuevo (T03) | Leer cuotas, fechas del plan y textos del total | — |
| `src/features/refinanciar/components/RefinanciarForm.js`, `refinanciarErrores.js` | Nuevo (T02, T03) | Campos, total y errores | — |
| `src/features/refinanciar/components/RefinanciarModal.js`, `abrirRefinanciar.js` | Nuevo (T02, T04) | Ventana, guardar, mensajes y foco | — |
| `src/features/deudas/components/AcreedoresList.js` | Cambia (T02, T04), extrae `acreedorCalculos.js` | Opción del menú | 195 → <180 |
| `src/features/deudas/components/DebtDetailModal.js` | Cambia (T05), extrae `detalleMontos.js` | Botón y lista de refinanciados | 193 → <170 |
| `src/features/deudas/use-cases/deleteDeudaWithTrackingUseCase.js` | Cambia (T07) | Borra los refinanciados del egreso | 12 |
| `src/layout/dataActions.js` | Cambia (T07) | Borra todo, con los refinanciados | 98 → 99 |
| `src/features/import-export/components/exportarDeudas.js` | Cambia (T06) | Exporta refinanciados | 15 |
| `src/features/import-export/components/ExportDataModal.js` | Cambia (T06) | Los lee antes de exportar | 92 |
| `src/features/import-export/components/ImportDataModal.js` | Cambia (T06), extrae `importarDeuda.js` | Importa refinanciados | 326 → <305 |
| `test/iteraciones.suite.js` | Nuevo (T01) | Reúne las suites de 003 y 004: `run-repo-tests.js` tiene 100 líneas y cambia una, sin crecer | — |

## Datos

Almacén `refinanciados`, `keyPath: id`, índice `by_deudaId`: `{ id, deudaId, monto, moneda, vencimiento, periodo, refinanciadoEl }`. `VERSION` pasa de 6 a 7. La subida solo agrega el almacén, sin migrar datos.

Copia de seguridad: cada egreso suma `refinanciados`, opcional al importar (criterio 18). Al importar sobre un egreso que ya existe, un refinanciado igual en monto, moneda, vencimiento y fecha no se duplica.

Borrado: primero el egreso y después sus refinanciados, sin tocar `deudaRepository` (285 líneas), porque extraer sus borrados no entra en una tarea. Si falla el segundo paso quedan huérfanos, que nada muestra ni exporta.

## Eventos

| Evento | Emite | Escuchan | `detail` |
|---|---|---|---|
| `deuda:updated` | `RefinanciarModal`, al cerrarse | `AcreedoresList`, `DebtList`, `StatsIndicators`, `DeudaTotal` (ya escuchan) | `{ id }` |
| `app:notify` | `RefinanciarModal`, al cerrarse | `AppToast` | `{ message, type }` |

## Accesibilidad

| Criterio | Técnica | Test |
|---|---|---|
| 1.3.1 | [H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44) `label`; [H48](https://www.w3.org/WAI/WCAG22/Techniques/html/H48) `ul` para refinanciados | `refinanciar-form`, `refinanciar-detalle` |
| 1.4.1 | [G14](https://www.w3.org/WAI/WCAG22/Techniques/general/G14) el texto `Refinanciado el` | `refinanciar-detalle` |
| 1.4.3 y 1.4.11 | [G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18), [G207](https://www.w3.org/WAI/WCAG22/Techniques/general/G207) | A mano (T07) |
| 1.4.10 | [C31](https://www.w3.org/WAI/WCAG22/Techniques/css/C31) campos apilados y list group | A mano, 320 px (T07) |
| 2.1.1 | [H91](https://www.w3.org/WAI/WCAG22/Techniques/html/H91) controles nativos; `Escape` de Bootstrap | `refinanciar-modal` |
| 2.4.3 | [G59](https://www.w3.org/WAI/WCAG22/Techniques/general/G59) foco explícito al abrir, cerrar y con error | `refinanciar-modal` |
| 2.4.7 y 2.4.11 | [C15](https://www.w3.org/WAI/WCAG22/Techniques/css/C15); `scroll-margin` como en `MontoRow` | A mano (T07) |
| 2.5.8 | [C42](https://www.w3.org/WAI/WCAG22/Techniques/css/C42) | A mano, teléfono (T07) |
| 3.3.1 y 3.3.3 | [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21) `aria-invalid` y `aria-describedby`; [G85](https://www.w3.org/WAI/WCAG22/Techniques/general/G85) | `refinanciar-form` |
| 4.1.2 | [ARIA14](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA14) `aria-label="Refinanciar Banco Galicia"` | `refinanciar-menu`, `refinanciar-detalle` |
| 4.1.3 | [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) `role="status"` presente antes de cambiar el total; región de `AppToast` al guardar | `refinanciar-form`, `refinanciar-modal` |

## Riesgos

- Subir la versión cierra la base en otras pestañas abiertas, el problema de la spec 005 (#307). Si la 004 sale antes, se puede notar al actualizar.
- Importar una copia anterior a la refinanciación sobre el mismo egreso trae de vuelta los montos reemplazados y el total cuenta doble. La spec no lo cubre: queda en un issue aparte.
- La lista se dibuja de nuevo al guardar y el botón que abrió la ventana desaparece: `abrirRefinanciar` busca
  un control con el mismo nombre accesible después de dibujar y, si no está, va a `add-fab`. Lo cubre `refinanciar-modal`.
- Las cuotas se suman en centavos enteros, para que el total no muestre errores de redondeo: lo cubre `plan-cuotas`.
- `stepMismatch` de happy-dom en el campo de adelanto: los tests emiten `form:submit`, como `gasto-form`.
- Los dos pasos de `Enter` pueden guardar dos veces: el guardado queda bloqueado hasta cerrar, como en #305.

## Principios de la constitución involucrados

1 (todo queda en IndexedDB), 2 (Nivva no calcula ni opina), 3 y 4 (320 px y AA), 5 (textos de la spec; "cuota" solo para el plan), 7 (`features/refinanciar`), 8 (archivos chicos), 9 (eventos), 10 (la ventana muestra el error), 12.
