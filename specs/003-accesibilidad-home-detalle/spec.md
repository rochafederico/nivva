---
id: 003-accesibilidad-home-detalle
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#264"
---

# 003 — Entender y usar el Home y el detalle del egreso sin ver la pantalla ni usar el mouse

## Historia

Como **persona que usa Nivva con lector de pantalla, teclado, zoom o el
dedo**, quiero **saber qué es cada control, a qué egreso corresponde y qué
montos están pagos**, para **manejar mis pagos del mes sin equivocarme ni
depender de lo que se ve**.

## Contexto

El análisis del #260 encontró que todas las ventanas se anuncian con el
mismo nombre, que el aviso de vencimientos no se escucha y que los
interruptores de pago no dicen a qué monto corresponden. Esta iteración
cubre sus hallazgos de prioridad alta y media. El resto queda en la 004.

## Alcance

- Incluye: el Home y la ventana "Detalle del egreso", y el nombre y el
  nivel de título de todas las ventanas de la app.
- No incluye:
  - Prioridad baja y puntos sin evaluar del #260 (iteración 004).
  - Los cambios visuales del #259: acción explícita para pagar, señales de
    urgencia y reordenar las pestañas.
  - Agregar y editar montos (iteración 002).

## Criterios de aceptación

El monto y la fecha hablados son los de la spec 001: `15000 pesos`,
`10 de noviembre de 2026`.

### Ventanas

