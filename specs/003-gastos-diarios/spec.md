---
id: 003-gastos-diarios
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#272"
---

# 003 — Anotar lo que gasto en el día, sin vencimiento ni acreedor

## Historia

Como **persona que quiere saber cuánto le queda en el mes**, quiero **anotar
rápido lo que gasto en el día, sin acreedor ni vencimiento**, para **que el
balance refleje también esos gastos**.

## Contexto

Hoy el balance resta solo los egresos cargados, y cada uno pide acreedor y
vencimiento. Una compra en el súper no tiene ninguno de los dos, así que
queda afuera y el balance muestra más margen del real. Es un agregado a la
pregunta "cuánto debo, cuánto entra y qué vence": también "cuánto me queda".

Un gasto es un egreso. Desde esta iteración, un egreso es de uno de dos tipos:
**Gasto**, ya pagado y sin acreedor ni vencimiento, o **Gasto con vencimiento**,
que es lo que hoy se carga como egreso.

## Alcance

- Incluye: elegir el tipo de egreso al agregarlo; agregar, editar y eliminar
  un gasto; verlo en los movimientos del mes; contarlo en Egresos y Balance;
  conservarlo en la copia de seguridad.
- No incluye: categorías, presupuestos, límites, gastos recurrentes, gráficos
  ni cambiar el tipo de un egreso ya guardado.

## Forma hablada

Monto y fecha se leen como define la spec 001 (`5000 pesos`,
`3 de noviembre de 2026`).

## Criterios de aceptación

1. **Dado** el Inicio, **cuando** en "¿Qué querés agregar?" se elige `Egreso`,
   **entonces** la misma ventana pasa a "¿Qué tipo de egreso?" y ofrece `Gasto`,
   con el detalle `Súper, transporte, salidas`, y `Gasto con vencimiento`, con
   el detalle `Tarjeta, préstamo, alquiler, servicio`. En el primer paso, el
   detalle de `Egreso` pasa a `Súper, tarjeta, préstamo, alquiler`.
2. **Dado** que se eligió `Gasto`, **cuando** se abre "Agregar gasto",
   **entonces** pide Descripción, Monto, Moneda y Fecha, sin acreedor ni
   vencimiento. Moneda viene con pesos elegido, Fecha viene con el día de hoy
   y el foco queda en Descripción.
3. **Dado** el formulario completo, **cuando** se toca `Agregar gasto` o se
   presiona `Enter`, **entonces** el gasto se guarda, la ventana se cierra, el
   foco vuelve al botón + y se lee y se anuncia, sin mover el foco,
   `Gasto agregado.`
4. **Dado** un gasto con fecha de otro mes, **cuando** se guarda, **entonces**
   el mes elegido no cambia y el mensaje indica dónde quedó:
   `Gasto agregado en octubre de 2026.`
5. **Dado** un campo sin completar o inválido, **cuando** se intenta guardar,
   **entonces** no se guarda, cada campo dice qué le falta, el foco va al
   primero con error y lo escrito se conserva.
6. **Dado** el formulario abierto, **cuando** se toca `Cancelar` o se presiona
   `Escape`, **entonces** se cierra sin guardar y el foco vuelve a donde estaba.
7. **Dado** un gasto del mes elegido, **cuando** se ve "Todo" o "Egresos",
   **entonces** aparece en orden de fecha, con su descripción,
   `Gasto · 03/11/2026` y `$ 5.000,00`, o `US$ 5.000,00` si es en dólares. El
   tipo se distingue por el texto, no solo por el color. A igual fecha van
   primero los ingresos, después los montos de egresos y al final los gastos.
8. **Dado** un gasto, **cuando** se ve su fila, **entonces** no tiene
   interruptor de pagado, porque un gasto ya está pagado, y tiene un botón ⋮
   con `Editar` y `Eliminar`, que funciona con teclado y mouse como el menú
   del criterio 8 de la spec 001.
9. **Dado** un gasto, **cuando** se elige `Editar`, **entonces** se abre
   "Editar gasto" con sus datos y el botón `Guardar cambios`. Al guardar, la
   fila se actualiza, el foco va a su botón ⋮ y se anuncia `Gasto actualizado.`
   Si la fecha pasó a otro mes, el foco va al botón + y el mensaje es
   `Gasto actualizado en octubre de 2026.`
10. **Dado** un gasto, **cuando** se elige `Eliminar`, **entonces** aparece la
    confirmación propia del navegador con el texto
    `¿Eliminar el gasto "Súper" de 5000 pesos del 3 de noviembre de 2026?` Si
    se cancela, no cambia nada y el foco vuelve a su botón ⋮.
11. **Dado** que se aceptó eliminar, **cuando** la lista se actualiza,
    **entonces** el foco pasa al botón ⋮ de la fila siguiente que tenga uno;
    si no hay, al de la anterior; si no hay ninguno, al botón +. Se anuncia
    `Gasto eliminado.`
12. **Dado** un mes con ingresos de $ 100.000,00, un egreso de $ 30.000,00 y un
    gasto de $ 5.000,00, **cuando** se ve el resumen del mes, **entonces**
    Egresos muestra $ 35.000,00, Balance $ 65.000,00 y "Por pagar este mes"
    $ 30.000,00. Agregar, editar o eliminar un gasto actualiza el resumen sin
    recargar.
13. **Dado** un gasto, **cuando** se revisa el resto de la app, **entonces** no
    aparece en Acreedores ni en la lista filtrada por montos pendientes, y no
    cuenta en la Deuda total acumulada, en los vencidos ni en los avisos de
    vencimiento.
14. **Dado** un gasto en dólares, **cuando** se ve el resumen, **entonces** se
    trata igual que un monto en dólares: no se mezcla con los pesos.
