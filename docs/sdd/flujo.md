# Flujo de trabajo guiado por specs

Cada cambio de comportamiento de Nivva pasa por una **iteración**: una spec
chica que se aprueba, se planifica, se implementa de a una tarea y se cierra
con una retro. Cada paso es un PR que un humano valida y mergea.

```
issue → spec → plan y tareas → tarea 1 … tarea N → retro → learnings
         PR       PR             PR        PR       PR
```

## Pasos de una iteración

Carpeta: `specs/NNN-descripcion/`. Rama base de cada PR: `it/NNN-descripcion`
(o una rama apilada sobre la anterior).

| Paso | Comando | Archivo | Equivale a | Se aprueba cuando |
|---|---|---|---|---|
| 1. Spec | `/spec` | `spec.md` | Historia + escenarios + DoR | se mergea el PR |
| 2. Plan y tareas | `/plan` | `plan.md`, `tareas.md` | Tareas | se mergea el PR |
| 3. Implementación | `/implementar` | código y tests | — | se mergea cada PR |
| 4. Cierre | `/retro` | `retro.md`, `docs/sdd/learnings.md` | DoD + aprendizaje | se mergea el PR |

Reglas:

- No se empieza un paso si el anterior no está mergeado en `main`.
- Una spec cubre algo que se termina en uno o dos días. Si `tareas.md`
  tiene más de 8 tareas, la spec se parte en dos iteraciones.
- Cada tarea entra en un PR dentro de los límites de `.sdd/limits.json`.
  Si una tarea no entra, se divide en `tareas.md` antes de implementarla.
- Si durante la implementación la spec resulta incompleta o equivocada,
  se frena y se abre un PR que corrige la spec.

## Estados de una spec

- **borrador**: está en un PR abierto.
- **aprobada**: mergeada en `main`, con tareas pendientes.
- **implementada**: todas sus tareas mergeadas y la retro hecha.
- **baseline**: describe comportamiento que ya existía antes de este flujo.

El estado vive en el encabezado de `spec.md`, pero la aprobación real es
el merge: un agente no puede aprobar nada cambiando un campo.

## Línea base (lo que ya estaba construido)

Lo existente no se reescribe. Con `/baseline` se documenta un área de la
app tal como funciona hoy, a partir del código y los tests, en
`specs/000-baseline/<area>.md`. El humano valida que eso sea lo que quiere.
Lo que no le guste se anota como **divergencia** y se convierte en una
iteración nueva; la spec baseline no se corrige.

## Backlog

Los issues de GitHub siguen siendo el backlog (épicas e historias). Cada
spec enlaza el issue que resuelve. El refinamiento (DoR, escenarios, DoD)
que antes vivía en los prompts de la wiki ahora está en las plantillas
de `docs/sdd/plantillas/`.

## Aprendizaje

Cada iteración termina con `/retro`, que responde preguntas fijas y suma
lo aprendido a `docs/sdd/learnings.md` con un contador. Cuando un
aprendizaje aparece **dos veces**, se promueve a regla: en la constitución,
en una plantilla, en `AGENTS.md` o en un hook. Esa promoción es su propio PR
chico y, una vez hecha, el aprendizaje se borra de `learnings.md`.

Los límites también se ajustan así: con evidencia de las retros, por PR.
