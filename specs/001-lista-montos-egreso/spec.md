---
id: 001-lista-montos-egreso
estado: aprobada    # borrador | aprobada | implementada | baseline
issue: "#235"
---

# 001 — Ver y manejar los montos de un egreso de un vistazo

## Historia

Como **persona que carga un egreso con varios montos**, quiero **ver cada
monto como una fila clara con su cifra, vencimiento y estado, y acciones
con nombre**, para **entender qué cargué, corregirlo sin adivinar qué hace
cada ícono y repetir un monto en el mes siguiente sin cambiar la fecha a
mano**.

## Contexto

Hoy, dentro de "Agregar egreso" y "Editar egreso", los montos se ven en
una tabla con cifras sin formato (`15000`, `ARS`, `2026-11-10`) y cuatro
acciones con íconos sueltos (✎ × ⧉ y una casilla sin etiqueta). En mobile
la tabla queda apretada y tiene su propio scroll dentro del scroll de la
ventana. Esta iteración cambia solo la **lista de montos**; agregar y
editar un monto queda para la iteración 002.

Además cambia un comportamiento: hoy Duplicar copia el mismo vencimiento;
con esta spec el monto nuevo vence en el mes siguiente al último monto de
la lista (criterios 6 y 7).

## Alcance

- Incluye:
  - Ver los montos como filas tipo tarjeta, en "Agregar egreso" y en
    "Editar egreso", en lugar de la tabla.
  - Cifra y vencimiento con formato, e interruptor "Pagado" visible.
  - Un botón de tres puntos verticales (⋮) por fila con un menú de
    acciones: Editar, Duplicar y Eliminar.
  - Duplicar con vencimiento en el mes siguiente al último monto; el
    monto nuevo corresponde al mes de ese vencimiento.
  - Mensaje cuando no hay montos.
  - Que la lista no tenga scroll propio.
- No incluye (iteración 002):
  - Agregar o editar un monto (se sigue abriendo igual que hoy y la lista
    se oculta mientras está abierto).
  - Qué pasa al tocar "Guardar" del egreso con un monto abierto.
  - Los botones del pie de la ventana y el mensaje "Debe agregar al menos
    un monto".
  - La pregunta "¿Cancelar los cambios actuales?".
- No incluye (nunca en esta spec): la vista de detalle del egreso, las
  listas del resumen del mes ni la validación de los montos al importar
  una copia de seguridad.

## Forma hablada

Lo que lee el lector de pantalla y lo que dice la confirmación al
eliminar usa estas formas, distintas de lo que se ve en la fila. Igual
que lo visible, no depende de la región configurada en el dispositivo.

- **Monto hablado:** la cifra sin separador de miles y el nombre de la
  moneda. Si no tiene centavos, va sin decimales; si tiene, siempre con
  dos (`1,5` se dice `1,50`). El separador de decimales es la coma. La
  moneda va en singular solo si la cifra es exactamente 1 (`1 peso`,
  `1 dólar`); si no, en plural (`2 pesos`, `1,50 pesos`,
  `0,50 dólares`). Nunca se lee `$` ni
  `US$`, porque en español el lector dice "dólares" también para `$`.
- **Fecha hablada:** día, nombre del mes y año (`10 de noviembre de 2026`).

## Criterios de aceptación

"Monto N" es la posición del monto en la lista, empezando en 1.

1. **Dado** un egreso con montos, **cuando** se ven en "Agregar egreso" o
   en "Editar egreso", **entonces** aparecen como una lista llamada
   "Montos", una fila por monto, ordenada de la fecha de vencimiento más
   antigua a la más reciente. Debajo del nombre de la lista se lee
   `Del vencimiento más antiguo al más reciente.` El lector de pantalla
   la anuncia como lista e indica cuántos montos tiene.
2. **Dado** un monto de 15000 pesos que vence el 10 de noviembre de 2026,
   **cuando** se ve su fila, **entonces** muestra `$ 15.000,00` y
   `Vence el 10/11/2026`. Uno de 15000 dólares muestra `US$ 15.000,00`.
   La moneda no se muestra aparte. Lo visible usa siempre punto para los
   miles y coma para los decimales, sin importar la región.
3. **Dado** un monto, **cuando** el lector de pantalla lee su fila,
   **entonces** dice el monto y el vencimiento en la forma hablada
   (`15000 pesos`, `Vence el 10 de noviembre de 2026`).