15. **Dado** que hay gastos, **cuando** se exporta una copia de seguridad y se
    importa, **entonces** los gastos vuelven con todos sus datos. Una copia
    hecha antes de que existieran los gastos se sigue importando sin error.
16. **Dado** que hay gastos, **cuando** se eliminan todos los datos desde
    Ajustes, **entonces** los gastos también se borran. La confirmación no
    cambia, porque un gasto es un egreso.
17. **Dado** el lector de pantalla en una fila de gasto, **cuando** la recorre,
    **entonces** dice la descripción, `Gasto`, la fecha y el monto en la forma
    hablada, y el botón ⋮ se llama `Acciones del gasto Súper, 5000 pesos`.
18. **Dado** "¿Qué tipo de egreso?", **cuando** aparece, **entonces** el lector
    anuncia ese título y el foco queda en `Gasto`. `Tab` pasa a la otra opción y
    `Enter` o `Espacio` la eligen. `Escape` cierra la ventana y el foco vuelve
    al botón +.
19. **Dado** que se eligió `Gasto con vencimiento`, **cuando** se abre el
    formulario, **entonces** funciona igual que hoy, con los títulos
    `Agregar gasto con vencimiento` y, al editar,
    `Editar gasto con vencimiento`.
20. **Dado** un egreso cargado antes de esta iteración, **cuando** se ve o se
    edita, **entonces** es un `Gasto con vencimiento` y conserva todos sus datos
    y su comportamiento. Lo mismo vale para el que llega en una copia anterior.
21. **Dado** un egreso guardado, **cuando** se edita, **entonces** no se puede
    cambiar su tipo: para cambiarlo, se elimina y se carga de nuevo.

## Escenarios

- Error: si no se puede guardar, la ventana sigue abierta con lo escrito y
  dice `No pudimos guardar el gasto. Intentá de nuevo.`
- Vacío: los mensajes de "Todo" y "Egresos" sin nada en el mes no cambian.
- Mobile: a 320 px la fila no genera scroll horizontal; una descripción larga
  se corta en lo visible y el lector la lee completa.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar cada campo con su nombre y saber que la fila es un gasto (criterios 2 y 17) | Recorrer con lector de pantalla |
| 1.4.1 Uso del color | Distinguir un gasto de un egreso o un ingreso sin ver colores (criterio 7) | Mirar la lista en escala de grises |
| 1.4.3 y 1.4.11 Contraste | Leer textos y distinguir campos, botón ⋮ y foco | Revisar el contraste a mano |
| 1.4.10 Reflow | Agregar y ver gastos a 320 px sin scroll horizontal | Achicar la ventana a 320 px |
| 2.1.1 Teclado | Elegir el tipo, agregar, editar y eliminar sin mouse (criterios 3, 6, 8, 9, 10 y 18) | Hacer todo el recorrido con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de cada acción (criterios 3, 6, 9, 10, 11 y 18) | Agregar, editar, eliminar y cancelar con teclado |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Ver siempre dónde está el foco | Recorrer con `Tab` una lista larga |
| 2.5.8 Tamaño del objetivo | Tocar el botón ⋮ y sus opciones sin errar | Usarlo con el dedo en un teléfono |
| 3.3.1 y 3.3.3 Errores | Saber qué campo falló y cómo corregirlo (criterio 5) | Guardar con campos vacíos |
| 4.1.2 Nombre, función, valor | Saber qué es cada control y cómo se llama (criterio 17) | Escuchar los controles con lector de pantalla |
| 4.1.3 Mensajes de estado | Enterarse de que se agregó, actualizó o eliminó sin perder el foco (criterios 3, 4, 9 y 11) | Hacer cada acción con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Primer paso del botón + | `Egreso` · `Súper, tarjeta, préstamo, alquiler` |
| Segundo paso | `¿Qué tipo de egreso?` |
| Tipos de egreso | `Gasto` · `Súper, transporte, salidas` · `Gasto con vencimiento` · `Tarjeta, préstamo, alquiler, servicio` |
| Títulos de la ventana | `Agregar gasto` · `Editar gasto` · `Agregar gasto con vencimiento` · `Editar gasto con vencimiento` |
| Campos | `Descripción` · `Monto` · `Moneda` · `Fecha` |
| Botones | `Agregar gasto` · `Guardar cambios` · `Cancelar` |
| Errores por campo | `Ingresá una descripción.` · `Ingresá un monto mayor a 0.` · `Seleccioná una moneda.` · `Ingresá una fecha válida.` |
| Error al guardar | `No pudimos guardar el gasto. Intentá de nuevo.` |
| Fila | `Gasto · 03/11/2026` · `$ 5.000,00` · `US$ 5.000,00` |
| Menú | `Editar` · `Eliminar` |
| Nombre del botón ⋮ | `Acciones del gasto Súper, 5000 pesos` |
| Mensajes | `Gasto agregado.` · `Gasto agregado en octubre de 2026.` · `Gasto actualizado.` · `Gasto actualizado en octubre de 2026.` · `Gasto eliminado.` |
| Confirmación al eliminar | `¿Eliminar el gasto "Súper" de 5000 pesos del 3 de noviembre de 2026?` |

## Preguntas abiertas

1. Glosario y marca: ¿se aprueban `Gasto` y `Gasto con vencimiento`, se amplía
   la definición de egreso ("pago que debe realizar") y se ajusta el objetivo
   "gastos fijos" de la marca? Los cambios van en su propio PR.

## Definition of Ready

- [x] Los criterios se pueden testear sin interpretar
- [x] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [ ] Textos revisados contra voz y tono y glosario
- [x] Criterios de accesibilidad identificados
- [x] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [x] Se leyó `docs/sdd/learnings.md`
