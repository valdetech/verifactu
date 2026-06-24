#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { lint } from './lint.js'
import type { RegistroAlta } from './types.js'

// CLI mínima: `verifactu lint <serie.json>` verifica el cumplimiento de una
// serie de registros de alta y sale con código 1 si hay errores.

const [, , cmd, file] = process.argv

if (cmd !== 'lint' || !file) {
  console.error('uso: verifactu lint <serie.json>')
  process.exit(64)
}

let registros: RegistroAlta[]
try {
  registros = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(registros)) throw new Error('el JSON debe ser un array de registros de alta')
} catch (e) {
  console.error(`No se pudo leer ${file}: ${(e as Error).message}`)
  process.exit(66)
}

const informe = lint(registros)
for (const x of informe.incidencias) {
  const donde = x.index >= 0 ? `#${x.index}` : 'serie'
  console.error(`[${x.nivel}] ${donde} ${x.code}: ${x.message}`)
}
console.error(
  `\n${informe.ok ? 'OK' : 'NO CUMPLE'} — ${informe.total} registros, ${informe.errores} errores, ${informe.avisos} avisos`,
)
process.exit(informe.ok ? 0 : 1)
