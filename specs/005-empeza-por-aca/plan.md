# 005 — Plan técnico

Spec: `specs/005-empeza-por-aca/spec.md` · Flujo: `flujo.md`

## Enfoque

Una feature nueva, `src/features/empezar/`, con la forma de `RefinanciarModal`: una ventana con `ui-modal` que se
crea a pedido, se agrega a `document.body` y avisa al terminar de cerrarse. El arranque que hoy vive en `main.js`
(avisos de pagos y tour) pasa a `src/arranque.js`: ahí se deja de llamar a `tour.start()` (criterio 3), se sigue
escuchando `tour:start` para el botón ❓, y se abre la ventana si `appVacia()` da verdadero (criterios 1 y 2).

Guardar usa `addDeuda`, que ya crea el egreso y su monto en una transacción (criterio 7). Por eso el egreso nuevo
es igual a cualquier otro y todo lo demás funciona sin tocarlo (criterio 9).

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/main.js` | Cambia (T01): extrae el arranque | Solo armar la página y las rutas | 128 → <95 |
| `src/arranque.js` | Nuevo (T01) | Avisos de pagos, botón ❓ y abrir la ventana | — |
| `src/features/empezar/appVacia.js` | Nuevo (T01) | Sin egresos (con y sin vencimiento) ni ingresos | — |
| `src/features/empezar/components/EmpezarModal.js` | Nuevo (T01, T03) | Ventana, `Ahora no`, guardar, mensaje y foco | — |
| `src/features/empezar/components/empezarOpciones.js` | Nuevo (T01, T02) | Pregunta, bajada y las seis opciones | — |
| `src/features/empezar/components/EmpezarForm.js` | Nuevo (T02) | Los cuatro campos y la ayuda de Acreedor | — |
| `src/features/empezar/components/empezarErrores.js` | Nuevo (T03) | Qué le falta a cada campo; usa `fechaValida` y `mostrarErrores` de gastos | — |
| `test/empezar-*.test.js`, `test/iteraciones.suite.js` | Nuevo y cambia | Tests de cada tarea, sumados a la suite de iteraciones | 13 |

## Datos

Sin cambios de esquema. Se guarda `{ acreedor, tipoDeuda, montos: [{ monto, moneda, vencimiento, periodo,
pagado: false }] }`, con `tipoDeuda` igual al texto de la opción y `periodo` igual a `vencimiento.slice(0, 7)`.
`app-form` solo admite opciones de texto: el select muestra `Pesos` y `Dólares`, y al guardar se pasa a `ARS` o
`USD`. "App vacía" lee `listDeudas`, `getAll` de gastos y `getAll` de ingresos.

## Eventos

| Evento | Emite | Escuchan | `detail` |
|---|---|---|---|
| `ui:month` | `setSelectedMonth(periodo)`, al cerrarse después de guardar | Selector de mes e Inicio (ya escuchan) | `{ mes }` |
| `deuda:saved` | `EmpezarModal`, al cerrarse después de guardar | Lista, total y resumen (ya escuchan) | `{ id }` |
| `app:notify` | `EmpezarModal`, al cerrarse después de guardar | `AppToast` | `{ message, type: 'success' }` |
| `tour:start` | Botón ❓ (sin cambios) | `arranque.js` | — |

## Accesibilidad

| Criterio | Técnica | Test |
|---|---|---|
| 1.3.1 | [H71](https://www.w3.org/WAI/WCAG22/Techniques/html/H71) `fieldset` y `legend` con la pregunta; [H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44) `label`; ayuda con `aria-describedby` | `empezar-opciones`, `empezar-form` |
| 1.4.3 y 1.4.11 | [G18](https://www.w3.org/WAI/WCAG22/Techniques/general/G18), [G207](https://www.w3.org/WAI/WCAG22/Techniques/general/G207); `btn-outline-primary` marca la elegida con relleno | A mano (T04) |
| 1.4.10 | [C31](https://www.w3.org/WAI/WCAG22/Techniques/css/C31) opciones en una columna a 320 px, dos desde 576 px | A mano, 320 px (T04) |
| 2.1.1 | [H91](https://www.w3.org/WAI/WCAG22/Techniques/html/H91) radios nativos con flechas; `Escape` de Bootstrap | `empezar-opciones`, `empezar-modal` |
| 2.4.3 | [G59](https://www.w3.org/WAI/WCAG22/Techniques/general/G59) foco al `legend` con `tabindex="-1"` al abrir, a Acreedor al elegir, al primer error y a `add-fab` al cerrar | `empezar-modal`, `empezar-guardar` |
| 2.4.7 y 2.4.11 | [C15](https://www.w3.org/WAI/WCAG22/Techniques/css/C15); `scroll-margin` con el teclado abierto | A mano (T04) |
| 2.5.8 | [C42](https://www.w3.org/WAI/WCAG22/Techniques/css/C42) opciones a todo el ancho | A mano, teléfono (T04) |
| 3.3.1 y 3.3.3 | [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21) `aria-invalid` y `aria-describedby`; [G85](https://www.w3.org/WAI/WCAG22/Techniques/general/G85) | `empezar-guardar` |
| 4.1.2 | Radios nativos: el lector dice cuál está elegida, sin ARIA extra | `empezar-opciones` |
| 4.1.3 | [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22) región de `AppToast` presente antes del mensaje | `empezar-guardar` |

## Riesgos

- Tour y ventana a la vez: `arranque.js` ya no inicia el tour, y el ❓ cierra la ventana si estuviera abierta,
  porque Bootstrap no admite dos modales. Lo cubre `empezar-modal`.
- `Enter` dos veces al guardar: se bloquea hasta cerrar, como en #305.
- La ventana se abre después de dibujar Inicio, así `add-fab` existe para devolver el foco.
- `stepMismatch` de happy-dom en Monto: los tests emiten `form:submit` (sdd/23).
- La 006 (#334) cambia la fila del mes. Si se mergea antes, el wireframe de Inicio se actualiza en un ajuste.

## Principios de la constitución involucrados

1 (todo queda en IndexedDB), 2 (una pregunta, tres datos), 3 y 4 (320 px y AA), 5 (textos de la spec; `Ahora no`
como excepción pedida), 7 (`features/empezar`), 8 (`main.js` baja de 128 líneas), 9 (eventos), 10, 12.
