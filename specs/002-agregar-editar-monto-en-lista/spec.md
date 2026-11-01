---
id: 002-agregar-editar-monto-en-lista
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#249"
---

# 002 — Agregar y editar un monto sin salir de la lista

## Historia

Como **persona que carga o corrige un egreso**, quiero **agregar y editar
cada monto en su propia fila de la lista, con un solo "Guardar" para todo
el egreso**, para **no perder un monto que ya escribí ni dudar cuál de los
botones guarda qué**.

## Contexto

Hoy, en "Agregar egreso" y "Editar egreso", "Agregar monto" y "Editar"
abren un formulario aparte con su propio "Cancelar" y "Guardar", y la
lista de montos desaparece mientras está abierto. Quedan dos "Guardar" en
la misma ventana: si la persona completa un monto y toca el "Guardar" del
pie, ese monto se pierde sin aviso. La spec 001 dejó este comportamiento
para esta iteración.

## Alcance

- Incluye:
  - Agregar un monto como una fila nueva dentro de la lista "Montos", con
    la lista visible.
  - Editar un monto en su misma fila, con la lista visible.
  - Botones de la fila abierta: "Listo" y "Cancelar".
  - `Escape`, "Guardar" del egreso y abrir otro monto con uno abierto.
  - Los botones del pie y el mensaje cuando no hay montos al guardar.
- No incluye (iteración 003): cifra con coma decimal, fecha
  `dd/mm/aaaa` y moneda preseleccionada. Los campos quedan como hoy.
- No incluye: el detalle del egreso, el resumen del mes, la importación
  ni lo que la spec 001 ya define para las filas cerradas.

## Criterios de aceptación

"Monto abierto" es una fila de la lista que muestra los campos Monto,
Moneda y Vencimiento en lugar de la cifra y el vencimiento. "Monto N" es
la posición en la lista, como en la spec 001. Monto hablado y fecha
hablada son las formas que define la spec 001.

### Agregar

1. **Dado** "Agregar egreso" o "Editar egreso", **cuando** se toca
   "Agregar monto", **entonces** aparece un monto abierto vacío al final
   de la lista, los montos que ya estaban siguen visibles y el foco queda
   en el campo "Monto" de esa fila. Si la lista estaba vacía, el texto
   `Todavía no agregaste montos. Agregá el primero.` se reemplaza por esa
   fila.
2. **Dado** un monto nuevo abierto con los tres campos completos,
   **cuando** se toca "Listo" o se presiona `Enter` en uno de sus campos,
   **entonces** la fila se cierra, el monto queda en la lista en el lugar
   que le corresponde por su vencimiento, el foco pasa a su "Editar" y el
   lector anuncia, sin mover el foco, `Monto agregado. Vence el 10 de
   noviembre de 2026.` (fecha hablada del monto). El monto nuevo no está
   marcado como pagado.

### Editar

3. **Dado** un monto cerrado en la lista, **cuando** se toca su
   "Editar", **entonces** esa misma fila pasa a ser un monto abierto con
   la cifra, la moneda y el vencimiento que tenía, el resto de la lista
   sigue visible y el foco queda en el campo "Monto" de esa fila.
4. **Dado** un monto existente abierto, **cuando** se toca "Listo" o se
   presiona `Enter` en uno de sus campos con los tres campos completos,
   **entonces** la fila se cierra con los valores nuevos, se reubica
   según su vencimiento, conserva si estaba marcado como pagado, el foco
   pasa a su "Editar" y el lector anuncia, sin mover el foco,
   `Monto actualizado.`

### Descartar

5. **Dado** un monto nuevo abierto, **cuando** se toca su "Cancelar" o
   se presiona `Escape` con el foco dentro de la fila, **entonces** la
   fila desaparece, no se agrega nada y el foco vuelve a "Agregar monto".
   La ventana del egreso sigue abierta.
6. **Dado** un monto existente abierto, **cuando** se toca su "Cancelar"
   o se presiona `Escape` con el foco dentro de la fila, **entonces** la
   fila se cierra con los valores que tenía antes de abrirla y el foco
   vuelve a su "Editar". La ventana del egreso sigue abierta.
7. **Dado** un monto abierto, **cuando** se toca "Cancelar" en el pie de
   la ventana, **entonces** se cierra la ventana sin guardar nada, igual
   que hoy, incluido el monto abierto.

### Errores en un monto abierto

8. **Dado** un monto abierto con algún campo vacío o inválido, **cuando**
   se toca "Listo" o se presiona `Enter`, **entonces** la fila sigue
   abierta, cada campo con problema muestra su mensaje debajo (los mismos
   de hoy), aparece `Completá monto, moneda y vencimiento para agregar el
   monto.` y el foco pasa al primer campo con problema. El lector anuncia
   el mensaje de cada campo al llegar a él.

### Guardar el egreso con un monto abierto

9. **Dado** un monto abierto con los tres campos completos y el resto del
   egreso completo, **cuando** se toca "Guardar" en el pie, **entonces**
   ese monto se incluye (como si se hubiera tocado "Listo") y el egreso se
   guarda con él.
10. **Dado** un monto abierto con algún campo vacío o inválido, **cuando**
    se toca "Guardar" en el pie, **entonces** el egreso no se guarda, la
    ventana sigue abierta, el monto abierto muestra sus errores como en el
    criterio 8 y el foco pasa a su primer campo con problema. Si además
    falta Acreedor o Tipo de deuda, también se marcan, y el foco va al
    primer campo con problema en el orden de la ventana.
11. **Dado** un monto nuevo abierto con los tres campos vacíos, **cuando**
    se toca "Guardar" en el pie, **entonces** pasa lo del criterio 10.

