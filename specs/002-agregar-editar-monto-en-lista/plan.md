# 002 — Plan técnico

Spec: `specs/002-agregar-editar-monto-en-lista/spec.md` · Flujo: `flujo.md`

## Enfoque

`montos-list` pasa a dibujar también la fila abierta, y esa fila usa el
`monto-form` que ya existe en modo `inline`: conserva sus campos, validación
y mensajes. Se conecta de a un caso a `DebtForm`, en vez de todo junto:
los tests del formulario viejo (UC8 a UC12, 277 líneas de `deudas.test.js`)
no entran en un solo PR. Cada tarea borra los del caso que reemplaza.

La fila abierta es un nodo que se conserva entre dibujos de la lista, así
el interruptor, "Duplicar" y "Eliminar" de otro monto no pierden lo escrito
(criterio 13). Un monto nuevo no entra en el arreglo hasta "Listo", y uno
existente no cambia hasta "Listo": `duplicarMonto` ya cuenta lo que pide el
criterio 13 sin cambios. `Escape` se detiene en la fila para que el modal
no lo reciba.

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/features/montos/components/montoFormErrores.js` | Nuevo (T01) | Mensajes por campo y general, extraídos de `MontoForm` | — |
| `src/features/montos/components/MontoForm.js` | Cambia (T01) | Botón "Listo", nombres, errores visibles | 174 → ~140 |
| `src/features/montos/components/montoAbierto.js` | Nuevo (T02) | Fila abierta: `li`, grupo, `monto-form`, `Escape` | — |
| `src/features/montos/components/montosListaAbierto.js` | Nuevo (T02–T05) | Abrir, confirmar, descartar, foco y anuncios | — |
| `src/features/montos/components/MontosList.js` | Cambia (T02) | Dibuja la fila abierta; queda en 100 o menos | 72 |
| `src/features/deudas/components/DebtForm.js` | Cambia (T03–T08) | Usa la lista; se borra el formulario aparte | 522 → ~380 |
| `src/features/deudas/components/debtFormAnalitica.js` | Nuevo (T06) | Analítica extraída de `DebtForm` | — |
| `src/features/deudas/components/debtFormGuardar.js` | Nuevo (T07) | Decide el guardado y el primer campo con problema | — |
| `src/features/deudas/components/DebtModal.js` | Cambia (T08) | Clases de los botones del pie | 87 |
| `test/deudas.test.js` | Cambia (T01, T03–T06, T08) | Se borran UC8 a UC12; se ajustan UC16 y UC17b | 1407 → ~1120 |
| `test/montos.test.js` | Cambia (T01) | UC4d con "Listo" | 503 → menos |
| `test/*.test.js`, `test/run-repo-tests.js` | Nuevos o cambia | Un test por tarea, de 100 líneas o menos | 97 → ~110 |

`MontoForm`, `DebtForm`, los dos tests grandes y `run-repo-tests.js` pasan o
pueden pasar de 100 líneas: cada tarea que los toca los deja con menos, salvo
`run-repo-tests.js`, que se parte en T01 si hace falta.

## Datos

Sin cambios de esquema ni migración. Se conservan `id` y `pagado` al editar.

## Eventos

| Evento | Lo emite | Lo escucha | Para qué |
|---|---|---|---|
| `monto:save`, `monto:cancel` | `monto-form` | `montosListaAbierto` | Confirmar o descartar la fila |
| `montos:cerrado` (`detail.motivo`) | `montos-list` | `DebtForm` | Foco en "Agregar monto" al descartar un nuevo |
| `montos:edit` | `montos-list` | `DebtForm` | Deja de abrir el formulario aparte (T04) |

## Accesibilidad

| Criterio | Técnica | Test |
|---|---|---|
| 1.3.1 | `<div role="group" aria-label="Monto 3">` dentro del `li` ([ARIA17](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA17)); `<label>` en cada campo ([H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44)) | T02 |
| 1.4.10 | `col-12` en mobile, sin anchos fijos ([C32](https://www.w3.org/WAI/WCAG22/Techniques/css/C32)) | A mano en T03 y T08 |
| 1.4.11 | Colores del tema: `border`, `form-control`, `btn-outline-secondary` | A mano en T08 |
| 2.1.1 y 2.1.2 | Controles nativos; `Enter` por envío del formulario; `Escape` por `keydown` ([G202](https://www.w3.org/WAI/WCAG22/Techniques/general/G202), [G21](https://www.w3.org/WAI/WCAG22/Techniques/general/G21)) | T03, T04 |
| 2.4.3 | `focus()` explícito al abrir, cerrar y fallar ([G59](https://www.w3.org/WAI/WCAG22/Techniques/general/G59)) | T01, T03, T04, T05, T07, T08 |
| 2.4.7 y 2.4.11 | Foco de Bootstrap ([G149](https://www.w3.org/WAI/WCAG22/Techniques/general/G149)); `scroll-margin-block` ([C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43)) | T02; a mano en T08 |
| 2.5.3 y 4.1.2 | `aria-label` que empieza con el texto visible: `Listo, monto 3`, `Cancelar monto nuevo` ([G208](https://www.w3.org/WAI/WCAG22/Techniques/general/G208), [ARIA14](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA14)) | T01 |
| 2.5.8 | `btn-sm` (≥ 31 px) | A mano en T08 |
| 3.3.1 y 3.3.3 | `aria-invalid` y `aria-describedby` al mensaje ([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21), [G85](https://www.w3.org/WAI/WCAG22/Techniques/general/G85)) | T01 |
| 4.1.3 | `role="status"` existente ([ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)); `role="alert"` en `#form-error` ([ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)) | T03, T04, T08 |

## Riesgos

- **Límite de 8 tareas:** si una tarea no entra en un PR, se parte la spec.
- **`Escape`:** happy-dom no prueba el modal real de Bootstrap; se valida a
  mano en T03, además del test de que el evento no sale de la fila.
- **Cambio visible por partes:** después de T03 agregar es la fila nueva y
  editar sigue con el formulario aparte hasta T04. No se publica a medias
  sin validar: T03 se prueba en el teléfono antes de seguir.
- **Tests por posición:** se elige en los menús por texto (`learnings.md`).

## Principios de la constitución involucrados

- 3 y 4: la fila se valida a 320 px y con las técnicas de arriba.
- 5: textos tal cual la spec; "Listo" según `06-CTAs.md`.
- 6, 8 y 9: light DOM, archivos chicos y eventos entre componentes.
- 11: sin dependencias nuevas. 12: cada criterio tiene test (`tareas.md`).
