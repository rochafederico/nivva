---
id: NNN-descripcion
estado: borrador   # borrador | aprobada | implementada | baseline
issue: "#000"
---

# NNN — Título en lenguaje de usuario

<!-- La spec es 100 % funcional: describe lo que la persona ve, escucha
con lector de pantalla y puede hacer. Sin código, componentes, HTML, ARIA,
funciones ni campos de datos: eso va en plan.md. Regla práctica: si alguien
que no programa lo puede comprobar usando la app, va acá. -->

## Historia

Como **persona**, quiero **acción** para **beneficio**.

## Contexto

Por qué ahora y qué problema real resuelve. Una o dos frases.

## Alcance

- Incluye: …
- No incluye: …

## Criterios de aceptación

Cada uno describe lo que percibe o hace la persona y se puede probar
usando la app, sin conocer el código.

1. **Dado** … **cuando** … **entonces** …
2. **Dado** … **cuando** … **entonces** …

## Escenarios

- Error: …
- Vacío: …
- Mobile: …

## Accesibilidad (WCAG 2.2 AA)

Criterios que toca esta funcionalidad, en términos de lo que la persona
tiene que poder hacer. La técnica va en el plan. Ver
`docs/sdd/accesibilidad.md`.

| Criterio | Qué tiene que poder hacer la persona | Cómo se comprueba usando la app |
|---|---|---|
| … | … | … |

## Textos de UI

| Lugar | Texto |
|---|---|
| … | … |

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