### Un solo monto abierto a la vez

12. **Dado** un monto abierto, **cuando** se toca "Agregar monto" o el
    "Editar" de otro monto, **entonces** primero se intenta cerrar el
    abierto como si se tocara "Listo": si sus campos están completos, se
    aplica y se abre el otro; si no, el otro no se abre y el abierto
    muestra sus errores como en el criterio 8. Ya no aparece la pregunta
    `¿Cancelar los cambios actuales?`. Nunca hay más de un monto abierto.
13. **Dado** un monto abierto, **cuando** se usa "Pagado" o "Más acciones"
    de otro monto (spec 001), **entonces** el monto abierto sigue abierto
    sin perder lo escrito.

### Pie de la ventana y lista vacía

14. **Dado** la ventana "Agregar egreso" o "Editar egreso", **cuando** se
    ven los botones del pie, **entonces** "Guardar" es el único botón
    principal (relleno) y "Cancelar" es secundario (con borde, sin
    relleno). No hay otro botón "Guardar" en la ventana.
15. **Dado** un egreso sin montos y sin ningún monto abierto, **cuando**
    se toca "Guardar" en el pie, **entonces** no se guarda, debajo de la
    lista se lee `Agregá al menos un monto para guardar el egreso.`, el
    lector lo anuncia y el foco pasa a "Agregar monto". El mensaje se va
    en cuanto se agrega un monto.

## Escenarios

- Error: criterios 8, 10 y 11.
- Vacío: criterios 1 y 15.
- Mobile: a 320 px de ancho, en el monto abierto los campos Monto, Moneda
  y Vencimiento van uno debajo del otro y "Listo" y "Cancelar" quedan
  debajo de los campos, dentro de la fila, sin scroll horizontal. Con el
  teclado del teléfono abierto, el campo con foco queda visible.
- Lista larga: sin scroll propio (spec 001); el monto abierto no queda
  tapado por el encabezado ni por el pie.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar que el monto abierto está dentro de la lista "Montos", en qué posición, y cada campo con su nombre | Recorrer la lista con un monto abierto usando lector de pantalla |
| 1.4.10 Reflow | Usar el monto abierto a 320 px sin scroll horizontal (Escenarios, Mobile) | Achicar la ventana a 320 px o zoom al 400 % |
| 1.4.11 Contraste no textual | Distinguir el borde del monto abierto, los bordes de los campos y el "Cancelar" secundario del pie | Revisar el contraste a mano |
| 2.1.1 Teclado | Agregar, editar, confirmar y descartar un monto sin mouse, incluidos `Enter` y `Escape` (criterios 2, 4, 5 y 6) | Hacer todo el flujo solo con teclado |
| 2.1.2 Sin trampa de teclado | Salir del monto abierto con `Tab` hacia el resto de la ventana | Recorrer con `Tab` desde el monto abierto |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de agregar, editar, descartar y fallar (criterios 1 a 12 y 15) | Recorrer los criterios con teclado |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Ver el foco en los campos y botones del monto abierto, sin que lo tape el encabezado ni el pie | Recorrer una lista larga con `Tab` |
| 2.5.3 Etiqueta en el nombre | Activar "Listo" y "Cancelar" de la fila por voz diciendo el texto que se ve; el nombre que anuncia el lector empieza con ese texto | Escuchar los nombres con lector de pantalla |
| 2.5.8 Tamaño del objetivo | Tocar "Listo" y "Cancelar" de la fila sin errar | Usar la fila con el dedo en un teléfono |
| 3.3.1 y 3.3.3 Errores | Saber qué campo del monto falta y cómo corregirlo (criterios 8 y 10) | Tocar "Listo" con campos vacíos |
| 4.1.2 Nombre, función, valor | Distinguir el "Cancelar" de la fila del "Cancelar" del pie por su nombre | Escuchar ambos botones con lector de pantalla |
| 4.1.3 Mensajes de estado | Enterarse de que un monto se agregó o actualizó, y del mensaje del criterio 15, sin perder el foco | Agregar y editar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Botón que abre un monto nuevo | `Agregar monto` (sin cambios) |
| Confirmar el monto abierto | `Listo` |
| Descartar el monto abierto | `Cancelar` |
| Nombres que anuncia el lector (monto nuevo) | `Listo, monto nuevo` · `Cancelar monto nuevo` |
| Nombres que anuncia el lector (monto 3) | `Listo, monto 3` · `Cancelar cambios del monto 3` |
| Campos y errores del monto | Sin cambios respecto de hoy |
| Anuncio al agregar | `Monto agregado. Vence el 10 de noviembre de 2026.` |
| Anuncio al editar | `Monto actualizado.` |
| Egreso sin montos al guardar | `Agregá al menos un monto para guardar el egreso.` (reemplaza `Debe agregar al menos un monto antes de guardar.`) |
| Pie de la ventana | `Cancelar` (secundario) · `Guardar` (principal) |
| Se elimina | `Nuevo monto` · `Editar monto` (títulos del formulario aparte) · `¿Cancelar los cambios actuales?` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

1. `Listo` no está en los verbos de `docs/wiki/06-CTAs.md`. ¿Se suma
   como excepción en un PR aparte antes de aprobar esta spec?
2. Criterio 12: ¿no abrir el otro monto y marcar errores, o descartar
   el abierto sin preguntar?

## Definition of Ready

- [ ] Los criterios se pueden testear sin interpretar
- [ ] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [x] Textos revisados contra voz y tono y glosario
- [x] Criterios de accesibilidad identificados
- [x] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [x] Se leyó `docs/sdd/learnings.md`
