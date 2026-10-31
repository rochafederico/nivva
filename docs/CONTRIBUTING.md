# Guía de contribución

Nivva se construye con desarrollo guiado por specs. Las reglas completas
están en [`AGENTS.md`](../AGENTS.md) y el ciclo de trabajo en
[`docs/sdd/flujo.md`](./sdd/flujo.md). Este documento resume ramas, CI y
la configuración de GitHub.

## Ramas

`main` es la única rama base. Cada PR sale de `main` o se apila sobre
otro PR abierto.

| Tipo | Patrón |
|------|--------|
| Iteración (spec, plan, tareas, retro) | `it/NNN-descripcion` |
| Cambios al flujo | `sdd/NN-descripcion` |
| Hotfix en producción | `hotfix/descripcion-corta` |

Un PR apilado se cambia de base a `main` cuando se mergea el anterior.

## Checks de CI

| Workflow | Job | Qué valida |
|----------|-----|------------|
| `ci.yml` | `lint` | `npm run lint` |
| `ci.yml` | `test` | `npm test` |
| `pr-size.yml` | `pr-size` | Límites de `.sdd/limits.json`: 10 archivos, 200 líneas por PR y 100 líneas por archivo de código. Además, un PR que cambia reglas (`.sdd/`, el script o los workflows) no puede tocar otros archivos |
| `validacion-humana.yml` | `validado` | Que un humano haya puesto la etiqueta `validado` |

Para verificar el tamaño antes de abrir el PR:

```bash
node scripts/check-pr-size.mjs                    # contra origin/main
SDD_BASE=otra-rama node scripts/check-pr-size.mjs # PR apilado
```

## Configuración manual en GitHub

Esto no se puede definir desde archivos del repo. Se hace una vez.

1. **Etiqueta**: crear la etiqueta `validado` en _Issues > Labels_.
2. **Protección de `main`** en _Settings > Branches_ (o _Rules_):
   - Require a pull request before merging.
   - Require status checks to pass: `lint`, `test`, `pr-size`, `validado`.
   - Require branches to be up to date before merging.
   - Block force pushes.

Con una sola persona en el repo, GitHub no deja aprobar los propios PRs:
por eso la validación humana es la etiqueta y no una aprobación de review.
