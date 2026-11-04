---
id: 004-refinanciar-egreso
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#284"
---

# 004 — Registrar la refinanciación de un egreso

## Historia

Como **persona que acordó un plan nuevo con un acreedor**, quiero **registrar
la refinanciación de un egreso**, para **que mis totales muestren lo que debo
ahora, sin contar la deuda dos veces y sin perder lo que debía antes**.

## Contexto

Hoy, para registrar un plan nuevo, hay que borrar y cargar los montos a mano;
si no se borran, el total cuenta lo viejo y lo nuevo. Nivva registra la
refinanciación, pero no opina sobre si conviene.

## Alcance

- Incluye: refinanciar los montos sin pagar de un egreso en una moneda, generar
  un plan mensual de cuotas iguales y conservar lo anterior como historial.
- No incluye: intereses, comparar planes, recomendar, pagos parciales, juntar
  varios egresos, elegir montos sueltos ni deshacer una refinanciación.

## Criterios de aceptación

"Montos reemplazados" son los montos sin pagar de la moneda elegida, vencidos o
no, que no estaban refinanciados. Monto y fecha hablados son como en la spec 001.

### Iniciar

1. **Dado** un egreso con al menos un monto sin pagar, **cuando** se abre su menú
   ⋮ en Acreedores, **entonces** aparece `Refinanciar` entre `Editar` y `Eliminar`.
   **Cuando** se ve su detalle, **entonces** aparece el botón `Refinanciar` junto
   a `Editar` y `Cerrar`.
2. **Dado** un egreso sin montos sin pagar, o un `Gasto` (spec 003), **cuando** se
   ven esos lugares, **entonces** no aparece `Refinanciar`.
3. **Dado** que se elige `Refinanciar`, **cuando** se abre la ventana "Refinanciar
   egreso", **entonces** muestra el acreedor y
   `Vas a reemplazar 3 montos sin pagar: $ 45.000,00`, pide `Cantidad de cuotas`,
   `Valor de cada cuota` y `Primer vencimiento`, y el foco queda en el primer campo.
4. **Dado** un egreso con montos sin pagar en pesos y en dólares, **cuando** se
   abre la ventana, **entonces** primero pide `Moneda a refinanciar`, sin ninguna
   elegida, y solo ofrece esas dos. Al elegir, se actualiza el texto del criterio
   3. El plan queda en esa moneda y los montos de la otra no cambian. Con una sola
   moneda, este campo no aparece.
5. **Dado** los tres campos completos, **cuando** cambian, **entonces** se lee y se
   anuncia, sin mover el foco, `12 cuotas de $ 5.000,00. Total: $ 60.000,00`.

### Guardar

6. **Dado** el formulario completo, **cuando** se toca `Refinanciar` o se presiona
   `Enter`, **entonces** aparece la confirmación del navegador:
   `¿Refinanciar 3 montos de Banco Galicia por 12 cuotas de 5000 pesos? No se puede
   deshacer.` Si se cancela, la ventana sigue abierta con lo escrito.
7. **Dado** que se aceptó, **cuando** se guarda, **entonces** el egreso suma un monto
   sin pagar por cuota, uno por mes y el mismo día del primer vencimiento. Si ese
   mes no tiene ese día, vence el último día del mes. Se acepta una fecha pasada.
8. **Dado** que se guardó, **cuando** se cierra la ventana, **entonces** el foco
   vuelve a donde se abrió y se anuncia, sin moverlo,
   `Refinanciación guardada. 12 cuotas, la primera vence el 10 de diciembre de 2026.`
9. **Dado** un plan nuevo, **cuando** se usan sus montos, **entonces** se editan, se
   marcan como pagados y se eliminan como cualquier otro monto.
10. **Dado** un plan refinanciado, **cuando** se refinancia otra vez, **entonces**
    solo se reemplazan sus montos sin pagar. Los anteriores no cambian.

### Lo refinanciado

11. **Dado** un egreso refinanciado, **cuando** se ve su detalle, **entonces** debajo
    de "Montos" aparece "Refinanciados", con cada monto reemplazado, su vencimiento
    y `Refinanciado el 03/11/2026`. Se distingue por el texto, no solo por el color.
12. **Dado** un monto refinanciado, **cuando** se revisa el resto de la app,
    **entonces** no aparece en los movimientos del mes, en "Editar egreso" ni en la
    lista de montos pendientes, y no cuenta en Egresos, Balance, Por pagar este mes,
    Total pendiente, Pendiente, Deuda total acumulada, Próximo vencimiento, vencidos
    ni avisos de vencimiento.
13. **Dado** un egreso con 3 montos pagados, 2 refinanciados y 12 cuotas nuevas,
    **cuando** se ve en Acreedores, **entonces** el avance dice `3 de 15 cuotas`.
