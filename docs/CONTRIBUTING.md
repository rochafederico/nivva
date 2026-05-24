# Guía de contribución — Flujo de ramas y CI

Este documento describe el flujo de ramas que sigue el repositorio y cómo interactúa con GitHub Actions.

---

## Flujo de ramas

```
main ← develop ← feat/nombre-rama
```

| Rama | Propósito |
|------|-----------|
| `main` | Código en producción. Solo recibe merges desde `develop` vía release. |
| `develop` | Integración continua de features. Base de todos los PRs de desarrollo. |
| `feat/nombre-rama` | Rama de trabajo para una feature o fix específico. |

### Secuencia de trabajo

1. Crear rama desde `develop`:
   ```bash
   git switch develop
   git pull origin develop
   git switch -c feat/mi-feature
   ```

2. Desarrollar y hacer commits en `feat/mi-feature`.

3. Abrir un **Pull Request** hacia `develop`.

4. La CI valida automáticamente el PR (lint + tests).

5. El PR pasa **code review** de al menos un responsable.

6. Merge a `develop` una vez aprobado y con CI en verde.

7. Cuando `develop` está estable y listo para producción, se abre un PR de `develop` → `main` (release).

8. Merge a `main` luego de aprobación. La CI también valida este PR.

---

## GitHub Actions — CI (`ci.yml`)

El workflow de CI corre automáticamente en estos eventos:

| Evento | Ramas cubiertas |
|--------|-----------------|
| `push` | `main`, `develop` |
| `pull_request` | PRs hacia `main` o `develop` |

### Pasos del workflow

1. **Checkout** — descarga el código del repo.
2. **Setup Node.js 20** — instala Node con caché de npm para acelerar instalaciones.
3. **Install dependencies** — ejecuta `npm ci` para instalación limpia y reproducible.
4. **Lint** — ejecuta `npm run lint` para validar estilo y calidad de código.
5. **Test** — ejecuta `npm test` para correr la suite de tests.

---

## Configuración manual recomendada en GitHub

Las siguientes opciones **no se pueden configurar por archivos del repo** y deben activarse manualmente en _Settings > Branches_:

### Branch protection para `main` y `develop`

- **Require a pull request before merging** — evita pushes directos.
- **Require status checks to pass before merging** — marcar `lint-and-test` como required check.
- **Require branches to be up to date before merging** — evita que se mergee código desactualizado.
- **Dismiss stale pull request approvals when new commits are pushed** — obliga a re-aprobar si hay cambios.

> Para `main` se recomienda además activar **Require linear history** o **Restrict who can push** para mayor control del historial de producción.

---

## Convenciones de nombres de rama

| Tipo | Patrón |
|------|--------|
| Feature | `feat/descripcion-corta` |
| Fix | `fix/descripcion-corta` |
| Hotfix en producción | `hotfix/descripcion-corta` |
| Release | `release/vX.Y.Z` |
