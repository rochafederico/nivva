# 001 — Plan técnico

Spec: `specs/001-lista-montos-egreso/spec.md`

## Enfoque

La lista de montos sale de `DebtForm` (609 líneas) a piezas chicas dentro de
`src/features/montos/`:

- una función pura que calcula el vencimiento de un duplicado;
- un constructor de fila (`<li>`) y otro para su menú "Más acciones";
- un Web Component `<monto-list>` que dibuja la lista, el estado vacío, la
  región `aria-live` y mueve el foco.

`DebtForm` sigue siendo dueño del array `montos` (como hoy): le pasa los
montos a `<monto-list>` y escucha sus eventos para editar, duplicar y
eliminar. Así `DebtForm` solo pierde líneas en cada tarea.

El menú usa el `Dropdown` de Bootstrap a través de
`src/shared/ui/bootstrap/` (mismo patrón que `AcreedoresList`), que ya trae
`Escape`, flechas y devolución del foco.

## Archivos

| Archivo | Nuevo o cambia | Responsabilidad | Líneas hoy |
|---|---|---|---|
| `src/features/montos/vencimientoDuplicado.js` | nuevo | `calcularVencimientoDuplicado(monto, montos)`: mismo día, mes siguiente al vencimiento más tardío, último día si no existe; fecha inválida → la misma | 0 |
| `src/features/montos/components/montoCard.js` | nuevo | `createMontoCard(monto, opciones)`: `<li>` con importe (`formatMoneda`), moneda, `Vence …` (`formatFecha`), estado, casilla "Pagado" y botón "Editar" | 0 |
| `src/features/montos/components/montoCardMenu.js` | nuevo | `createMontoCardMenu(monto, opciones)`: botón "Más acciones" + menú Duplicar / Eliminar con `createDropdown` | 0 |
| `src/features/montos/components/MontoList.js` | nuevo | `<monto-list>`: `<ul>` etiquetada, orden por vencimiento, estado vacío, región `aria-live`, `confirm()` al eliminar, foco tras eliminar; emite eventos | 0 |
| `src/features/deudas/components/DebtForm.js` | cambia | Reemplaza la tabla y su scroll por `<monto-list>`; escucha sus eventos. **Solo se achica** | 609 |
| `test/monto-duplicado.test.js` | nuevo | Tests de la función de vencimiento | 0 |
| `test/monto-card.test.js` | nuevo | Tests de fila y menú | 0 |
| `test/monto-list.test.js` | nuevo | Tests de `<monto-list>` y de la integración con `DebtForm` | 0 |
| `test/run-repo-tests.js` | cambia | Registra los tres archivos de test nuevos (+4 líneas cada uno) | 81 |
| `test/deudas.test.js` | cambia | Ajusta los tests que buscan `#montos-table-wrapper`. **Solo se achica** | 1412 |

`DebtForm.js` y `test/deudas.test.js` ya pasan de 100 líneas: ninguna tarea
los hace crecer. La extracción de la lista a `<monto-list>` es lo que
achica `DebtForm` (salen `renderMontosList`, el armado de la tabla y el
contenedor con `max-height`). Los tests nuevos van en archivos nuevos, no en
`deudas.test.js` ni `montos.test.js`.

## Datos

Sin cambios en entidades, modelos ni esquema de IndexedDB. `pagado` se
sigue guardando al guardar el egreso, como hoy.

## Eventos

Emitidos por `<monto-list>` con `bubbles: true`; los escucha `DebtForm`:

| Evento | `detail` | Qué hace `DebtForm` |
|---|---|---|
| `monto:edit` | `{ monto }` | `openInlineEdit(monto)` (sin cambios de comportamiento) |
| `monto:duplicate` | `{ monto }` | Agrega la copia con `calcularVencimientoDuplicado`, vuelve a dibujar y pide el anuncio |
| `monto:delete` | `{ monto, index }` | Se emite **después** de aceptar el `confirm()`. Saca el monto, vuelve a dibujar y pide foco y anuncio |

`<monto-list>` expone `montos` (setter que dibuja), `anunciar(texto)` y
`enfocarTrasEliminar(index)`. La casilla "Pagado" cambia `monto.pagado` del
objeto en memoria y actualiza el estado de la fila, igual que hoy.

## Riesgos

- **Tests existentes acoplados a la tabla** (`#montos-table-wrapper`,
  `#add-monto-btn-row` en `deudas.test.js`): se ajustan en la tarea que
  integra; `npm test` lo detecta.
- **Teclado del menú en happy-dom:** si el `Dropdown` real no responde a
  flechas en happy-dom, el test verifica atributos (`aria-haspopup`,
  `aria-expanded`), `Escape` y que se instancia con `createDropdown`
  (como `feedback.test.js` con un `Dropdown` simulado); las flechas se
  verifican además a mano.
- **El formulario inline sigue ocultando la lista** al agregar o editar:
  es comportamiento actual y queda para la iteración 002. `<monto-list>`
  respeta la clase `d-none` que hoy pone `DebtForm`.
- **Límite de 200 líneas en la integración:** borrar la tabla cuenta como
  líneas. Por eso la integración se parte en T05 (dibujo y edición) y T06
  (duplicar y eliminar).

## Principios de la constitución involucrados

- **3 Mobile primero:** filas sin tabla ni scroll interno; se revisa a 320 px.
- **4 WCAG 2.2 AA:** criterios de la spec; técnicas: ARIA11/H48 para la
  lista etiquetada, H44 para la casilla, ARIA22 para `aria-live`, G202 y
  el patrón de menú del APG para teclado.
- **5 Voz de Nivva:** textos de la tabla de la spec, en voseo.
- **6 Sin frameworks:** Web Component en light DOM; Bootstrap solo vía
  `src/shared/ui/bootstrap/`.
- **7 Por feature:** todo lo nuevo en `src/features/montos/`.
- **8 Archivos chicos:** archivos nuevos de 100 líneas o menos; `DebtForm`
  se achica.
- **9 Eventos:** `<monto-list>` → `DebtForm` por eventos personalizados.
- **11 Sin dependencias nuevas:** Bootstrap ya está.
- **12 Tests:** cada criterio tiene al menos un test (ver `tareas.md`).
