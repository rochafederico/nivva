---
id: 001-lista-montos-egreso
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "—"
---

# 001 — Ver y manejar los montos de un egreso de un vistazo

## Historia

Como **persona que carga un egreso con varios montos**, quiero **ver cada
monto como una fila clara con su importe, vencimiento y estado, y acciones
con nombre**, para **entender qué cargué y corregirlo sin adivinar qué hace
cada ícono**.

## Contexto

Hoy, dentro del modal "Agregar egreso" / "Editar egreso", los montos se ven
en una tabla de cuatro columnas con valores sin formato (`15000`, `ARS`,
`2026-11-10`) y cuatro acciones con íconos sueltos (✎ × ⧉ y un checkbox sin
etiqueta). En mobile la tabla queda apretada y tiene su propio scroll dentro
del scroll del modal. Esta iteración cambia solo la **lista de montos**; el
flujo de agregar y editar un monto queda para la iteración 002.

Además cambia un comportamiento: hoy Duplicar copia la misma fecha de
vencimiento; con esta spec el monto nuevo vence en el mes siguiente al
último monto de la lista (criterios 6 y 7).

## Alcance

- Incluye:
  - Reemplazar la tabla de montos de `debt-form` por una lista de filas
    tipo tarjeta, en "Agregar egreso" y en "Editar egreso".
  - Importe y vencimiento con formato, y casilla "Pagado" visible.
  - Acción "Editar" visible y menú "Más acciones" con Duplicar y Eliminar.
  - Duplicar con vencimiento en el mes siguiente al último monto.
  - Estado vacío con texto.
  - Quitar el scroll interno de la lista.
  - Actualizar los tests existentes que dependen de la tabla.
- No incluye (iteración 002):
  - El formulario de agregar/editar un monto (sigue abriéndose y ocultando
    la lista como hoy).
  - Qué pasa al tocar "Guardar" del modal con un monto abierto.
  - Botones del pie del modal y el mensaje "Debe agregar al menos un monto".
  - Cambiar el `confirm()` de "¿Cancelar los cambios actuales?".
- No incluye (nunca en esta spec): el modal de detalle del egreso
  (`DebtDetailModal`) ni las listas del resumen del mes.

## Criterios de aceptación

Cada uno se puede probar con un test. "Monto N" es la posición del monto
en la lista ordenada, empezando en 1.

1. **Dado** un egreso con montos cargados, **cuando** se abre el modal,
   **entonces** los montos se muestran como una lista (`<ul>` con un `<li>`
   por monto) etiquetada "Montos", ordenada por vencimiento ascendente, y
   no hay ninguna `<table>` de montos.
2. **Dado** un monto, **cuando** se muestra su fila, **entonces** el
   importe se ve con `formatMoneda` usando la moneda del monto, sin el
   código de moneda aparte (`15000` `ARS` → `$ 15.000,00`; `15000` `USD` →
   `US$ 15.000,00`), y el vencimiento como `Vence 10/11/2026` (mismo
   formato que `formatFecha`). El importe visible tiene
   `aria-hidden="true"` y al lado hay un texto oculto visualmente
   (`visually-hidden`) con la forma hablada: `15.000,00 pesos` (ARS) o
   `15.000,00 dólares` (USD).
3. **Dado** un monto, **cuando** se muestra su fila, **entonces** tiene una
   casilla con la etiqueta visible "Pagado", marcada según `pagado`, que es
   el único indicador del estado (no hay otro texto "Pagado" o
   "Pendiente"). Al cambiarla se actualiza el valor `pagado` del monto en
   el formulario (se persiste al guardar el egreso, como hoy) y el foco
   sigue en la casilla.
4. **Dado** un monto, **cuando** se muestra su fila, **entonces** tiene un
   botón con el texto visible "Editar" que abre el formulario de edición de
   ese monto (mismo comportamiento que el ✎ actual).
5. **Dado** un monto, **cuando** se usa su botón "Más acciones",
   **entonces** el menú con las opciones "Duplicar" y "Eliminar" se
   comporta así:
   - `Enter`, `Espacio`, flecha abajo o clic lo abren con el foco en
     "Duplicar"; flecha arriba lo abre con el foco en "Eliminar".
   - Con el menú abierto, las flechas arriba y abajo recorren las opciones
     y al llegar a un extremo vuelven al otro; `Inicio` y `Fin` van a la
     primera y a la última.
   - `Escape` cierra solo el menú, devuelve el foco al botón "Más
     acciones" y el modal sigue abierto.
   - `Tab` cierra el menú y el foco sigue su orden normal; un clic afuera
     lo cierra sin mover el foco.
   - Solo puede haber un menú abierto a la vez.
6. **Dado** un egreso cuyo monto con vencimiento más tardío vence en
   diciembre de 2026, **cuando** se duplica un monto que vence el día 10,
   **entonces** se agrega un monto con el mismo importe y moneda, `pagado`
   en falso y vencimiento `2027-01-10` (mismo día del monto duplicado, en
   el mes siguiente al vencimiento más tardío de la lista). Para buscar el
   más tardío se ignoran los montos sin vencimiento válido.
7. **Dado** que se duplica un monto que vence el día 31 y el mes destino
   tiene menos días, **cuando** se calcula el vencimiento, **entonces** se
   usa el último día de ese mes (por ejemplo, `2027-02-28`).
8. **Dado** un monto sin vencimiento válido (no tiene formato
   `YYYY-MM-DD`), **cuando** se elige "Duplicar", **entonces** se muestra
   `alert()` con el texto `No se puede duplicar un monto sin un vencimiento
   válido. Editalo y probá de nuevo.`, no se agrega ningún monto y el foco
   vuelve al botón "Más acciones".
