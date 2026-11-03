---
id: 004-accesibilidad-home-resto
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#265"
---

# 004 — Terminar de recorrer Nivva con lector de pantalla y teclado

## Historia

Como **persona que usa Nivva con lector de pantalla o teclado**, quiero
**moverme rápido, escuchar solo lo que aporta y enterarme de lo que cambia**,
para **usar la app sin perderme ni volver atrás a revisar**.

## Contexto

Cubre lo que la iteración 003 deja afuera del #260: la prioridad baja y lo
que el análisis no pudo evaluar sin usar la app. Algunos de estos puntos
quizás ya funcionan: el criterio dice cómo tiene que ser y, si ya se cumple,
alcanza con probarlo.

## Alcance

- Incluye: Home, ventanas, formularios y encabezado de la app.
- No incluye: lo que cubre la 003 ni los cambios visuales del #259.

## Criterios de aceptación

### Lectura

1. **Dado** una fila con iniciales, **cuando** el lector la lee,
   **entonces** no dice las iniciales: empieza por el nombre.
2. **Dado** los datos del detalle (Acreedor, Tipo de deuda, Moneda, Próximo
   vencimiento, Notas) y los del resumen del mes, **cuando** el lector los
   recorre, **entonces** anuncia cada nombre unido a su valor.
3. **Dado** un interruptor, **cuando** se ve o se escucha, **entonces** su
   estado coincide con el monto guardado, también después de volver a
   dibujarse la lista. Al tocar la etiqueta de un control se activa ese
   control y ningún otro.

### Navegación

4. **Dado** cualquier pantalla, **cuando** se presiona `Tab` por primera
   vez, **entonces** aparece `Saltar al contenido` y, al activarlo, el foco
   pasa al contenido principal.
5. **Dado** el encabezado, **cuando** el lector anuncia su navegación,
   **entonces** la llama `Navegación principal`.
6. **Dado** un enlace que abre otra pestaña (GitHub o WhatsApp), **cuando**
   el lector lo anuncia, **entonces** agrega `, se abre en otra pestaña` a
   su nombre.
7. **Dado** una pantalla de la app, **cuando** se llega a ella, **entonces**
   el título de la pestaña del navegador dice su nombre, seguido de
   `· Nivva`. En el Home, también la pestaña elegida (`Acreedores · Nivva`).

### Ventanas

8. **Dado** una ventana que se abre, **cuando** termina de abrirse,
   **entonces** el foco está dentro de ella; `Tab` y `Mayús + Tab` no salen
   hasta cerrarla y `Escape` la cierra.
9. **Dado** una ventana que se cierra, **cuando** se abrió desde una fila,
   **entonces** el foco vuelve a esa fila aunque la lista se haya vuelto a
   dibujar. Si la fila ya no está, pasa a la siguiente; si no hay, a la
   anterior; si la lista quedó vacía, al botón +.

### Errores y avisos

10. **Dado** un formulario con errores, **cuando** se intenta guardar,
    **entonces** el foco pasa al primer campo con error y el lector anuncia
    que no es válido y qué hay que corregir. Al corregirlo, el aviso se va.
11. **Dado** un aviso de la app, **cuando** aparece, **entonces** el lector
    lo anuncia sin mover el foco y sin leer el emoji.
12. **Dado** el selector de mes, **cuando** se cambia, **entonces** el lector
    anuncia, sin mover el foco, `Mostrando noviembre de 2026.`
13. **Dado** que se marca un pago, **cuando** se actualiza el resumen,
    **entonces** el lector anuncia solo el aviso del pago, una vez, y al
    recorrer el resumen escucha los valores nuevos.

### Contraste

14. **Dado** el Home y las ventanas, **cuando** se revisa el contraste a
    mano, **entonces** el texto alcanza 4,5:1 (3:1 si es grande) y los
    controles y el foco alcanzan 3:1. Lo que no alcance se corrige.

## Escenarios

- Error: si falla el guardado, el aviso de error se anuncia como en el
  criterio 11 y el foco no se mueve.
- Vacío: sin filas, al cerrar una ventana el foco va al botón +.
- Mobile: a 320 px, `Saltar al contenido` entra completo en la pantalla.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 1.3.1 Info y relaciones | Escuchar cada dato con su nombre (2) | Recorrer con lector de pantalla |
| 1.4.3 y 1.4.11 Contraste | Distinguir textos y controles (14) | Revisar el contraste a mano |
| 2.1.2 Sin trampas de teclado | Salir de la ventana con `Escape` (8) | Recorrer solo con teclado |
| 2.4.1 Evitar bloques | Saltear el encabezado (4) | Usar `Tab` al entrar |
| 2.4.2 Título de la página | Saber dónde está sin leer la pantalla (7) | Cambiar de pantalla y de pestaña |
| 2.4.3 Orden del foco | No perder el foco al abrir y cerrar ventanas (8, 9) | Abrir, editar y cerrar con teclado |
| 3.2.5 Cambios a petición | Saber que se abre otra pestaña (6) | Escuchar los enlaces |
| 3.3.1 y 3.3.3 Errores | Saber qué campo corregir y cómo (10) | Guardar un formulario incompleto |
| 4.1.3 Mensajes de estado | Enterarse de lo que cambia (11, 12, 13) | Usar la app con lector de pantalla |

## Textos de UI

| Lugar | Texto |
|---|---|
| Enlace para saltar | `Saltar al contenido` |
| Navegación, para el lector | `Navegación principal` |
| Enlace externo, para el lector | `, se abre en otra pestaña` |
| Título de la pestaña | `Acreedores · Nivva` |
| Cambio de mes, para el lector | `Mostrando noviembre de 2026.` |

## Preguntas abiertas

Deben quedar vacías antes de aprobar.

1. Los datos del resumen muestran solo `$` y el total aclara ARS. ¿Se indica
   la moneda en el resumen y qué pasa con los montos en dólares? Conviene
   decidirlo junto con el hallazgo de moneda del #259; si se decide ahí, sale
   de esta spec.

## Definition of Ready

- [ ] Los criterios se pueden testear sin interpretar
- [ ] El alcance entra en una iteración (8 tareas o menos)
- [ ] No hay preguntas abiertas
- [ ] Textos revisados contra voz y tono y glosario
- [ ] Criterios de accesibilidad identificados
- [ ] Sin referencias a código, componentes, HTML, ARIA, funciones ni datos internos
- [ ] Se leyó `docs/sdd/learnings.md`
