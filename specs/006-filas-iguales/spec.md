---
id: 006-filas-iguales
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#333"
---

# 006 — Que todas las filas del mes se lean igual

## Historia

Como **persona que revisa su mes**, quiero **que ingresos, montos con
vencimiento y gastos tengan la misma forma en la lista** para **comparar
cifras de un vistazo y saber siempre dónde tocar**.

## Contexto

Hoy cada fila termina distinto: los ingresos no tienen nada a la derecha,
los montos con vencimiento tienen un interruptor de pagado y los gastos un
botón ⋮. Por eso los montos quedan corridos y no se alinean, y la fecha se
escribe de dos formas (`01 nov` y `Gasto · 01/11/2026`).

## Alcance

- Incluye: la fila de ingreso, la de monto de un gasto con vencimiento y la
  de gasto en "Todo", "Ingresos" y "Egresos"; pasar "marcar como pagado" al
  botón ⋮; editar y eliminar un ingreso desde su botón ⋮.
- No incluye: la lista "Montos" dentro de la ventana de un egreso (spec
  001), que conserva su interruptor; Acreedores; el detalle de un egreso;
  cambiar cómo se agrega un ingreso.
- Reemplaza el formato de fila del criterio 7 de la spec 003
  (`Gasto · 03/11/2026` pasa a `Gasto · 03 nov`).

## Forma hablada

Monto y fecha se leen como define la spec 001 (`5000 pesos`,
`1 de noviembre de 2026`).

## Criterios de aceptación

### La fila

1. **Dado** el mes elegido, **cuando** se ve cualquier fila de "Todo",
   "Ingresos" o "Egresos", **entonces** tiene siempre la misma forma: a la
   izquierda el título y debajo `tipo · fecha`; a la derecha el monto, debajo
   el estado si corresponde, y al final un botón ⋮.
2. **Dado** una fila, **cuando** se ve debajo del título, **entonces** dice
   `Ingreso · 01 nov` en un ingreso, `Vence · 01 nov` en un monto de un gasto
   con vencimiento y `Gasto · 01 nov` en un gasto. La fecha siempre es día
   con dos cifras y mes abreviado.
3. **Dado** varias filas seguidas, **cuando** se miran los montos, **entonces**
   todos terminan en la misma línea vertical, sin importar el tipo de fila, y
   todos los botones ⋮ quedan uno debajo del otro.
4. **Dado** un ingreso, **cuando** se ve su monto, **entonces** está en verde y
   con signo, como hoy: `+ $ 2.794.589,26`. El tipo se entiende por el texto
   `Ingreso`, no solo por el color.
5. **Dado** un monto de un gasto con vencimiento, **cuando** se ve su fila,
   **entonces** debajo del monto dice su estado: `Pagado`, `Pendiente`,
   `Vence hoy` o `Vencido`, siempre con texto además del color.
6. **Dado** un ingreso o un gasto, **cuando** se ve su fila, **entonces** no
   muestra estado debajo del monto.
7. **Dado** un monto de un gasto con vencimiento, **cuando** se ve su fila,
   **entonces** ya no tiene interruptor de pagado.
8. **Dado** una fila de monto de un gasto con vencimiento, **cuando** se toca
   en cualquier lugar que no sea el botón ⋮, **entonces** se abre el detalle
   del egreso, como hoy.

### El botón ⋮ de un monto con vencimiento

9. **Dado** un monto pendiente, **cuando** se abre su ⋮, **entonces** ofrece
   `Marcar como pagado` y `Ver detalle`. Si está pagado, ofrece
   `Marcar como pendiente` y `Ver detalle`. Funciona con teclado y mouse como
   el menú del criterio 8 de la spec 001.
10. **Dado** un monto pendiente, **cuando** se elige `Marcar como pagado`,
    **entonces** su estado pasa a `Pagado`, los totales del mes y la Deuda
    total acumulada se actualizan sin recargar, el foco vuelve a su botón ⋮
    y se anuncia, sin mover el foco, `✅ Monto marcado como pagado.`
