// Utilidades compartidas por los hooks de Claude Code.
// Contrato: exit 0 deja seguir; exit 2 bloquea y stderr le llega a Claude.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

export function leerEntrada() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

export const raiz = process.env.CLAUDE_PROJECT_DIR || process.cwd();

export function git(...args) {
  try {
    return execFileSync('git', args, {
      cwd: raiz,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

export const ramaActual = () => git('branch', '--show-current') || '';

// Base contra la que se mide la rama: la definida al apilar o origin/main.
export function baseDeLaRama() {
  const rama = ramaActual();
  return (rama && git('config', '--get', `branch.${rama}.sddBase`)) || 'origin/main';
}

export const rutaRelativa = (archivo) => relative(raiz, archivo || '');

export function bloquear(mensaje) {
  process.stderr.write(`${mensaje}\nVer AGENTS.md y docs/sdd/flujo.md.\n`);
  process.exit(2);
}
