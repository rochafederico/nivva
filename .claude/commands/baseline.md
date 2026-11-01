---
description: Documentar cómo funciona hoy un área ya construida
argument-hint: <área>
---

Documentá el comportamiento actual del área: $ARGUMENTS

**Confirmación (ver `AGENTS.md`):** antes de crear o modificar archivos,
mostrá qué vas a cambiar y esperá un "sí". Antes de commitear, pushear,
abrir el PR o crear issues o comentarios, mostrá el resumen y esperá el OK.

Esto no cambia código. Describe lo que la app hace hoy para que un humano
valide si es lo que quiere.

1. `git fetch origin` y rama `sdd/baseline-<area>` desde `origin/main`.
2. Leé el código del área en `src/features/` y `src/pages/`, y sus tests.
   El código y los tests son la fuente de verdad; el README no.
3. Escribí `specs/000-baseline/<area>.md` con la plantilla de spec,
   `estado: baseline`, y criterios en forma Dado/Cuando/Entonces que
   describan el comportamiento real, incluidos casos borde.
4. Por cada criterio, anotá qué test lo cubre o "sin test".
5. Agregá una sección **Divergencias** con lo que parezca un error, no cumpla
   WCAG 2.2 AA (con el número de criterio, ver `docs/sdd/accesibilidad.md`), no
   coincida con la documentación o con la constitución. No lo corrijas.
6. Sumá el área al índice `specs/000-baseline/README.md`.
7. Si el área no entra en 200 líneas, partila en varias baselines.
8. Corré `node scripts/check-pr-size.mjs` y abrí el PR. No lo mergees.