11. **Dado** un monto pagado, **cuando** se elige `Marcar como pendiente`,
    **entonces** su estado vuelve a `Pendiente`, `Vence hoy` o `Vencido` según
    su vencimiento, los totales se actualizan, el foco vuelve a su botón ⋮ y
    se anuncia `⚠️ Monto marcado como pendiente.`
12. **Dado** que la lista muestra solo montos pendientes, **cuando** se marca
    uno como pagado y sale de la lista, **entonces** el foco pasa al botón ⋮ de
    la fila siguiente; si no hay, al de la anterior; si no hay ninguna, al
    botón +.
13. **Dado** que no se pudo guardar el cambio, **cuando** falla, **entonces** el
    estado vuelve a como estaba, el foco queda en el botón ⋮ y se anuncia
    `❌ No pudimos actualizar el estado de pago. Intentá de nuevo.`
14. **Dado** un monto, **cuando** se elige `Ver detalle`, **entonces** se abre el
    detalle del egreso, igual que al tocar la fila. Al cerrarlo, el foco
    vuelve a su botón ⋮.

### El botón ⋮ de un ingreso

15. **Dado** un ingreso, **cuando** se abre su ⋮, **entonces** ofrece `Editar` y
    `Eliminar`, con el mismo funcionamiento de teclado y mouse.
16. **Dado** un ingreso, **cuando** se elige `Editar`, **entonces** se abre
    "Editar ingreso" con su descripción, monto, moneda y fecha cargados, el
    foco en Descripción y los botones `Guardar cambios` y `Cancelar`.
17. **Dado** "Editar ingreso" con cambios válidos, **cuando** se toca
    `Guardar cambios` o se presiona `Enter`, **entonces** se guarda, la ventana
    se cierra, la fila y los totales se actualizan sin recargar, el foco va a
    su botón ⋮ y se anuncia `Ingreso actualizado.` Si la fecha pasó a otro
    mes, el mes elegido no cambia, el foco va al botón + y se anuncia
    `Ingreso actualizado en octubre de 2026.`
18. **Dado** "Editar ingreso", **cuando** un campo queda vacío o inválido y se
    intenta guardar, **entonces** no se guarda, cada campo dice qué le falta
    con los mismos textos que al agregar, el foco va al primero con error y
    lo escrito se conserva.
19. **Dado** "Editar ingreso", **cuando** se toca `Cancelar` o se presiona
    `Escape`, **entonces** se cierra sin guardar y el foco vuelve a su botón ⋮.
20. **Dado** un ingreso, **cuando** se elige `Eliminar`, **entonces** aparece la
    confirmación propia del navegador:
    `¿Eliminar el ingreso "Sueldo octubre" de 752500 pesos del 1 de noviembre de 2026?`
    Si se cancela, no cambia nada y el foco vuelve a su botón ⋮.
21. **Dado** que se aceptó eliminar, **cuando** la lista se actualiza,
    **entonces** los totales se actualizan sin recargar, el foco pasa al botón
    ⋮ de la fila siguiente; si no hay, al de la anterior; si no hay ninguna,
    al botón +. Se anuncia `Ingreso eliminado.`

### Lector de pantalla

22. **Dado** el lector de pantalla, **cuando** recorre cualquier fila,
    **entonces** dice, en este orden, el título, el tipo, la fecha y el monto
    en la forma hablada y, en un monto con vencimiento, su estado.
23. **Dado** el lector de pantalla, **cuando** llega a un botón ⋮, **entonces**
    se llama `Acciones del ingreso Sueldo octubre, 752500 pesos`,
    `Acciones del monto de Laura, 437532 pesos` o
    `Acciones del gasto Café, 26300 pesos`, según la fila.

## Escenarios

- Error al editar un ingreso: la ventana sigue abierta con lo escrito y dice
  `No pudimos guardar el ingreso. Intentá de nuevo.`
