// PostToolUse (Edit|Write|MultiEdit): avisa apenas el cambio sale de los límites.
// La edición ya ocurrió; el aviso obliga a Claude a revertir o partir el cambio.
import { execFileSync } from 'node:child_process';
import { raiz, baseDeLaRama } from './comun.mjs';

try {
  execFileSync('node', ['scripts/check-pr-size.mjs'], {
    cwd: raiz,
    encoding: 'utf8',
    env: { ...process.env, SDD_BASE: baseDeLaRama() },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  process.exit(0);
} catch (error) {
  process.stderr.write(
    `${error.stdout || ''}${error.stderr || ''}\n` +
      'El cambio salió de los límites. Revertí la última edición y partí la tarea ' +
      'en tareas.md antes de seguir. No pidas excepción.\n',
  );
  process.exit(2);
}
