---
id: 001-lista-montos-egreso
estado: aprobada   # borrador | aprobada | implementada | baseline
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

## Alcance

- Incluye:
  - Reemplazar la tabla de montos de `debt-form` por una lista de filas
    tipo tarjeta, en "Agregar egreso" y en "Editar egreso".
  - Importe y vencimiento con formato, estado Pagado/Pendiente visible.
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

Cada uno se puede probar con un test.

1. **Dado** un egreso con montos cargados, **cuando** se abre el modal,
   **entonces** los montos se muestran como una lista (`<ul>` con un `<li>`
   por monto) etiquetada "Montos", ordenada por vencimiento ascendente, y
   no hay ninguna `<table>` de montos.
2. **Dado** un monto de `15000` `ARS` que vence `2026-11-10`, **cuando** se
   muestra su fila, **entonces** el importe se ve como `$ 15.000,00`
   (mismo formato que `formatMoneda`) junto a la moneda `ARS`, y el
   vencimiento como `Vence 10/11/2026` (mismo formato que `formatFecha`).
3. **Dado** un monto, **cuando** se muestra su fila, **entonces** tiene un
   estado visible "Pagado" o "Pendiente" según `pagado`, y una casilla con
   la etiqueta visible "Pagado" que al cambiarla actualiza el estado
   mostrado y el valor `pagado` del monto en el formulario (se persiste al
   guardar el egreso, como hoy).
4. **Dado** un monto, **cuando** se muestra su fila, **entonces** tiene un
   botón con el texto visible "Editar" que abre el formulario de edición de
   ese monto (mismo comportamiento que el ✎ actual).
5. **Dado** un monto, **cuando** se activa su botón "Más acciones",
   **entonces** se abre un menú con las opciones "Duplicar" y "Eliminar";
   `Escape` lo cierra y devuelve el foco al botón; las flechas arriba y
   abajo recorren las opciones.
6. **Dado** un egreso cuyo monto con vencimiento más tardío vence en
   diciembre de 2026, **cuando** se duplica un monto que vence el día 10,
   **entonces** se agrega un monto con el mismo importe y moneda, `pagado`
   en falso y vencimiento `2027-01-10` (mismo día del monto duplicado, en
   el mes siguiente al vencimiento más tardío de la lista).
7. **Dado** que se duplica un monto que vence el día 31 y el mes destino
   tiene menos días, **cuando** se calcula el vencimiento, **entonces** se
   usa el último día de ese mes (por ejemplo, `2027-02-28`).
8. **Dado** un monto, **cuando** se elige "Eliminar" en su menú,
   **entonces** se pide confirmación con `confirm()` y el texto
   `¿Eliminar el monto de $ 15.000,00 que vence el 10/11/2026?`; si se
   acepta, el monto sale de la lista; si se cancela, no cambia nada.
9. **Dado** que se eliminó un monto, **cuando** la lista se actualiza,
   **entonces** el foco pasa al botón "Editar" del monto siguiente; si no
   hay siguiente, al del anterior; si la lista quedó vacía, al botón
   "Agregar monto".
10. **Dado** que se duplicó o eliminó un monto, **cuando** la lista se
    actualiza, **entonces** una región `aria-live="polite"` anuncia
    `Monto duplicado. Vence el 10/01/2027.` o `Monto eliminado.`.
11. **Dado** un egreso sin montos, **cuando** se muestra la sección,
    **entonces** se ve el texto `Todavía no agregaste montos.` en lugar de
    la lista, y el botón "Agregar monto" sigue disponible.
12. **Dado** cualquier cantidad de montos, **cuando** se muestra la lista,
    **entonces** no tiene altura máxima ni scroll propio: crece dentro del
    cuerpo del modal.

## Escenarios

- Error: si un monto no tiene vencimiento válido, la fila muestra el valor
  tal cual (comportamiento actual de `formatFecha`) y Duplicar usa la misma
  fecha que el original.
- Vacío: criterio 11.
- Mobile: a 320 px de ancho cada fila se lee completa (importe, vencimiento,
  estado y acciones) sin scroll horizontal; las acciones pueden pasar a una
  segunda línea dentro de la fila.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Cómo se cumple | Cómo se verifica |
|---|---|---|
| 1.3.1 Info y relaciones | Lista `<ul>`/`<li>` con nombre "Montos"; la casilla "Pagado" con `<label>` asociado | test |
| 1.4.10 Reflow | Sin tabla ni scroll interno; filas que se acomodan a 320 px | manual |
| 1.4.11 Contraste no textual | Borde de la fila, casilla y foco a 3:1 | manual |
| 2.1.1 Teclado | Editar, Más acciones, menú y casilla operables con teclado; `Escape` cierra el menú | test · manual |
| 2.4.3 Orden del foco | Foco tras eliminar según criterio 9; tras cerrar el menú vuelve al botón | test |
| 2.5.3 Etiqueta en el nombre | Nombres accesibles que empiezan con el texto visible: "Editar monto del 10/11/2026", "Más acciones para el monto del 10/11/2026" | test |
| 2.5.8 Tamaño del objetivo | Botones y casilla de al menos 24×24 px | manual |
| 4.1.2 Nombre, función, valor | Botón del menú con `aria-haspopup` y `aria-expanded`; opciones con rol de ítem de menú | test |
| 4.1.3 Mensajes de estado | Anuncios del criterio 10 en región `aria-live="polite"` | test |

## Textos de UI

| Lugar | Texto |
|---|---|
| Nombre de la lista | `Montos` |
| Vencimiento en la fila | `Vence 10/11/2026` |
| Estado | `Pagado` · `Pendiente` |
| Casilla | `Pagado` |
| Botón de la fila | `Editar` |
| Botón del menú | `Más acciones` |
| Opciones del menú | `Duplicar` · `Eliminar` |
| Confirmación al eliminar | `¿Eliminar el monto de $ 15.000,00 que vence el 10/11/2026?` |
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