9. **Dado** que se duplicó un monto, **cuando** la lista se actualiza,
   **entonces** el foco pasa al botón "Editar" del monto nuevo.
10. **Dado** un monto, **cuando** se elige "Eliminar" en su menú,
    **entonces** se pide confirmación con `confirm()` y el texto
    `¿Eliminar el monto de 15.000,00 pesos que vence el 10/11/2026?`
    (importe en forma hablada, criterio 2); si se acepta, el monto sale
    de la lista; si se cancela, no cambia nada y el foco vuelve al botón
    "Más acciones".
11. **Dado** que se eliminó un monto, **cuando** la lista se actualiza,
    **entonces** el foco pasa al botón "Editar" del monto siguiente; si no
    hay siguiente, al del anterior; si la lista quedó vacía, al botón
    "Agregar monto".
12. **Dado** que se duplicó o eliminó un monto, **cuando** la lista se
    actualiza, **entonces** una región `aria-live="polite"` anuncia
    `Monto duplicado. Vence el 10/01/2027.` o `Monto eliminado.`.
13. **Dado** un egreso sin montos, **cuando** se muestra la sección,
    **entonces** se ve el texto `Todavía no agregaste montos.` en lugar de
    la lista, y el botón "Agregar monto" sigue disponible.
14. **Dado** cualquier cantidad de montos, **cuando** se muestra la lista,
    **entonces** no tiene altura máxima ni scroll propio: crece dentro del
    cuerpo del modal.
15. **Dado** el monto 3 de la lista, de `15000` `ARS`, **cuando** se leen
    los nombres accesibles de su fila, **entonces** son `Editar monto 3 de
    15.000,00 pesos`, `Más acciones para el monto 3 de 15.000,00 pesos` y
    `Pagado: monto 3 de 15.000,00 pesos` (importe en forma hablada; nunca
    con `$` ni `US$`, porque los lectores de pantalla en español leen `$`
    como "dólares").

## Escenarios

- Error: si un monto no tiene vencimiento válido, la fila muestra el valor
  tal cual (comportamiento actual de `formatFecha`) y no se puede duplicar
  (criterio 8).
- Vacío: criterio 13.
- Mobile: a 320 px de ancho cada fila se lee completa (importe, vencimiento,
  casilla y acciones) sin scroll horizontal; las acciones pueden pasar a
  una segunda línea dentro de la fila.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Cómo se cumple | Cómo se verifica |
|---|---|---|
| 1.3.1 Info y relaciones | Lista `<ul>`/`<li>` con nombre "Montos"; la casilla "Pagado" con `<label>` asociado; la moneda se anuncia por su nombre (criterio 2) | test |
| 1.4.3 Contraste mínimo | Importe, vencimiento y textos de la fila a 4.5:1 | manual |
| 1.4.10 Reflow | Sin tabla ni scroll interno; filas que se acomodan a 320 px | manual |
| 1.4.11 Contraste no textual | Borde de la fila, casilla y foco a 3:1 | manual |
| 2.1.1 Teclado | Editar, Más acciones, menú y casilla operables con teclado (criterio 5) | test · manual |
| 2.4.3 Orden del foco | Foco según criterios 5, 8, 9, 10 y 11 | test |
| 2.4.7 Foco visible | El foco se ve en botones, opciones del menú y casilla | manual |
| 2.5.3 Etiqueta en el nombre | Nombres accesibles que empiezan con el texto visible (criterio 15) | test |
| 2.5.8 Tamaño del objetivo | Botones y casilla de al menos 24×24 px | manual |
| 4.1.2 Nombre, función, valor | Botón del menú con `aria-haspopup` y `aria-expanded`; menú con `role="menu"` y opciones con `role="menuitem"` | test |
| 4.1.3 Mensajes de estado | Anuncios del criterio 12 en región `aria-live="polite"` | test |

## Textos de UI

| Lugar | Texto |
|---|---|
| Nombre de la lista | `Montos` |
| Importe visible | `$ 15.000,00` · `US$ 15.000,00` |
| Importe hablado (oculto, nombres accesibles y confirmación) | `15.000,00 pesos` · `15.000,00 dólares` |
| Vencimiento en la fila | `Vence 10/11/2026` |
| Casilla | `Pagado` |
| Botón de la fila | `Editar` |
| Botón del menú | `Más acciones` |
| Opciones del menú | `Duplicar` · `Eliminar` |
| Nombres accesibles | `Editar monto 3 de 15.000,00 pesos` · `Más acciones para el monto 3 de 15.000,00 pesos` · `Pagado: monto 3 de 15.000,00 pesos` |
| Error al duplicar | `No se puede duplicar un monto sin un vencimiento válido. Editalo y probá de nuevo.` |
| Confirmación al eliminar | `¿Eliminar el monto de 15.000,00 pesos que vence el 10/11/2026?` |
| Anuncio al duplicar | `Monto duplicado. Vence el 10/01/2027.` |
| Anuncio al eliminar | `Monto eliminado.` |
| Estado vacío | `Todavía no agregaste montos.` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

## Definition of Ready

- [x] Los criterios se pueden testear sin interpretar
- [x] El alcance entra en una iteración (8 tareas o menos)
- [x] No hay preguntas abiertas
- [x] Textos revisados contra voz y tono y glosario
- [x] Criterios de accesibilidad identificados
- [x] Se leyó `docs/sdd/learnings.md`
