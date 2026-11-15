---
id: 005-empeza-por-aca
estado: aprobada   # borrador | aprobada | implementada | baseline
issue: "#326"
---

# 005 — Empezá por acá: cargar solo lo que más preocupa

## Historia

Como **persona que entra a Nivva sin nada cargado y se siente abrumada**,
quiero **cargar solo lo que más me preocupa este mes** para **empezar en un
minuto, sin tener que ordenar todo de entrada**.

## Contexto

Las barreras que más se repiten en las encuestas son "no sé por dónde empezar",
"me abruma el detalle" y "me falta tiempo". Hoy la primera visita abre un tour y
después la app vacía, y cargar un gasto con vencimiento pide acreedor, tipo de
deuda y montos. Es la propuesta 1 de
`docs/investigacion/2026-11-14-benchmark-problema-real.md`.

## Alcance

- Incluye: una ventana que aparece al entrar con la app vacía, una pregunta con
  opciones rápidas, tres campos (acreedor, monto con moneda y vencimiento),
  guardar un gasto con vencimiento con un solo monto, saltearla siempre con
  `Ahora no` y dejar de abrir el tour solo.
- No incluye: cargar ingresos o gastos sin vencimiento desde esta ventana, más de
  un monto, cuotas, priorizar qué pagar primero, cambiar el tour ni el botón ❓,
  ni cambiar el formulario de siempre.

## Criterios de aceptación

"App vacía" es que no hay ningún egreso ni ingreso cargado. Monto y fecha
visibles y hablados son como en la spec 001.

### Cuándo aparece

1. **Dado** la app vacía, **cuando** se abre Nivva o se recarga la página,
   **entonces** se abre la ventana "Empezá por acá", con el foco en la pregunta.
   Aparece cada vez que se entra con la app vacía.
2. **Dado** al menos un egreso o un ingreso cargado, **cuando** se abre Nivva,
   **entonces** la ventana no aparece.
3. **Dado** cualquier persona, nueva o no, **cuando** se abre Nivva, **entonces**
   el tour ya no arranca solo. Sigue arrancando al tocar ❓ en el header.

### La pregunta

4. **Dado** la ventana abierta, **cuando** se ve, **entonces** muestra
   `¿Qué te preocupa más este mes?`, debajo `Cargá solo eso. El resto puede
   esperar.` y seis opciones: `Tarjeta de crédito`, `Préstamo`, `Alquiler`,
   `Servicio`, `Familia o conocidos` y `Otro`. Ninguna viene elegida y abajo está
   `Ahora no`.
5. **Dado** las opciones, **cuando** se elige una con el dedo, el mouse o el
   teclado, **entonces** queda marcada, aparecen los campos `Acreedor`, `Monto`,
   `Moneda` y `Vencimiento`, aparece `Guardar` junto a `Ahora no` y el foco va a
   `Acreedor`. Se puede cambiar de opción sin perder lo escrito.
6. **Dado** los campos, **cuando** se ven, **entonces** `Acreedor` tiene la ayuda
   `Por ejemplo: Banco Galicia, el almacén, mi hermana`, `Moneda` viene en
   `Pesos` y se puede cambiar a `Dólares`, y `Vencimiento` viene vacío.

### Guardar

7. **Dado** los campos completos, **cuando** se toca `Guardar` o se presiona
   `Enter`, **entonces** se guarda un gasto con vencimiento con ese acreedor, el
   tipo de deuda igual a la opción elegida y un solo monto sin pagar, con su
   moneda, su vencimiento y el período del mes del vencimiento. Se acepta una
   fecha pasada.
8. **Dado** que se guardó, **cuando** se cierra la ventana, **entonces** Inicio
   muestra el mes del vencimiento con el egreso nuevo, la Deuda total acumulada lo
   incluye y se anuncia, sin mover el foco, `Listo, ya lo cargaste. Vence el 10 de
   diciembre de 2026.` El foco queda en el botón +.
9. **Dado** un egreso cargado desde esta ventana, **cuando** se usa después,
   **entonces** se ve, se edita, se marca como pagado, se refinancia y se elimina
   como cualquier otro gasto con vencimiento.

### Saltear y errores

10. **Dado** la ventana abierta, con o sin opción elegida, **cuando** se toca
    `Ahora no` o se presiona `Escape`, **entonces** se cierra sin guardar nada,
    Inicio queda vacío como hoy y el foco va al botón +. No vuelve a aparecer
    hasta la próxima vez que se entre con la app vacía.
11. **Dado** un campo vacío o inválido, **cuando** se intenta guardar,
    **entonces** no se guarda nada, cada campo dice qué le falta, el foco va al
    primero con error y lo escrito se conserva.

## Escenarios

- Error: si no se puede guardar, la ventana sigue abierta con lo escrito y dice
  `No pudimos guardarlo. Intentá de nuevo.`
- Vacío: es justamente cuando aparece (criterio 1). Si después se elimina todo, la
  ventana vuelve a aparecer la próxima vez que se entre.
- Mobile: a 320 px las opciones y los campos van uno debajo del otro, sin scroll
  horizontal, y con el teclado del teléfono abierto el campo con foco queda visible.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar la pregunta y que las seis opciones son un grupo del que se elige una; escuchar cada campo con su nombre y su ayuda | Recorrer con lector de pantalla |
| 1.4.3 y 1.4.11 Contraste | Leer los textos y distinguir la opción elegida, campos, botones y foco | Revisar el contraste a mano |
| 1.4.10 Reflow | Usar la ventana a 320 px sin scroll horizontal | Achicar la ventana a 320 px |
| 2.1.1 Teclado | Elegir una opción, completar, guardar y saltear sin mouse (criterios 5, 7 y 10) | Hacer el recorrido con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco en cada paso (criterios 1, 5, 8, 10 y 11) | Recorrer los criterios con teclado |
| 2.4.7 y 2.4.11 Foco visible y no tapado | Ver siempre dónde está el foco | Recorrer con `Tab` |
| 2.5.8 Tamaño del objetivo | Tocar cada opción y `Ahora no` sin errar | Usarlo con el dedo en un teléfono |
| 3.3.1 y 3.3.3 Errores | Saber qué campo falló y cómo corregirlo (criterio 11) | Guardar con campos vacíos |
| 4.1.2 Nombre, función, valor | Escuchar qué opción está elegida | Elegir una opción con lector de pantalla |
| 4.1.3 Mensajes de estado | Enterarse de que se guardó sin perder el foco (criterio 8) | Guardar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Título de la ventana | `Empezá por acá` |
| Pregunta | `¿Qué te preocupa más este mes?` |
| Bajada | `Cargá solo eso. El resto puede esperar.` |
| Opciones | `Tarjeta de crédito` · `Préstamo` · `Alquiler` · `Servicio` · `Familia o conocidos` · `Otro` |
| Campos | `Acreedor` · `Monto` · `Moneda` · `Vencimiento` |
| Ayuda de Acreedor | `Por ejemplo: Banco Galicia, el almacén, mi hermana` |
| Opciones de moneda | `Pesos` · `Dólares` |
| Botones | `Guardar` · `Ahora no` |
| Errores por campo | `Escribí el acreedor.` · `Ingresá un monto válido.` · `Ingresá una fecha válida.` |
| Mensaje al guardar | `Listo, ya lo cargaste. Vence el 10 de diciembre de 2026.` |
| Error al guardar | `No pudimos guardarlo. Intentá de nuevo.` |

`Ahora no` no es un infinitivo como piden los CTAs: es una excepción pedida para
que saltear se sienta sin culpa.

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
