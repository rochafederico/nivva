# 001 — Tareas

Spec: `specs/001-lista-montos-egreso/spec.md` · Plan: `plan.md`

Cada tarea es un PR dentro de los límites (10 archivos, 200 líneas).
Máximo 8 tareas; si hacen falta más, la spec se parte.

Cada tarea suma su test en `test/` y lo registra en `test/run-repo-tests.js`.

| ID | Tarea | Criterios que cubre | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|
| T01 | Forma hablada del monto y la fecha, y cálculo del monto duplicado (funciones puras) | 3, 6, 7 | `montos/utils/montoHablado.js`, `montos/utils/duplicarMonto.js`, `test/montos-formato.test.js`, `test/run-repo-tests.js` | 170 | en PR |
| T02 | Botón de menú: abrir y cerrar con `Enter`, `Espacio` y clic, `Escape`, `Tab`, clic afuera, un solo menú abierto, estado para el lector | 8 | `shared/components/MenuButton.js`, `test/menu-button.test.js`, `test/run-repo-tests.js` | 180 | en PR |
| T03 | Botón de menú: flecha abajo y arriba para abrir y moverse, vuelta en las puntas, `Inicio` y `Fin` | 8 | `shared/components/menuButtonTeclas.js`, `shared/components/MenuButton.js`, `test/menu-button-teclas.test.js`, `test/run-repo-tests.js` | 140 | en PR |
| T04 | Fila de monto: cifra y vencimiento visibles y hablados, casilla "Pagado", "Editar" y "Más acciones" con sus nombres | 2, 3, 4, 14 | `montos/components/MontoRow.js`, `test/monto-row.test.js`, `test/run-repo-tests.js` | 185 | en PR |
| T05 | Lista "Montos": orden, texto de orden, anuncio como lista, lista vacía, sin scroll propio | 1, 12, 13 | `montos/components/MontosList.js`, `test/montos-list.test.js`, `test/run-repo-tests.js` | 180 | pendiente |
| T06 | Acciones de la lista: duplicar, eliminar con confirmación, foco y anuncios | 6, 7, 9, 10, 11 | `montos/components/montosListaAcciones.js`, `montos/components/MontosList.js`, `test/montos-list-acciones.test.js`, `test/run-repo-tests.js` | 180 | pendiente |
| T07 | Usar la lista en "Agregar egreso" y "Editar egreso" y borrar la tabla vieja | 1, 4, 5, 13 | `deudas/components/DebtForm.js` (609 → ~510), `test/deudas.test.js` (1412 → ~1380), `test/debt-form-montos.test.js`, `test/run-repo-tests.js` | 160 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Orden y dependencias

T01 → T04 · T02 → T03 → T04 → T05 → T06 → T07

T01 y T02 no dependen entre sí. T07 es la única que cambia lo que ve la
persona; hasta entonces las piezas nuevas no se usan en la app. Su PR
incluye la revisión a mano: teclado, lector de pantalla, contraste, zoom
al 200 % y ancho de 320 px.