4. **Dado** un monto, **cuando** se ve su fila, **entonces** tiene un
   interruptor con la etiqueta visible "Pagado", con el mismo aspecto
   que el del listado de egresos, activado si el monto está pagado, que
   es la única indicación del estado (no hay otro texto "Pagado" o
   "Pendiente"). El lector lo anuncia como interruptor e indica si está
   activado. Al cambiarlo, el estado queda así cuando se guarda el
   egreso (como hoy) y el foco sigue en el interruptor.
5. **Dado** un monto, **cuando** se elige "Editar" en el menú de su fila,
   **entonces** se abre la edición de ese monto, igual que hoy con ✎.
6. **Dado** un egreso cuyo último monto de la lista vence en diciembre de
   2026, **cuando** se duplica un monto que vence el día 10, **entonces**
   aparece un monto nuevo con la misma cifra y moneda, sin marcar como
   pagado, que vence el 10/01/2027: mismo día que el monto duplicado, en
   el mes siguiente al último vencimiento de la lista. El monto nuevo
   corresponde a enero de 2027: en el resumen del mes aparece en enero,
   no en diciembre.
7. **Dado** un egreso cuyo último monto de la lista vence en enero de
   2027, **cuando** se duplica un monto que vence el día 31, **entonces**
   el monto nuevo vence el 28/02/2027, el último día del mes siguiente.
   En un año bisiesto vence el 29 (por ejemplo, 29/02/2028 si el último
   monto vence en enero de 2028).
8. **Dado** un monto, **cuando** se usa el botón ⋮ de su fila,
   **entonces** se abre, alineado al borde derecho del botón, un menú con
   "Editar", "Duplicar" y "Eliminar" que funciona así con teclado y mouse:
   - `Enter`, `Espacio`, flecha abajo o un clic lo abren con el foco en
     "Editar"; flecha arriba lo abre con el foco en "Eliminar".
   - Con el menú abierto, flecha abajo y flecha arriba pasan de una
     opción a otra y, al llegar a una punta, siguen por la otra; `Inicio`
     va a la primera y `Fin` a la última.
   - `Enter`, `Espacio` o un clic sobre una opción la ejecutan y cierran
     el menú.
   - `Escape` cierra solo el menú y el foco vuelve al botón ⋮; la
     ventana del egreso sigue abierta.
   - `Tab` cierra el menú y el foco sigue su orden normal; un clic afuera
     lo cierra sin mover el foco.
   - Nunca hay más de un menú abierto a la vez.
   - El lector anuncia el botón como menú, si está abierto o cerrado, y
     cada opción como opción de menú.
9. **Dado** que se duplicó un monto, **cuando** la lista se actualiza,
   **entonces** el foco pasa al botón ⋮ del monto nuevo y el lector
   anuncia, sin mover el foco, `Monto duplicado.` seguido del vencimiento
   del monto nuevo en la forma hablada (con el ejemplo del criterio 6:
   `Monto duplicado. Vence el 10 de enero de 2027.`).
10. **Dado** un monto, **cuando** se elige "Eliminar" en su menú,
    **entonces** el menú se cierra y aparece la confirmación propia del
    navegador, con sus botones de siempre, y el texto
    `¿Eliminar el monto de 15000 pesos que vence el 10 de noviembre de
    2026?` (monto y fecha en la forma hablada). Si se acepta, el monto
    sale de la lista; si se cancela, no cambia nada y el foco vuelve al
    botón ⋮ de ese monto.
11. **Dado** que se eliminó un monto, **cuando** la lista se actualiza,
    **entonces** el foco pasa al botón ⋮ del monto siguiente; si no hay
    siguiente, al del anterior; si la lista quedó vacía, a "Agregar
    monto". El lector anuncia, sin mover el foco, `Monto eliminado.`
12. **Dado** un egreso sin montos, **cuando** se ve la sección de montos,
    **entonces** dice `Todavía no agregaste montos. Agregá el primero.`
    en lugar de la lista y "Agregar monto" sigue disponible.
13. **Dado** un egreso con muchos montos, **cuando** se ve la lista,
    **entonces** se recorre con el scroll de la ventana del egreso: la
    lista no tiene un scroll propio.
14. **Dado** el monto 3 de la lista, de 15000 pesos, **cuando** el lector
    de pantalla anuncia los controles de su fila, **entonces** dice
    `Pagado: monto 3, 15000 pesos`, que empieza con el texto que se ve en
    pantalla, y `Acciones del monto 3, 15000 pesos` para el botón ⋮. El
    lector no lee los tres puntos.

