# 001 — Plan técnico

Spec: `specs/001-lista-montos-egreso/spec.md`

## Enfoque

La tabla de montos de `DebtForm` se reemplaza por una lista hecha con
componentes chicos y nuevos, que se construyen y prueban por separado y
se conectan al final:

- Funciones puras para la forma hablada y para duplicar un monto.
- Un botón de menú propio (`menu-button`) según el patrón *Menu Button*
  del W3C. El dropdown de Bootstrap no sirve: no da la vuelta en las
  puntas, no maneja `Inicio`/`Fin` y no expone `role="menu"`.
- La fila (`monto-row`) y la lista (`montos-list`), con las acciones de
  duplicar y eliminar en un módulo aparte.
- Por último, `DebtForm` usa `montos-list` y se borra la tabla vieja.

`DebtForm.js` (609 líneas) y `test/deudas.test.js` (1412) pasan de 100
líneas. No se hace una tarea de solo mover código, porque mover cuenta
como líneas borradas más agregadas y no entra en un PR. Las piezas nuevas
viven en archivos nuevos, y la única tarea que toca esos dos archivos
(T07) borra la tabla, `renderMontosList` y `duplicateMonto`, y el test
viejo de duplicar. Los dos quedan con menos líneas que antes.

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/features/montos/utils/montoHablado.js` | Nuevo (T01) | Monto y fecha en la forma hablada | — |
| `src/features/montos/utils/duplicarMonto.js` | Nuevo (T01) | Monto nuevo con el vencimiento del mes siguiente al último | — |
| `src/shared/components/MenuButton.js` | Nuevo (T02) | Botón de menú: abrir, cerrar, foco, un solo menú abierto | — |
| `src/shared/components/menuButtonTeclas.js` | Nuevo (T03) | Flechas, vuelta en las puntas, `Home` y `End` | — |
| `src/features/montos/components/MontoRow.js` | Nuevo (T04) | Fila de un monto | — |
| `src/features/montos/components/MontosList.js` | Nuevo (T05) | Lista, texto de orden, vacío, región de anuncios | — |
| `src/features/montos/components/montosListaAcciones.js` | Nuevo (T06) | Duplicar, eliminar, foco y anuncios | — |
| `src/features/deudas/components/DebtForm.js` | Cambia (T07) | Usa `montos-list`; se borra la tabla | 609 → ~510 |
| `test/deudas.test.js` | Cambia (T07) | Se borra UC13 (duplicar con el mismo vencimiento) | 1412 → ~1380 |
| `test/run-repo-tests.js` | Cambia (T01–T07) | Registra cada test nuevo (+2 líneas por tarea) | 81 → ~95 |
| `test/*.test.js` | Nuevos (uno por tarea) | Tests de cada tarea, de 100 líneas o menos | — |

Se reutilizan sin cambios `formatMoneda` (`src/shared/config/monedas.js`)
para la cifra visible y `formatFecha` (`src/shared/utils/fechas.js`) para
el vencimiento visible. `app-checkbox` no se toca: no tiene etiqueta
visible y se usa en otras pantallas; la fila usa un `<input
type="checkbox">` nativo con su `<label>`.

## Datos

Sin cambios de esquema ni migración. `duplicarMonto` devuelve un objeto
sin `id` y sin `periodo`, con `pagado: false`. `MontoModel` y
`MontoEntity` ya calculan el período desde el vencimiento cuando falta,
así que el duplicado queda en el mes de su nuevo vencimiento (criterio 6).

Vencimiento del duplicado: año y mes = mes siguiente al mayor vencimiento
de la lista; día = día del monto duplicado, limitado al último día de ese
mes (`new Date(año, mes + 1, 0).getDate()`), lo que cubre febrero y
años bisiestos (criterio 7). Se calcula con fechas `YYYY-MM-DD` como
texto, sin zona horaria.

## Eventos

| Evento | Lo emite | Lo escucha | Para qué |
|---|---|---|---|
| `menu:select` (`detail.value`) | `menu-button` | `monto-row` | Opción elegida en "Más acciones" |
| `monto:edit`, `monto:duplicate`, `monto:delete` | `monto-row` | `montos-list` | Acciones de la fila |
| `montos:edit` (`detail.monto`, `detail.idx`) | `montos-list` | `DebtForm` | Abrir la edición, como hoy con ✎ |
| `montos:duplicated` (`detail.monto`) | `montos-list` | `DebtForm` | Analítica `duplicate_installment` |
| `montos:empty` | `montos-list` | `DebtForm` | Pasar el foco a "Agregar monto" |

"Pagado" cambia `monto.pagado` en el mismo objeto, sin volver a dibujar
la lista, para que el foco siga en la casilla (criterio 4).

## Accesibilidad

| Criterio | Técnica | Test |
|---|---|---|
| 1.3.1 | `<ul role="list">` (Safari quita la semántica con `list-style: none`) con `aria-labelledby` al nombre "Montos" y `aria-describedby` al texto de orden ([ARIA16](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA16), [H48](https://www.w3.org/WAI/WCAG22/Techniques/html/H48)); forma hablada en `.visually-hidden` y lo visible con `aria-hidden="true"` ([C7](https://www.w3.org/WAI/WCAG22/Techniques/css/C7)); casilla con `<label>` ([H44](https://www.w3.org/WAI/WCAG22/Techniques/html/H44)) | Roles, nombres y textos ocultos en T04 y T05 |
| 1.4.3 y 1.4.11 | Colores de Bootstrap del tema (`text-body`, `text-body-secondary`, `border`) y foco por defecto | Revisión a mano en el PR de T07 |
| 1.4.10 | Fila con `d-flex flex-wrap`; sin anchos fijos; se borra el contenedor `overflow-auto` con `max-height` ([C32](https://www.w3.org/WAI/WCAG22/Techniques/css/C32)) | T05 verifica que no hay `overflow`/`max-height`; 320 px a mano en T07 |
| 2.1.1 | Botones y casilla nativos; menú con manejo de teclas ([patrón Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)) | Teclas en T02 y T03 |
| 2.4.3 | Foco con `focus()` explícito tras duplicar, eliminar y cancelar | T06 |
| 2.4.7 | `:focus-visible` de Bootstrap; opciones del menú enfocables con `tabindex="-1"` | T02 |
| 2.4.11 | `scroll-margin-block` en los controles de la fila ([C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43)) | Estilo en T04; a mano en T07 |
| 2.5.3 | Nombres que empiezan con el texto visible: `aria-label` "Editar monto 3, 15000 pesos", "Más acciones para el monto 3, 15000 pesos"; casilla con `<label>` "Pagado" + `.visually-hidden` ": monto 3, 15000 pesos" ([G208](https://www.w3.org/WAI/WCAG22/Techniques/general/G208)) | T04 |
| 2.5.8 | `btn-sm` de Bootstrap (≥ 31 px) y la etiqueta "Pagado" amplía el área de la casilla | Revisión a mano en T07 |
| 4.1.2 | Botón con `aria-haspopup="menu"`, `aria-expanded` y `aria-controls`; `role="menu"` y `role="menuitem"` ([ARIA4](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA4)) | T02 |
| 4.1.3 | Un `role="status"` dentro de `montos-list`, presente desde el render; el texto se escribe después ([ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22)) | T06 |

## Riesgos

- **Tests acoplados a la tabla:** `deudas.test.js` usa `#montos-table-wrapper`
  y `#form-error`. Se conserva `#montos-table-wrapper` como contenedor de la
  lista, porque el error de "al menos un monto" y ocultar la lista con un
  monto abierto son de la iteración 002.
- **Fechas y zona horaria:** el cálculo trabaja con texto `YYYY-MM-DD`;
  T01 prueba fin de mes, diciembre → enero y bisiesto.
- **Clic afuera y varios menús:** el cierre por clic afuera usa un
  listener en `document` que se quita al cerrar; T02 prueba que abrir un
  menú cierra el otro.
- **`confirm` en happy-dom:** se reemplaza `global.confirm` en los tests,
  como ya hace UC12.

## Principios de la constitución involucrados

- 3 Mobile primero: la fila se diseña para 320 px (escenario Mobile).
- 4 WCAG 2.2 AA: técnicas de la tabla de arriba.
- 5 Copy: textos tal cual la spec; "monto", nunca "cuota".
- 6 Sin frameworks: Web Components en light DOM y clases de Bootstrap.
- 8 Archivos chicos: todos los archivos nuevos de 100 líneas o menos;
  `DebtForm.js` y `deudas.test.js` bajan.
- 9 Eventos: la lista y el formulario se comunican con los eventos de
  arriba.
- 11 Sin dependencias nuevas.
- 12 Cada criterio tiene al menos un test (ver `tareas.md`).
