# Bootstrap 5.3 — componentes y patrones de interacción

La UI de Nivva es 100 % Bootstrap 5.3. Este documento dice qué componente
resuelve cada necesidad de la persona, qué trae resuelto y qué tiene que
agregar Nivva. Se usa al escribir `flujo.md`: cada paso del recorrido
elige un componente de acá. Si una necesidad no está, se justifica en
`flujo.md` antes de inventar un componente propio.

Doc oficial: <https://getbootstrap.com/docs/5.3/>. Para agentes: abrí solo
la página del componente que vas a usar, no toda la doc.

## Lo que Bootstrap no resuelve

- **No garantiza accesibilidad.** Los componentes con JavaScript traen
  teclado y parte del ARIA; el resto (nombres, roles, anuncios) lo pone
  Nivva. Ver `docs/sdd/accesibilidad.md`.
- **Algunos colores de su paleta no llegan a AA** (4.5:1 en texto, 3:1 en
  controles). Se revisa el contraste de cada variante que se use.
- **Respeta `prefers-reduced-motion`**: no hace falta manejarlo aparte.
- Los componentes con JavaScript se usan a través de
  `src/shared/ui/bootstrap/`. Hoy están encapsulados dropdown, modal,
  popover y toast. Si una spec necesita otro (collapse, offcanvas, tab),
  el plan suma su encapsulado como tarea.

## Por necesidad de la persona

| Necesidad | Componente | Qué trae Bootstrap | Qué agrega Nivva |
|---|---|---|---|
| Completar o editar algo sin salir de la pantalla | [Modal](https://getbootstrap.com/docs/5.3/components/modal/), `modal-fullscreen-sm-down` en mobile | Foco atrapado adentro, `Escape` cierra, `role="dialog"` | Título como nombre del diálogo; `backdrop: 'static'` si hay datos sin guardar |
| Confirmar algo que no se deshace | `confirm()` del navegador, o un modal si no hay otro abierto | Lo que da el navegador | Texto con qué se borra (monto y fecha); foco de vuelta al control |
| Panel que sube desde abajo | [Offcanvas](https://getbootstrap.com/docs/5.3/components/offcanvas/) `offcanvas-bottom` | Foco atrapado, `Escape`, `role="dialog"` | Título como nombre; **no está encapsulado** |
| Acciones de un elemento (editar, duplicar, borrar) | [Dropdown](https://getbootstrap.com/docs/5.3/components/dropdowns/), `dropdown-menu-end` | Abre con clic; flechas arriba y abajo; `Escape` y `Tab` cierran | Nombre del botón si es solo ícono. **No** vuelve al principio en las puntas, **no** maneja `Inicio`/`Fin` y **no** pone `role="menu"`: la spec no lo pide salvo que lo justifique |
| Activar o desactivar algo | [Interruptor](https://getbootstrap.com/docs/5.3/forms/checks-radios/#switches) `form-switch` | Aspecto y etiqueta | `role="switch"` y etiqueta visible |
| Elegir entre pocas opciones | Radios, `btn-check` o [select](https://getbootstrap.com/docs/5.3/forms/select/) | Controles nativos | Etiqueta del grupo; `btn-check` se anuncia como casilla o radio, no como botón |
| Escribir un dato | [Campo](https://getbootstrap.com/docs/5.3/forms/form-control/), [input group](https://getbootstrap.com/docs/5.3/forms/input-group/) para `$` | Estilo | `<label>` fuera del input group |
| Saber qué campo está mal | [Validación](https://getbootstrap.com/docs/5.3/forms/validation/) `was-validated`, `is-invalid` | Solo el color y el texto | **Los estilos de error no llegan al lector**: Nivva marca el campo inválido y lo asocia a su mensaje (3.3.1) |
| Enterarse de que algo pasó | [Toast](https://getbootstrap.com/docs/5.3/components/toasts/) | Se cierra solo a los 5 s | Región de anuncios **presente antes** del toast; `status` o `alert` según importancia; sin botones si se cierra solo |
| Aviso que queda en la pantalla | [Alert](https://getbootstrap.com/docs/5.3/components/alerts/) | Estilo y botón de cerrar | `role="alert"` solo si es urgente; ícono más texto, no solo color |
| Ver una lista de elementos | [List group](https://getbootstrap.com/docs/5.3/components/list-group/) | Estilo; `list-group-item-action` para filas que se tocan | Lista con nombre; no anidar controles dentro de una fila clickeable |
| Comparar datos en filas y columnas | [Tabla](https://getbootstrap.com/docs/5.3/content/tables/) | Estilo | Si las columnas hacen falta para entender los datos, la tabla con `table-responsive` cumple 1.4.10 (está exceptuada). Si cada fila se entiende sola, en mobile va mejor un list group sin scroll horizontal |
| Mostrar u ocultar un detalle | [Collapse](https://getbootstrap.com/docs/5.3/components/collapse/) o [accordion](https://getbootstrap.com/docs/5.3/components/accordion/) | Abre y cierra | Estado abierto o cerrado y a qué controla; **no está encapsulado** |
| Cambiar de vista en la misma pantalla | [Tabs](https://getbootstrap.com/docs/5.3/components/navs-tabs/) | Teclado completo: flechas, `Inicio`, `Fin` y vuelta en las puntas | Roles de pestañas solo si cambian contenido, no para navegar entre páginas; **no está encapsulado** |
| Ayuda opcional sobre un control | [Popover](https://getbootstrap.com/docs/5.3/components/popovers/) | Abre con clic | Solo en elementos que reciben foco; lo esencial va como texto visible, no en el popover |
| Esperar una carga | [Spinner](https://getbootstrap.com/docs/5.3/components/spinners/) o [placeholders](https://getbootstrap.com/docs/5.3/components/placeholders/) | Estilo | Spinner con `role="status"` y texto oculto; placeholders ocultos al lector |
| Ver cuánto falta | [Progress](https://getbootstrap.com/docs/5.3/components/progress/) | Estilo | `role="progressbar"`, valor y nombre |
| Marcar un estado o cantidad | [Badge](https://getbootstrap.com/docs/5.3/components/badge/) | Estilo | Contexto con texto oculto si el número solo no se entiende |

## Solo estilo

[Botones](https://getbootstrap.com/docs/5.3/components/buttons/) (con
`disabled`, o `aria-disabled` si es un link),
[grupo de botones](https://getbootstrap.com/docs/5.3/components/button-group/)
(con `role="group"` y nombre),
[card](https://getbootstrap.com/docs/5.3/components/card/),
[botón de cerrar](https://getbootstrap.com/docs/5.3/components/close-button/)
(con nombre), utilidades de espaciado y flex, y
[`visually-hidden`](https://getbootstrap.com/docs/5.3/helpers/visually-hidden/)
para texto que solo escucha el lector.

## Qué no se usa en Nivva

- **Modales anidados:** Bootstrap no los soporta. Un modal abierto por vez.
- **Carrusel y scrollspy:** no ayudan a saber cuánto debo ni qué vence.
- **Tooltips con información esencial:** no se ven en mobile ni sin foco.
- **Dropdowns dentro de tabs:** Bootstrap no los soporta.
- **Floating labels:** necesitan un placeholder oculto y no suman a la
  claridad de los formularios cortos de Nivva.