## Escenarios

- Error: no aplica en esta lista. Todo monto tiene vencimiento: el
  formulario de monto lo exige (como hoy) y la copia de seguridad lo
  conserva al exportar e importar. Un archivo editado a mano o dañado se
  resuelve en la validación al importar, que no es parte de esta spec.
- Vacío: criterio 12.
- Mobile: a 320 px de ancho cada fila entra en una sola línea, con monto
  y vencimiento a la izquierda y el interruptor y el botón ⋮ a la
  derecha, sin scroll horizontal. El menú abierto tampoco se sale de la
  pantalla.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.1.1 Contenido no textual | Saber para qué sirve el botón ⋮ aunque no se vean palabras (criterio 14) | Escuchar el botón con lector de pantalla |
| 1.3.1 Info y relaciones | Escuchar los montos como una lista llamada "Montos", el interruptor con su etiqueta, la moneda por su nombre y la fecha completa (criterios 1 y 3) | Recorrer la lista con lector de pantalla |
| 1.4.3 Contraste mínimo | Leer monto, vencimiento y textos de la fila sobre su fondo | Revisar el contraste a mano |
| 1.4.10 Reflow | Usar la lista y su menú a 320 px sin scroll horizontal ni scroll interno | Achicar la ventana a 320 px o usar zoom al 400 % |
| 1.4.11 Contraste no textual | Distinguir el borde de la fila, el interruptor y el foco | Revisar el contraste a mano |
| 2.1.1 Teclado | Abrir el menú, elegir Editar, Duplicar o Eliminar y activar "Pagado" sin mouse (criterios 4, 5 y 8) | Recorrer la fila solo con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de cada acción (criterios 4, 8, 9, 10 y 11) | Duplicar, eliminar y cancelar con teclado |
| 2.4.7 Foco visible | Ver dónde está el foco en botones, opciones del menú e interruptor | Recorrer la fila con `Tab` |
| 2.4.11 Foco no tapado | Que el foco en una fila no quede debajo del encabezado ni del pie de la ventana (criterio 13) | Recorrer con `Tab` una lista más larga que la pantalla |
| 2.5.3 Etiqueta en el nombre | Activar "Pagado" por voz diciendo el texto que ve (criterio 14) | Escuchar los nombres con lector de pantalla |
| 2.5.8 Tamaño del objetivo | Tocar el botón ⋮, las opciones del menú y el interruptor sin errar; el botón ⋮ mide al menos 24 × 24 px | Usar la lista con el dedo en un teléfono |
| 4.1.2 Nombre, función, valor | Saber qué es cada control, cómo se llama y su estado, incluido si el menú está abierto (criterio 8) | Escuchar los controles con lector de pantalla |
| 4.1.3 Mensajes de estado | Enterarse de que un monto se duplicó o se eliminó sin perder el foco (criterios 9 y 11) | Duplicar y eliminar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Nombre de la lista | `Montos` |
| Orden de la lista | `Del vencimiento más antiguo al más reciente.` |
| Monto visible | `$ 15.000,00` · `US$ 15.000,00` |
| Monto hablado | `15000 pesos` · `15000,50 pesos` · `1 peso` · `1 dólar` · `1200 dólares` |
| Vencimiento visible | `Vence el 10/11/2026` |
| Vencimiento hablado | `Vence el 10 de noviembre de 2026` |
| Interruptor | `Pagado` |
| Botón del menú | `⋮` (sin texto visible) |
| Opciones del menú | `Editar` · `Duplicar` · `Eliminar` |
| Nombres que anuncia el lector | `Pagado: monto 3, 15000 pesos` · `Acciones del monto 3, 15000 pesos` |
| Confirmación al eliminar | `¿Eliminar el monto de 15000 pesos que vence el 10 de noviembre de 2026?` |
| Anuncio al duplicar | `Monto duplicado. Vence el 10 de enero de 2027.` |
| Anuncio al eliminar | `Monto eliminado.` |
| Lista vacía | `Todavía no agregaste montos. Agregá el primero.` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

## Definition of Ready

- [ ] Los criterios se pueden testear sin interpretar
- [ ] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [ ] Textos revisados contra voz y tono y glosario
- [ ] Criterios de accesibilidad identificados
- [ ] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [ ] Se leyó `docs/sdd/learnings.md`
