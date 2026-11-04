# 003 — Tareas

Spec: `specs/003-gastos-diarios/spec.md` · Plan: `plan.md`

Cada tarea es un PR dentro de los límites (10 archivos, 200 líneas).
Máximo 8 tareas; si hacen falta más, la spec se parte.

| ID | Tarea | Criterios que cubre | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|
| T01 | Almacén y repositorio de gastos, versión 6, lo cargado antes se conserva | 20 | `schema.js`, `initDB.js`, `GastoEntity.js`, `GastoModel.js`, `gastoRepository.js`, `localStorageFallback.js`, `localStorageDisponible.js`, `test/gastos-repositorio.test.js`, `test/run-repo-tests.js` | 190 | en PR |
| T02 | Resumen: Egresos y Balance suman gastos por moneda; el resto de la app no los ve | 12, 13, 14 | `statsService.js`, `StatsIndicators.js`, `kpiCell.js`, `test/gastos-resumen.test.js`, `test/gastos.suite.js`, `test/run-repo-tests.js` | 170 | pendiente |
| T03 | Copia de seguridad, importación y borrado de todos los datos | 15, 16, 20 | `ExportDataModal.js`, `ImportDataModal.js`, `importarMovimientos.js`, `dataActions.js`, `test/gastos-copia.test.js`, `test/gastos.suite.js` | 170 | pendiente |
| T04 | Formulario de gasto: campos, valores iniciales y errores por campo | 2, 5 | `GastoForm.js`, `gastoFormErrores.js`, `test/gasto-form.test.js`, `test/gastos.suite.js` | 180 | pendiente |
| T05 | Ventana del gasto: guardar, mensajes, cancelar, error al guardar, foco y título anunciado | 3, 4, 6 | `GastoModal.js`, `UiModal.js`, `uiModalPlantilla.js`, `AppToast.js`, `montoHablado.js`, `test/gasto-modal.test.js`, `test/gastos.suite.js` | 150 | pendiente |
| T06 | Segundo paso del botón + y títulos de gasto con vencimiento | 1, 18, 19, 20 | `RegistroSheet.js`, `ResumenMes.js`, `DebtModal.js`, `test/resumen.test.js`, `test/registro-sheet.test.js`, `test/debt-form-montos.test.js`, `test/gastos.suite.js` | 190 | pendiente |
| T07 | Fila del gasto en "Todo" y "Egresos": orden, lector, menú y 320 px | 7, 8, 13, 17 | `DebtList.js`, `filasDelMes.js`, `GastoRow.js`, `main.scss`, `test/gasto-row.test.js`, `test/gastos.suite.js` | 190 | pendiente |
| T08 | Editar y eliminar con su foco y anuncios; revisión a mano del PR | 8, 9, 10, 11, 21 | `gastoAcciones.js`, `GastoRow.js`, `GastoForm.js`, `GastoModal.js`, `DebtList.js`, `test/gasto-acciones.test.js`, `test/gastos.suite.js` | 190 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Orden y dependencias

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08

T06 es la primera que cambia lo que ve la persona: se valida en el teléfono antes de seguir con T07, y ahí se
decide si hace falta "Volver" (hallazgo 3 de `flujo.md`). T08 incluye la revisión a mano: teclado, lector de
pantalla, contraste, zoom al 200 % y ancho de 320 px.
