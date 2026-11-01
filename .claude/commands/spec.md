---
description: Paso 1 — escribir la spec de una iteración nueva
argument-hint: <issue o descripción>
---

Escribí la spec de una iteración para: $ARGUMENTS

1. `git fetch origin` y partí de `origin/main` actualizado.
2. Leé `docs/sdd/learnings.md`, `docs/sdd/constitucion.md` y las specs
   relacionadas en `specs/` (incluida la baseline del área).
3. Si hay un issue, leelo con `gh issue view`.
4. Elegí el próximo número libre `NNN` y creá la rama `it/NNN-descripcion`.
5. Antes de escribir, hacé las preguntas necesarias para que no queden
   criterios ambiguos. No inventes comportamiento: si no sabés, preguntá.
6. Copiá `docs/sdd/plantillas/spec.md` a `specs/NNN-descripcion/spec.md`
   y completala con `estado: borrador`.
7. Si los criterios no entran en 8 tareas, proponé partir la spec.
8. Solo ese archivo cambia en este PR. Corré `node scripts/check-pr-size.mjs`.
9. Abrí el PR hacia `main` con la plantilla. No lo mergees.

Terminá diciendo qué tiene que validar el humano y que, cuando mergee,
el siguiente paso es `/plan NNN`.