14. **Dado** un monto refinanciado, **cuando** se ve, **entonces** no se puede marcar
    como pagado, editar, duplicar ni eliminar por separado. Al guardar cambios en
    "Editar egreso", sigue como estaba.
15. **Dado** un egreso refinanciado, **cuando** se elimina, **entonces** también se
    borran sus montos refinanciados, con la misma confirmación de hoy.
16. **Dado** una refinanciación, **cuando** se exporta una copia de seguridad y se
    importa, **entonces** vuelve con los montos refinanciados, sus fechas y el plan.
    Una copia anterior a esta iteración se importa sin error y sin refinanciados.

### Cancelar y errores

17. **Dado** la ventana abierta, **cuando** se toca `Cancelar` o se presiona `Escape`,
    **entonces** se cierra sin cambiar nada y el foco vuelve a donde se abrió.
18. **Dado** un campo vacío o inválido, **cuando** se intenta guardar, **entonces** no
    aparece la confirmación, cada campo dice qué le falta, el foco va al primero con
    error y lo escrito se conserva.

## Escenarios

- Error: si no se puede guardar, no cambia ningún monto, la ventana sigue abierta
  con lo escrito y dice `No pudimos guardar la refinanciación. Intentá de nuevo.`
- Vacío: sin montos sin pagar, no hay `Refinanciar` (criterio 2).
- Mobile: a 320 px los campos van uno debajo del otro, sin scroll horizontal, y con
  el teclado del teléfono abierto el campo con foco queda visible.
- Límite: la cantidad de cuotas va de 1 a 120, en números enteros.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar cada campo con su nombre y la lista de refinanciados como lista (criterios 3 y 11) | Recorrer con lector de pantalla |
| 1.4.1 Uso del color | Reconocer un monto refinanciado sin ver colores (criterio 11) | Mirar el detalle en escala de grises |
| 1.4.3 y 1.4.11 Contraste | Leer los textos y distinguir campos, botones y foco | Revisar el contraste a mano |
| 1.4.10 Reflow | Refinanciar a 320 px sin scroll horizontal | Achicar la ventana a 320 px |
| 2.1.1 Teclado | Hacer todo el recorrido sin mouse (criterios 1, 6 y 17) | Refinanciar y cancelar con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de cada acción (criterios 3, 8, 17 y 18) | Recorrer los criterios con teclado |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Ver siempre dónde está el foco | Recorrer con `Tab` |
| 2.5.8 Tamaño del objetivo | Tocar `Refinanciar` sin errar | Usarlo con el dedo en un teléfono |
| 3.3.1 y 3.3.3 Errores | Saber qué campo falló y cómo corregirlo (criterio 18) | Guardar con campos vacíos |
| 4.1.2 Nombre, función, valor | Saber qué egreso se refinancia: el botón se anuncia `Refinanciar Banco Galicia` | Escuchar el control |
| 4.1.3 Mensajes de estado | Enterarse del total y del guardado sin perder el foco (criterios 5 y 8) | Refinanciar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Menú ⋮ y detalle | `Refinanciar` |
| Título de la ventana | `Refinanciar egreso` |
| Resumen | `Vas a reemplazar 3 montos sin pagar: $ 45.000,00` · `Vas a reemplazar 1 monto sin pagar: $ 15.000,00` |
| Campos | `Moneda a refinanciar` · `Cantidad de cuotas` · `Valor de cada cuota` · `Primer vencimiento` |
| Total | `12 cuotas de $ 5.000,00. Total: $ 60.000,00` · `1 cuota de $ 5.000,00. Total: $ 5.000,00` |
| Botones | `Refinanciar` · `Cancelar` |
| Errores por campo | `Seleccioná una moneda.` · `Ingresá una cantidad de cuotas entre 1 y 120.` · `Ingresá un valor mayor a 0.` · `Ingresá una fecha válida.` |
| Confirmación | `¿Refinanciar 3 montos de Banco Galicia por 12 cuotas de 5000 pesos? No se puede deshacer.` |
| Mensaje al guardar | `Refinanciación guardada. 12 cuotas, la primera vence el 10 de diciembre de 2026.` |
| Error al guardar | `No pudimos guardar la refinanciación. Intentá de nuevo.` |
| Detalle | `Refinanciados` · `Refinanciado el 03/11/2026` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

- Aprobar en el glosario "Refinanciación" y "Refinanciado", y en los CTAs el verbo
  `Refinanciar`. Esos cambios van en otro PR, porque este solo puede tocar la spec.

## Definition of Ready

- [x] Los criterios se pueden testear sin interpretar
- [x] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [ ] Textos revisados contra voz y tono y glosario
- [x] Criterios de accesibilidad identificados
- [x] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [x] Se leyó `docs/sdd/learnings.md`