1. **Dado** cualquier ventana de la app, **cuando** se abre, **entonces**
   el lector la anuncia con el título que se ve en ella ("Detalle del
   egreso" se anuncia "Detalle del egreso", no "Enviar comentario"). Si una
   ventana se abre sobre otra, se anuncia con su propio título.
2. **Dado** una ventana abierta, **cuando** se recorre por títulos con el
   lector, **entonces** su título aparece en el nivel 2 y, en el detalle,
   "Montos" aparece como título de nivel 3.

### Aviso de vencimientos

3. **Dado** el botón de vencimientos próximos, **cuando** el lector lo
   anuncia, **entonces** dice:
   - sin vencimientos próximos: `Ver vencimientos próximos`;
   - con vencimientos próximos y ninguno vencido:
     `Ver vencimientos próximos, hay pendientes`;
   - con montos vencidos: `Ver vencimientos próximos, 2 vencidos`, o
     `1 vencido` si hay uno, el mismo número que muestra el punto rojo.
4. **Dado** que cambia la situación de vencimientos, **cuando** se vuelve
   al botón, **entonces** el lector anuncia el nombre actualizado.

### Interruptores de pago

5. **Dado** un monto de 15000 pesos de Edenor que vence el 10 de noviembre
   de 2026, **cuando** el lector anuncia su interruptor en el Home,
   **entonces** dice `Pagado, Edenor, 15000 pesos, vence el 10 de noviembre
   de 2026`, que es un interruptor y si está activado.
6. **Dado** un interruptor, **cuando** se toca dentro de un área de al
   menos 24 × 24 px a su alrededor, **entonces** cambia el estado y no se
   abre el detalle. Un toque en el resto de la fila abre el detalle, como
   hoy.

### Montos del detalle

7. **Dado** un egreso con muchos montos, **cuando** se ve el detalle,
   **entonces** los montos no tienen un scroll propio: se recorren con el
   scroll de la ventana. Solo con teclado se llega hasta el último monto y
   hasta los botones del final.
8. **Dado** un monto en el detalle, **cuando** se ve su fila, **entonces**
   una columna "Estado" dice con texto `Pagado`, `Pendiente`, `Vencido` o
   `Vence hoy`, con la misma regla que la lista del Home. El lector la
   anuncia junto con el nombre de la columna.
9. **Dado** el detalle de un egreso, **cuando** se compara "Total
   pendiente" con la tabla, **entonces** el total es la suma de los montos
   que no dicen `Pagado`, por moneda.

### Lista y pestañas del Home

10. **Dado** la lista de movimientos, **cuando** el lector llega a ella,
    **entonces** la anuncia con el nombre "Movimientos" e indica cuántos
    tiene. En cada fila lee nombre, fecha, monto y estado, en ese orden.
11. **Dado** el Home, **cuando** se recorre por títulos con el lector,
    **entonces** hay un título de nivel 1 y no se saltean niveles. Los
    nombres de las filas de movimientos y de acreedores no son títulos.
12. **Dado** las pestañas "Este mes" y "Acreedores", **cuando** se elige
    una, **entonces** lo que depende de ella (en "Este mes": el resumen,
    las pestañas "Todo", "Ingresos" y "Egresos" y la lista) se anuncia como
    contenido de esa pestaña. Lo que cambia con "Todo", "Ingresos" o
    "Egresos" se anuncia con el nombre de la elegida.

### Fechas

13. **Dado** una fecha en el detalle (vencimiento de un monto o "Próximo
    vencimiento"), **cuando** se ve, **entonces** dice `10/11/2026`. En la
    lista sigue diciendo `10 nov`. En ambos casos el lector dice `10 de
    noviembre de 2026`. Cuando no hay fecha se ve `—` y el lector dice
    `Sin fecha`.

### Zoom y foco

14. **Dado** una pantalla de 320 px de ancho, **cuando** se ven el Home y el
    detalle con los montos más largos que se pueden cargar, **entonces** no
    hay scroll horizontal y ningún monto ni título queda cortado:
    "Deuda total acumulada", su monto y "Por pagar este mes" se leen
    completos, en más de una línea si hace falta.
15. **Dado** una altura visible de 256 px o menos (por ejemplo, zoom al
    400 %), **cuando** se hace scroll en el Home, **entonces** la barra de
    deuda total deja de quedar fija y no le quita lugar al contenido.
16. **Dado** que se recorre el Home con `Tab` en cualquier sentido,
    **cuando** el foco llega a un control, **entonces** queda visible, sin
    quedar debajo de la barra fija ni del botón +.
17. **Dado** el final de la lista, **cuando** se llega con scroll hasta
    abajo, **entonces** la última fila se ve y se toca completa: el botón +
    no la tapa.

## Escenarios

- Error: si no se puede guardar el pago, el interruptor vuelve a su estado
  anterior, como hoy, y el lector lo anuncia con ese estado.
- Vacío: sin movimientos, se ve el mensaje de hoy y no se anuncia una lista.
  Un egreso sin montos muestra `—` en "Total pendiente".
- Mobile: a 320 px, la tabla del detalle entra sin scroll horizontal, con
  la columna "Estado" incluida.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.1.1 Contenido no textual | Enterarse del aviso que solo se ve como punto rojo (3) | Escuchar el botón con lector de pantalla |
| 1.3.1 Info y relaciones | Escuchar títulos, listas, pestañas y columnas como lo que son (2, 8, 10, 11, 12) | Recorrer con lector de pantalla |
| 1.4.10 Reflow | Usar el Home y el detalle a 320 px sin perder información (14, 15) | Ancho de 320 px y zoom al 400 % |
| 2.1.1 Teclado | Llegar a todos los montos del detalle (7) | Recorrer solo con teclado |
| 2.4.6 Encabezados y etiquetas | Saber a qué monto corresponde cada interruptor (5) | Recorrer los interruptores con lector |
| 2.4.11 Foco no tapado | Ver siempre el control con foco (16, 17) | Recorrer con `Tab` y `Mayús + Tab` |
| 2.5.8 Tamaño del objetivo | Tocar el interruptor sin abrir el detalle (6) | Usarlo con el dedo en un teléfono |
| 4.1.2 Nombre, función, valor | Saber qué es cada ventana y control, y su estado (1, 3, 4, 5, 12) | Escuchar con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Botón de vencimientos, para el lector | `Ver vencimientos próximos` · `Ver vencimientos próximos, hay pendientes` · `Ver vencimientos próximos, 2 vencidos` · `Ver vencimientos próximos, 1 vencido` |
| Interruptor del Home, para el lector | `Pagado, Edenor, 15000 pesos, vence el 10 de noviembre de 2026` |
| Columna del detalle | `Estado` |
| Estados | `Pagado` · `Pendiente` · `Vencido` · `Vence hoy` |
| Nombre de la lista, para el lector | `Movimientos` |
| Fecha en el detalle | `10/11/2026` |
| Fecha en la lista | `10 nov` |
| Fecha hablada | `10 de noviembre de 2026` · `Sin fecha` |

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
