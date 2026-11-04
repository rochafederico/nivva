# 004 — Tareas

Spec: `specs/004-refinanciar-egreso/spec.md` · Plan: `plan.md`

| ID | Tarea | Criterios que cubre | Cómo se prueba en la app | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|---|
| T01 | Base sin UI: almacén, versión 7 y refinanciar en una transacción | 8, 9, 12 | Sin UI: la app abre con los datos de antes y los tests cubren el resto | `schema.js`, `initDB.js`, `localStorageFallback.js`, `RefinanciadoEntity.js`, `refinanciarRepository.js`, `test/refinanciar-repositorio.test.js`, `test/iteraciones.suite.js`, `test/run-repo-tests.js`, `tareas.md` | 180 | en PR |
| T02 | `Refinanciar` en el menú ⋮ y la ventana con acreedor, resumen y cancelar | 1, 2, 3, 19 | Abrir desde Acreedores, ver el resumen y cancelar; validar en el teléfono | `AcreedoresList.js`, `acreedorCalculos.js`, `RefinanciarForm.js`, `RefinanciarModal.js`, `abrirRefinanciar.js`, `test/refinanciar-menu.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 195 | en PR |
| T02b | Campos de la ventana y elección de moneda (T02 no entraba en 200 líneas) | 3, 4 | Ver los campos con el foco en el primero y elegir moneda en un egreso con dos | `RefinanciarForm.js`, `test/refinanciar-campos.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 90 | en PR |
| T03 | Cuotas, total en vivo, adelanto con su fecha y errores por campo | 5, 6, 20 | Escribir cuotas y adelanto, ver el total y probar `5.000` | `planCuotas.js`, `refinanciarErrores.js`, `RefinanciarForm.js`, `test/plan-cuotas.test.js`, `test/refinanciar-form.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 190 | en PR |
| T04 | Guardar: confirmación, plan, adelanto, mensaje, error al guardar y foco | 7, 8, 9, 10, 12 y escenario de error | Refinanciar de verdad, cancelar la confirmación y ver el total nuevo | `RefinanciarModal.js`, `abrirRefinanciar.js`, `planCuotas.js`, `test/refinanciar-modal.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 190 | en PR |
| T05 | Detalle: botón `Refinanciar` y lista "Refinanciados" | 1, 2, 13, 16 | Abrir el detalle de un egreso refinanciado y refinanciar desde ahí | `DebtDetailModal.js`, `detalleMontos.js`, `test/refinanciar-detalle.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 190 | pendiente |
| T06 | Copia de seguridad e importación con refinanciados | 18 | Exportar, borrar todo e importar; importar una copia vieja | `exportarDeudas.js`, `ExportDataModal.js`, `ImportDataModal.js`, `importarDeuda.js`, `refinanciarRepository.js`, `test/refinanciar-copia.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 170 | pendiente |
| T07 | Eliminar con refinanciados, resto de la app sin ellos y revisión a mano | 11, 14, 15, 16, 17 y escenario mobile | Eliminar un egreso refinanciado; mirar resumen, lista del mes y avance; recorrer a 320 px, con teclado y con lector | `deleteDeudaWithTrackingUseCase.js`, `dataActions.js`, `test/refinanciar-resto.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 130 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Orden y dependencias

T01 → T02 → T02b → T03 → T04 → T05 → T06 → T07

T02 es la primera que cambia lo que ve la persona: se valida en el teléfono antes de seguir. T04 es la primera que
guarda. T07 incluye la revisión a mano: teclado, lector de pantalla, contraste, zoom al 200 % y ancho de 320 px.
