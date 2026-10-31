// PreToolUse (Bash): comandos que solo puede hacer un humano.
import { leerEntrada, ramaActual, bloquear } from './comun.mjs';

const comando = leerEntrada().tool_input?.command || '';
const enMain = ramaActual() === 'main';

const prohibidos = [
  [/\bgh\s+pr\s+merge\b/, 'Mergear PRs lo hace un humano.'],
  [/\bgh\s+api\b[^|;&]*\/merge\b/, 'Mergear PRs lo hace un humano.'],
  [/\bgh\s+pr\s+review\b[^|;&]*--approve\b/, 'Aprobar PRs lo hace un humano.'],
  [/(label|labels)\b[^|;&]*validado/i, 'La etiqueta "validado" solo la pone o la quita un humano.'],
  [/--no-verify\b/, 'No se saltean verificaciones.'],
  [/\bgit\s+push\b[^|;&]*--force(?!-with-lease)\b/, 'Usá --force-with-lease, nunca --force.'],
  [/\bgit\s+push\b[^|;&]*(\s|:)main\b/, 'Nunca se pushea a main.'],
  [/\bgit\s+push\b[^|;&]*\s-f\b/, 'Usá --force-with-lease, nunca -f.'],
];

for (const [patron, motivo] of prohibidos) {
  if (patron.test(comando)) bloquear(`Bloqueado: ${motivo}`);
}

if (enMain && /\bgit\s+(commit|push|merge|rebase|cherry-pick)\b/.test(comando)) {
  bloquear('Bloqueado: no se trabaja sobre main. Creá una rama sdd/ o it/.');
}

process.exit(0);
