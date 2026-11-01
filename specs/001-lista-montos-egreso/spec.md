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
  - Importe y vencimiento con formato, y casilla "Pagado" visible.
  - Acción "Editar" visible y menú "Más acciones" con Duplicar y Eliminar.
  - Duplicar con vencimiento en el mes siguiente al último monto.
  - Mensaje cuando no hay montos.
  - Que la lista no tenga scroll propio.
- No incluye (iteración 002):
  - Agregar o editar un monto (se sigue abriendo igual que hoy y la lista
    se oculta mientras está abierto).
  - Qué pasa al tocar "Guardar" del egreso con un monto abierto.
  - Los botones del pie de la ventana y el mensaje "Debe agregar al menos
    un monto".
  - La pregunta "¿Cancelar los cambios actuales?".
- No incluye (nunca en esta spec): la vista de detalle del egreso ni las
  listas del resumen del mes.

## Criterios de aceptación

"Monto N" es la posición del monto en la lista, empezando en 1.

1. **Dado** un egreso con montos cargados, **cuando** se abre "Editar
   egreso", **entonces** los montos aparecen como una lista llamada
   "Montos", una fila por monto, ordenada del vencimiento más cercano al
   más lejano. El lector de pantalla la anuncia como lista e indica
   cuántos montos tiene.
2. **Dado** un monto de 15000 pesos que vence el 10 de noviembre de 2026,
   **cuando** se ve su fila, **entonces** muestra `$ 15.000,00` y
   `Vence 10/11/2026`. Uno de 15000 dólares muestra `US$ 15.000,00`. La
   moneda no se muestra aparte.
3. **Dado** un monto, **cuando** el lector de pantalla lee su importe,
   **entonces** lo dice en la forma hablada: la cifra sin separador de
   miles, con decimales solo si tiene centavos, y el nombre de la moneda
   (`15000 pesos`, `15000,50 pesos`, `1200 dólares`). El separador de
   decimales es el de la región de la persona (en Argentina, la coma).
   Nunca lee `$` ni `US$`, porque en español el lector dice "dólares"
   también para `$`.
4. **Dado** un monto, **cuando** se ve su fila, **entonces** tiene una
   casilla con la etiqueta visible "Pagado", marcada si el monto está
   pagado, que es la única indicación del estado (no hay otro texto
   "Pagado" o "Pendiente"). Al cambiarla, el estado queda así cuando se
   guarda el egreso (como hoy) y el foco sigue en la casilla.
5. **Dado** un monto, **cuando** se toca "Editar" en su fila, **entonces**
   se abre la edición de ese monto, igual que hoy con ✎.
6. **Dado** un egreso cuyo último monto vence en diciembre de 2026,
   **cuando** se duplica un monto que vence el día 10, **entonces**
   aparece un monto nuevo con el mismo importe y moneda, sin marcar como
   pagado, que vence el 10/01/2027: mismo día que el monto duplicado, en
   el mes siguiente al último vencimiento de la lista.
7. **Dado** que se duplica un monto que vence el día 31 y el mes siguiente
   tiene menos días, **cuando** se calcula el vencimiento, **entonces**
   vence el último día de ese mes (por ejemplo, 28/02/2027).
8. **Dado** un monto, **cuando** se usa su botón "Más acciones",
   **entonces** se abre un menú con "Duplicar" y "Eliminar" que funciona
   así con teclado y mouse:
   - `Enter`, `Espacio`, flecha abajo o un clic lo abren con el foco en
     "Duplicar"; flecha arriba lo abre con el foco en "Eliminar".
   - Con el menú abierto, flecha abajo y flecha arriba pasan de una
     opción a otra y, al llegar a una punta, siguen por la otra; `Inicio`
     va a la primera y `Fin` a la última.
   - `Escape` cierra solo el menú y el foco vuelve a "Más acciones"; la
     ventana del egreso sigue abierta.
   - `Tab` cierra el menú y el foco sigue su orden normal; un clic afuera
     lo cierra sin mover el foco.
   - Nunca hay más de un menú abierto a la vez.
   - El lector anuncia el botón como menú, si está abierto o cerrado, y
     cada opción como opción de menú.
9. **Dado** que se duplicó un monto, **cuando** la lista se actualiza,
   **entonces** el foco pasa a "Editar" del monto nuevo y el lector anuncia,
   sin mover el foco, `Monto duplicado. Vence el 10/01/2027.`
10. **Dado** un monto, **cuando** se elige "Eliminar" en su menú,
    **entonces** aparece una confirmación con el texto
    `¿Eliminar el monto de 15000 pesos que vence el 10/11/2026?` (importe
    en la forma hablada del criterio 3). Si se acepta, el monto sale de
    la lista; si se cancela, no cambia nada y el foco vuelve a "Más
    acciones".
