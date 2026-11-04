---
id: 005-pestana-actualizada
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#306"
---

# 005 — Seguir usando Nivva cuando otra pestaña se actualiza

## Historia

Como **persona que deja Nivva abierto en varias pestañas**, quiero **que cada
pestaña siga funcionando cuando otra se actualiza**, para **no perder lo que
estoy cargando ni tener que recargar la página**.

## Contexto

Cuando una versión nueva de Nivva abre en otra pestaña y actualiza cómo se
guardan los datos, la pestaña que ya estaba abierta deja de poder leer y
guardar hasta que se recarga. La persona no recibe ninguna explicación.

## Alcance

- Incluye: seguir leyendo y guardando en la pestaña que ya estaba abierta, sin
  recargar ni hacer nada.
- No incluye: mostrar en una pestaña, sin que cambie nada en ella, lo que se
  cargó en otra; avisar que hay una versión nueva.

## Criterios de aceptación

1. **Dado** Nivva abierto en una pestaña, **cuando** otra pestaña actualiza cómo
   se guardan los datos, **entonces** la primera sigue abierta, no se recarga y
   no muestra ningún aviso.
2. **Dado** ese caso, **cuando** se agrega, edita o elimina un movimiento en la
   primera pestaña, **entonces** se guarda, y el resumen y la lista se actualizan
   como siempre.
3. **Dado** un formulario abierto con datos escritos, **cuando** ocurre ese caso,
   **entonces** lo escrito se conserva, el foco no se mueve y se puede guardar
   normalmente.
4. **Dado** ese caso, **cuando** se cambia de mes o de sección en la primera
   pestaña, **entonces** se ven los datos guardados, sin ninguno perdido.
5. **Dado** que no se puede volver a acceder a los datos, **cuando** se intenta
   guardar, **entonces** se ve el mensaje de error que esa acción ya tiene hoy,
   lo escrito se conserva y se puede intentar de nuevo.

## Escenarios

- Error: el del criterio 5.
- Vacío: no cambia.
- Mobile: no cambia lo que se ve.

## Accesibilidad (WCAG 2.2 AA)

Ver `docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| 2.4.3 Orden del foco | Seguir donde estaba cuando otra pestaña se actualiza (criterio 3) | Dejar el foco en un campo y actualizar desde otra pestaña |
| 3.3.3 Sugerencia ante errores | Saber que no se guardó y poder reintentar (criterio 5) | Provocar el error y volver a guardar |

## Textos de UI

No hay textos nuevos.

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