- Error al eliminar un ingreso: la fila sigue y se anuncia
  `No pudimos eliminar el ingreso. Intentá de nuevo.`
- Vacío: los mensajes de "Todo", "Ingresos" y "Egresos" sin nada en el mes no
  cambian.
- Mobile: a 320 px ninguna fila genera scroll horizontal; un título largo se
  corta en lo visible y el lector lo lee completo; el monto nunca se parte en
  dos renglones.
- Ancho de PC: la fila mantiene la misma forma; los montos y los botones ⋮
  siguen alineados.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Saber de qué tipo es cada fila y su estado (criterios 2, 5 y 22) | Recorrer con lector de pantalla |
| 1.4.1 Uso del color | Distinguir ingreso, gasto y estado sin ver colores (criterios 2, 4 y 5) | Mirar la lista en escala de grises |
| 1.4.3 y 1.4.11 Contraste | Leer montos y estados y distinguir el botón ⋮ y el foco | Revisar el contraste a mano, en claro y oscuro |
| 1.4.10 Reflow | Usar la lista a 320 px sin scroll horizontal | Achicar la ventana a 320 px |
| 2.1.1 Teclado | Marcar pagado, ver detalle, editar y eliminar un ingreso sin mouse (criterios 9 a 21) | Hacer todo con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de cada acción (criterios 10 a 14, 17, 19 y 21) | Repetir cada acción con teclado |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Ver siempre dónde está el foco | Recorrer con `Tab` una lista larga |
| 2.5.8 Tamaño del objetivo | Tocar el botón ⋮ de cualquier fila sin errar | Usarlo con el dedo en un teléfono |
| 3.3.1 y 3.3.3 Errores | Saber qué campo falló al editar un ingreso (criterio 18) | Guardar con campos vacíos |
| 4.1.2 Nombre, función, valor | Saber qué es cada botón ⋮ y de qué fila es (criterio 23) | Escuchar los botones con lector |
| 4.1.3 Mensajes de estado | Enterarse de cada cambio sin perder el foco (criterios 10, 11, 13, 17 y 21) | Hacer cada acción con lector |

## Textos de UI

| Lugar | Texto |
|---|---|
| Debajo del título | `Ingreso · 01 nov` · `Vence · 01 nov` · `Gasto · 01 nov` |
| Monto | `+ $ 752.500,00` (ingreso) · `$ 437.532,00` · `US$ 4.124,00` |
| Estado de un monto | `Pagado` · `Pendiente` · `Vence hoy` · `Vencido` |
| Menú de un monto | `Marcar como pagado` · `Marcar como pendiente` · `Ver detalle` |
| Menú de un ingreso y de un gasto | `Editar` · `Eliminar` |
| Nombre del botón ⋮ | `Acciones del ingreso Sueldo octubre, 752500 pesos` · `Acciones del monto de Laura, 437532 pesos` · `Acciones del gasto Café, 26300 pesos` |
| Título de la ventana | `Editar ingreso` |
| Botones | `Guardar cambios` · `Cancelar` |
| Confirmación al eliminar | `¿Eliminar el ingreso "Sueldo octubre" de 752500 pesos del 1 de noviembre de 2026?` |
| Mensajes | `✅ Monto marcado como pagado.` · `⚠️ Monto marcado como pendiente.` · `❌ No pudimos actualizar el estado de pago. Intentá de nuevo.` · `Ingreso actualizado.` · `Ingreso actualizado en octubre de 2026.` · `Ingreso eliminado.` · `No pudimos guardar el ingreso. Intentá de nuevo.` · `No pudimos eliminar el ingreso. Intentá de nuevo.` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

## Definition of Ready

- [x] Los criterios se pueden testear sin interpretar
- [x] El alcance entra en una iteración (8 tareas o menos)
- [x] No hay preguntas abiertas
- [x] Textos revisados contra voz y tono y glosario
- [x] Criterios de accesibilidad identificados
- [x] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [x] Se leyó `docs/sdd/learnings.md`