11. **Dado** que se eliminó un monto, **cuando** la lista se actualiza,
    **entonces** el foco pasa a "Editar" del monto siguiente; si no hay
    siguiente, al del anterior; si la lista quedó vacía, a "Agregar
    monto". El lector anuncia, sin mover el foco, `Monto eliminado.`
12. **Dado** un egreso sin montos, **cuando** se ve la sección de montos,
    **entonces** dice `Todavía no agregaste montos.` en lugar de la lista
    y "Agregar monto" sigue disponible.
13. **Dado** un egreso con muchos montos, **cuando** se ve la lista,
    **entonces** se recorre con el scroll de la ventana del egreso: la
    lista no tiene un scroll propio.
14. **Dado** el monto 3 de la lista, de 15000 pesos, **cuando** el lector
    de pantalla anuncia los controles de su fila, **entonces** dice
    `Editar monto 3 de 15000 pesos`, `Más acciones para el monto 3 de
    15000 pesos` y `Pagado: monto 3 de 15000 pesos`. Cada nombre empieza
    con el texto que se ve en pantalla.
15. **Dado** un monto sin un vencimiento válido (por ejemplo, de datos
    viejos o importados), **cuando** se abre el egreso, **entonces** ese
    monto no aparece en la lista, no se cuenta para la numeración del
    criterio 14 ni para el último vencimiento del criterio 6. El
    formulario de monto ya no deja agregar uno sin vencimiento (como hoy).

## Escenarios

- Error: un monto sin vencimiento válido no se ve en la lista
  (criterio 15).
- Vacío: criterio 12.
- Mobile: a 320 px de ancho cada fila se lee completa (importe,
  vencimiento, casilla y acciones) sin scroll horizontal; las acciones
  pueden pasar a una segunda línea dentro de la fila.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar los montos como una lista llamada "Montos", la casilla con su etiqueta y la moneda por su nombre (criterios 1 y 3) | Recorrer la lista con lector de pantalla |
| 1.4.3 Contraste mínimo | Leer importe, vencimiento y textos de la fila sobre su fondo | Revisar el contraste a mano |
| 1.4.10 Reflow | Usar la lista a 320 px sin scroll horizontal ni scroll interno | Achicar la ventana a 320 px o usar zoom al 400 % |
| 1.4.11 Contraste no textual | Distinguir el borde de la fila, la casilla y el foco | Revisar el contraste a mano |
| 2.1.1 Teclado | Editar, abrir el menú, elegir una opción y marcar "Pagado" sin mouse (criterio 8) | Recorrer la fila solo con teclado |
| 2.4.3 Orden del foco | Saber dónde queda el foco después de cada acción (criterios 4, 8, 9, 10 y 11) | Duplicar, eliminar y cancelar con teclado |
| 2.4.7 Foco visible | Ver dónde está el foco en botones, opciones del menú y casilla | Recorrer la fila con `Tab` |
| 2.5.3 Etiqueta en el nombre | Activar cada control por voz diciendo el texto que ve (criterio 14) | Escuchar los nombres con lector de pantalla |
| 2.5.8 Tamaño del objetivo | Tocar botones y casilla sin errar | Usar la lista con el dedo en un teléfono |
| 4.1.2 Nombre, función, valor | Saber qué es cada control, cómo se llama y su estado, incluido si el menú está abierto (criterio 8) | Escuchar los controles con lector de pantalla |
| 4.1.3 Mensajes de estado | Enterarse de que un monto se duplicó o se eliminó sin perder el foco (criterios 9 y 11) | Duplicar y eliminar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Nombre de la lista | `Montos` |
| Importe visible | `$ 15.000,00` · `US$ 15.000,00` |
| Importe hablado (lector de pantalla y confirmación) | `15000 pesos` · `15000,50 pesos` · `1200 dólares` |
| Vencimiento en la fila | `Vence 10/11/2026` |
| Casilla | `Pagado` |
| Botón de la fila | `Editar` |
| Botón del menú | `Más acciones` |
| Opciones del menú | `Duplicar` · `Eliminar` |
| Nombres que anuncia el lector | `Editar monto 3 de 15000 pesos` · `Más acciones para el monto 3 de 15000 pesos` · `Pagado: monto 3 de 15000 pesos` |
| Confirmación al eliminar | `¿Eliminar el monto de 15000 pesos que vence el 10/11/2026?` |
| Anuncio al duplicar | `Monto duplicado. Vence el 10/01/2027.` |
| Anuncio al eliminar | `Monto eliminado.` |
| Lista vacía | `Todavía no agregaste montos.` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

- Un monto sin vencimiento válido que no aparece en la lista (criterio
  15): al guardar el egreso, ¿se conserva tal cual o se borra?

## Definition of Ready

- [ ] Los criterios se pueden testear sin interpretar
- [ ] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [ ] Textos revisados contra voz y tono y glosario
- [ ] Criterios de accesibilidad identificados
- [ ] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [ ] Se leyó `docs/sdd/learnings.md`
