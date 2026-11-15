# 005 — Tareas

Spec: `specs/005-empeza-por-aca/spec.md` · Plan: `plan.md`

Cada tarea es un PR dentro de los límites (10 archivos, 200 líneas). Contá `tareas.md` entre los archivos.

| ID | Tarea | Criterios que cubre | Cómo se prueba en la app | Archivos | Líneas estimadas | Estado |
|---|---|---|---|---|---|---|
| T01 | La ventana aparece con la app vacía, con la pregunta y las seis opciones; `Ahora no` y `Escape` la cierran; el tour ya no arranca solo | 1, 2, 3, 4, 10 | Borrar todo y recargar: aparece; cerrar con `Ahora no`; cargar algo y recargar: no aparece; ❓ sigue abriendo el tour. **Validar en el teléfono antes de seguir** | `main.js`, `arranque.js`, `appVacia.js`, `EmpezarModal.js`, `empezarOpciones.js`, `test/empezar-modal.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 190 | pendiente |
| T02 | Elegir una opción muestra los cuatro campos, la ayuda de Acreedor y `Guardar`; cambiar de opción no borra lo escrito | 5, 6 y escenario mobile | Elegir `Familia o conocidos`, escribir y cambiar a `Préstamo`; probar a 320 px con el teclado del teléfono abierto | `empezarOpciones.js`, `EmpezarForm.js`, `EmpezarModal.js`, `test/empezar-opciones.test.js`, `test/empezar-form.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 170 | pendiente |
| T03 | Guardar: errores por campo, egreso con un monto, mes del vencimiento, mensaje, foco en + y error al guardar | 7, 8, 11 y escenario de error | Guardar vacío y ver los errores; guardar de verdad y ver el mes, la fila, el total y el mensaje; guardar con fecha pasada | `EmpezarModal.js`, `EmpezarForm.js`, `empezarErrores.js`, `test/empezar-guardar.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 180 | pendiente |
| T04 | El egreso nuevo se usa como cualquier otro, la ventana vuelve al eliminar todo, y revisión a mano | 9 y escenario de vacío | Editar, pagar, refinanciar y eliminar lo cargado; eliminar todo y recargar; recorrer a 320 px, con teclado, lector y zoom al 200 % | `test/empezar-resto.test.js`, `test/iteraciones.suite.js`, `tareas.md` | 90 | pendiente |

Estados: pendiente · en curso · en PR · mergeada.
Solo una tarea puede estar **en curso**.

## Orden y dependencias

T01 → T02 → T03 → T04

T01 es la primera que cambia lo que ve la persona: se valida en el teléfono antes de seguir. T03 es la primera que
guarda. T04 incluye la revisión a mano: teclado, lector de pantalla, contraste, zoom al 200 % y ancho de 320 px.
