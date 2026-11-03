# 002 — Tareas

Spec: `specs/002-agregar-editar-monto-en-lista/spec.md` · Plan: `plan.md`

Cada tarea es un PR dentro de los límites (10 archivos, 200 líneas).
Máximo 8 tareas; si hacen falta más, la spec se parte.

| ID | Tarea | Criterios que cubre | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|
| T01 | Monto abierto: "Listo" y "Cancelar" con sus nombres, errores por campo y general, foco en el primero | 8 | `MontoForm.js`, `montoFormErrores.js`, `test/monto-abierto-errores.test.js`, `test/montos.test.js`, `test/deudas.test.js`, `test/run-repo-tests.js` | 180 | pendiente |
| T02 | La lista dibuja una fila abierta y no pierde lo escrito al cambiar otras filas | 13 | `montoAbierto.js`, `montosListaAbierto.js`, `MontosList.js`, `test/montos-list-abierto.test.js`, `test/run-repo-tests.js` | 180 | pendiente |
| T03 | Agregar y descartar un monto nuevo en la lista; se borra su formulario aparte | 1, 2, 5 | `montosListaAbierto.js`, `DebtForm.js`, `test/deudas.test.js`, `test/debt-form-agregar.test.js`, `test/run-repo-tests.js` | 190 | pendiente |
| T04 | Editar y descartar un monto en su fila; se borra su formulario aparte | 3, 4, 6 | `montosListaAbierto.js`, `DebtForm.js`, `test/deudas.test.js`, `test/debt-form-montos.test.js`, `test/debt-form-editar.test.js`, `test/run-repo-tests.js` | 190 | pendiente |
| T05 | Un solo monto abierto a la vez; se va `¿Cancelar los cambios actuales?` | 12, 13 | `montosListaAbierto.js`, `DebtForm.js`, `test/deudas.test.js`, `test/montos-list-un-abierto.test.js`, `test/run-repo-tests.js` | 150 | pendiente |
| T06 | Limpieza: "Cancelar" del pie con un monto abierto, sin restos del formulario aparte, analítica fuera de `DebtForm` | 7 | `DebtForm.js`, `debtFormAnalitica.js`, `test/deudas.test.js`, `test/debt-form-cancelar.test.js`, `test/run-repo-tests.js` | 170 | pendiente |
| T07 | "Guardar" con un monto abierto: incluirlo, marcar y mover el foco | 9, 10, 11 | `DebtForm.js`, `debtFormGuardar.js`, `test/debt-form-guardar.test.js`, `test/run-repo-tests.js` | 170 | pendiente |
| T08 | Pie con un solo botón principal y mensaje sin montos; revisión a mano del PR | 14, 15 | `DebtModal.js`, `DebtForm.js`, `debtFormGuardar.js`, `test/deudas.test.js`, `test/debt-form-sin-montos.test.js`, `test/run-repo-tests.js` | 130 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Orden y dependencias

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08

T03 es la primera que cambia lo que ve la persona: se valida en el teléfono
antes de seguir con T04. T08 incluye la revisión a mano: teclado, lector de
pantalla, contraste, zoom al 200 % y ancho de 320 px.
