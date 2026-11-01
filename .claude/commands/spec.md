---
description: Paso 1 — escribir la spec de una iteración nueva
argument-hint: <issue o descripción>
---

Escribí la spec de una iteración para: $ARGUMENTS

**Confirmación (ver `AGENTS.md`):** antes de crear o modificar archivos,
mostrá qué vas a cambiar y esperá un "sí". Antes de commitear, pushear,
abrir el PR o crear issues o comentarios, mostrá el resumen y esperá el OK.

1. `git fetch origin` y partí de `origin/main` actualizado.
2. Leé `docs/sdd/learnings.md`, `docs/sdd/constitucion.md`,
   `docs/sdd/accesibilidad.md` y las specs relacionadas en `specs/`
   (incluida la baseline del área). Podés leer el código para entender
   cómo funciona hoy, pero lo describís en palabras de la persona.
3. Si hay un issue, leelo con `gh issue view`. Si no hay, lo creás en
   el paso 10: toda spec nueva tiene su issue.
4. Elegí el próximo número libre `NNN` y creá la rama `it/NNN-descripcion`.
5. Antes de escribir, hacé las preguntas necesarias para que no queden
   criterios ambiguos. No inventes comportamiento: si no sabés, preguntá.
6. Copiá `docs/sdd/plantillas/spec.md` a `specs/NNN-descripcion/spec.md`
   y completala con `estado: borrador`.
   - **La spec es 100 % funcional.** Describe lo que la persona ve, escucha
     con lector de pantalla y puede hacer con mouse, dedo o teclado.
   - Nunca escribas nombres de archivos, componentes, funciones, etiquetas
     HTML, atributos ARIA, campos de datos ni formatos internos. Eso lo
     decide el plan.
   - Sí van: textos exactos, formatos visibles (`$ 15.000,00`), qué se
     anuncia, qué teclas hacen qué y dónde queda el foco.
   - Antes de abrir el PR, releé la spec buscando referencias técnicas y
     reescribilas como comportamiento.
7. Si los criterios no entran en 8 tareas, proponé partir la spec.
8. Solo ese archivo cambia en este PR. Corré `node scripts/check-pr-size.mjs`.
9. Abrí el PR hacia `main` con la plantilla. No lo mergees.
10. Si la spec no salió de un issue, creá uno con `gh issue create`:
    título igual al de la spec y cuerpo **solo con el link** a
    `specs/NNN-descripcion/spec.md` en `main`. No copies la spec al
    issue: el detalle vive en el repo. Enlazá el issue en la descripción
    del PR.

Terminá diciendo qué tiene que validar el humano y que, cuando mergee,
el siguiente paso es `/plan NNN`.
