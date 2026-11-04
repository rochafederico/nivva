# 003 — Plan técnico

Spec: `specs/003-gastos-diarios/spec.md` · Flujo: `flujo.md`

## Enfoque

Los gastos van en un almacén propio, no en deudas y montos. Así Acreedores, Deuda total, vencidos y avisos
siguen sin verlos (criterio 13) sin tocar ese código, y lo cargado antes queda como gasto con vencimiento
sin migrar nada (criterio 20). No hay campo de tipo: el almacén es el tipo, y por eso no se puede cambiar (21).
`statsService` suma los gastos a Egresos y Balance. `DebtList` los mezcla en sus filas. El formulario y la
ventana copian la forma de `IngresoForm` e `IngresoModal`.

La ventana emite su evento recién al cerrarse, porque Bootstrap retiene el foco hasta entonces. El evento
dice a quién darle el foco, y la lista se lo da al terminar de dibujarse (criterios 9 y 11).

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/features/gastos/` `GastoEntity`, `GastoModel`, `gastoRepository` | Nuevo (T01) | Datos | — |
| `src/shared/database/schema.js`, `initDB.js` | Cambia (T01) | Almacén, versión 6 | 7, 58 |
| `src/shared/database/localStorageFallback.js` | Cambia (T01), extrae `_ls` a `localStorageDisponible.js` | Almacén en el respaldo | 244 → ~233 |
| `src/features/stats/statsService.js` | Cambia (T02) | Suma por moneda | 79 |
| `src/features/stats/components/StatsIndicators.js` | Cambia (T02), extrae `kpiCell.js` | Escucha los eventos | 166 → ~125 |
| `src/features/import-export/components/ExportDataModal.js` | Cambia (T03), extrae el mapeo | Exporta gastos | 105 → ~100 |
| `src/features/import-export/components/ImportDataModal.js` | Cambia (T03), extrae `importarMovimientos.js` | Importa gastos | 337 → ~325 |
| `src/layout/dataActions.js` | Cambia (T03) | Borra gastos dentro de "Egresos" | 97 |
| `src/features/gastos/components/GastoForm.js`, `gastoFormErrores.js` | Nuevo (T04) | Campos y errores | — |
| `src/features/gastos/components/GastoModal.js` | Nuevo (T05) | Ventana, mensajes y foco | — |
| `src/shared/components/UiModal.js` | Cambia (T05), extrae la plantilla | Id de título único | 144 → ~135 |
| `src/shared/components/AppToast.js`, `montoHablado.js` | Cambia (T05) | Región de anuncios; mes hablado | 37, 46 |
| `src/features/deudas/components/RegistroSheet.js` | Nuevo (T06) | Pasos 1 y 2, extraídos de `ResumenMes` | — |
| `src/pages/ResumenMes.js` | Cambia (T06) | Usa `RegistroSheet` | 313 → ~275 |
| `src/features/deudas/components/DebtModal.js` | Cambia (T06) | Títulos | 87 |
| `test/resumen.test.js` | Cambia (T06), sin asserts repetidos | Pasos nuevos | 259 → ~250 |
| `src/features/deudas/components/DebtList.js` | Cambia (T07, T08), borra código muerto y extrae `filasDelMes.js` | Filas, orden y foco | 279 → ~255 |
| `src/features/gastos/components/GastoRow.js`, `gastoAcciones.js` | Nuevo (T07, T08) | Fila; editar y eliminar | — |
| `test/gastos.suite.js` | Nuevo (T01) | Reúne los tests de la 003: `run-repo-tests.js` tiene 98 líneas y solo se toca una vez | — |

## Datos

Almacén `gastos`, `keyPath: id`, índice `by_periodo`: `{ id, descripcion, monto, moneda, fecha, periodo }`.
`VERSION` pasa de 5 a 6. La subida solo agrega el almacén. `db.onversionchange` cierra la base para que otra
pestaña abierta no trabe la subida. Copia de seguridad: clave `gastos`, opcional al importar (criterio 15).
Los gastos se suman a "egresos" en la vista previa y en el aviso de importación, sin textos nuevos, y al
borrar todo se borran en la misma entrada "Egresos" (16).

## Eventos

| Evento | Emite | Escuchan | `detail` |
|---|---|---|---|
| `gasto:saved`, `gasto:updated` | `GastoModal`, al cerrarse | `DebtList`, `StatsIndicators` | `{ id, gasto, foco }` |
| `gasto:deleted` | `gastoAcciones` | `DebtList`, `StatsIndicators` | `{ id, foco }` |

## Accesibilidad

| Criterio | Técnica | Test |
|---|---|---|
| 1.3.1 | [H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44) `label`; [ARIA17](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA17) `role="group"` con el título | `gasto-form`, `registro-sheet` |
| 1.4.1 | [G14](https://www.w3.org/WAI/WCAG22/Techniques/general/G14) el texto `Gasto` en la fila | `gasto-row` |
| 1.4.3 y 1.4.11 | [G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18), [G207](https://www.w3.org/WAI/WCAG22/Techniques/general/G207) | A mano (T08) |
| 1.4.10 | [C31](https://www.w3.org/WAI/WCAG22/Techniques/css/C31) flex y corte a 2 líneas con `-webkit-line-clamp`, sin `table-responsive` | A mano, 320 px |
| 2.1.1 | [H91](https://www.w3.org/WAI/WCAG22/Techniques/html/H91) controles nativos; menú de la spec 001 | `registro-sheet`, `gasto-acciones` |
| 2.4.3 | [G59](https://www.w3.org/WAI/WCAG22/Techniques/general/G59) foco explícito tras cada acción | `gasto-modal`, `gasto-acciones` |
| 2.4.7 y 2.4.11 | [C15](https://www.w3.org/WAI/WCAG22/Techniques/css/C15); `scroll-margin` como en `MontoRow` | A mano |
| 2.5.8 | [C42](https://www.w3.org/WAI/WCAG22/Techniques/css/C42) | A mano, teléfono |
| 3.3.1 y 3.3.3 | [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21) `aria-invalid` y `aria-describedby`; [G85](https://www.w3.org/WAI/WCAG22/Techniques/general/G85) | `gasto-form` |
| 4.1.2 | [ARIA14](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA14) nombre del ⋮; [ARIA16](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA16) id único del título | `gasto-row`, `gasto-modal` |
| 4.1.3 | [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) región `role="status"` presente antes del toast | `gasto-modal` |

## Riesgos

- El id repetido `modal-title` hace que el lector anuncie otro título: T05 lo corrige y lo prueba.
- `stepMismatch` de happy-dom en campos numéricos: los tests emiten `form:submit`, como `debt-form-agregar`.
- Una descripción solo con espacios pasa `required`: `gastoFormErrores` recorta y marca el error.
- Sacar `table-responsive` puede sumar scroll a 320 px: T07 se revisa en el teléfono.
- El orden depende de armar `[ingresos, montos, gastos]` y de un orden estable: lo cubre `gasto-row`.

## Principios de la constitución involucrados

1 (todo queda en IndexedDB), 3 y 4 (320 px y AA), 5 (textos de la spec), 7 (`features/gastos`), 8 (archivos
chicos), 9 (eventos), 10 (el repositorio rechaza y la ventana muestra el error), 12 (tests por criterio).
