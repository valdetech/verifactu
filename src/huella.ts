import { createHash } from 'node:crypto'

// Huella / hash canónica VeriFactu (Orden HAC/1177/2024).
// Cadena `clave=valor` unida por `&`, UTF-8, SHA-256, hex MAYÚSCULAS.
// Cada huella incluye la del registro anterior → encadenamiento inalterable.
// Vector oficial de prueba en tests/huella.test.ts.

function sha256Upper(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex').toUpperCase()
}

/** Campos del registro de ALTA que entran en la huella, en orden. */
export interface HuellaAltaInput {
  IDEmisorFactura: string
  NumSerieFactura: string
  /** Tal como se serializa en el XML (p.ej. dd-mm-yyyy). */
  FechaExpedicionFactura: string
  TipoFactura: string
  CuotaTotal: string
  ImporteTotal: string
  /** Huella del registro anterior; '' en el primer registro de la serie. */
  huellaAnterior: string
  /** ISO 8601 con huso: yyyy-mm-ddThh:mm:ss±hh:mm */
  FechaHoraHusoGenRegistro: string
}

/** Construye la cadena canónica del registro de alta (expuesta para el linter/depuración). */
export function cadenaAlta(i: HuellaAltaInput): string {
  return (
    `IDEmisorFactura=${i.IDEmisorFactura}` +
    `&NumSerieFactura=${i.NumSerieFactura}` +
    `&FechaExpedicionFactura=${i.FechaExpedicionFactura}` +
    `&TipoFactura=${i.TipoFactura}` +
    `&CuotaTotal=${i.CuotaTotal}` +
    `&ImporteTotal=${i.ImporteTotal}` +
    `&Huella=${i.huellaAnterior}` +
    `&FechaHoraHusoGenRegistro=${i.FechaHoraHusoGenRegistro}`
  )
}

export function computeHuellaAlta(i: HuellaAltaInput): string {
  return sha256Upper(cadenaAlta(i))
}

/** Campos del registro de ANULACIÓN que entran en la huella, en orden. */
export interface HuellaAnulacionInput {
  IDEmisorFacturaAnulada: string
  NumSerieFacturaAnulada: string
  FechaExpedicionFacturaAnulada: string
  huellaAnterior: string
  FechaHoraHusoGenRegistro: string
}

export function cadenaAnulacion(i: HuellaAnulacionInput): string {
  return (
    `IDEmisorFacturaAnulada=${i.IDEmisorFacturaAnulada}` +
    `&NumSerieFacturaAnulada=${i.NumSerieFacturaAnulada}` +
    `&FechaExpedicionFacturaAnulada=${i.FechaExpedicionFacturaAnulada}` +
    `&Huella=${i.huellaAnterior}` +
    `&FechaHoraHusoGenRegistro=${i.FechaHoraHusoGenRegistro}`
  )
}

export function computeHuellaAnulacion(i: HuellaAnulacionInput): string {
  return sha256Upper(cadenaAnulacion(i))
}

/**
 * Encadena una serie de registros de alta: calcula la huella de cada uno
 * usando la huella del anterior ('' para el primero). Devuelve las huellas en orden.
 */
export function encadenarAltas(
  registros: Omit<HuellaAltaInput, 'huellaAnterior'>[],
): string[] {
  const huellas: string[] = []
  let anterior = ''
  for (const r of registros) {
    const h = computeHuellaAlta({ ...r, huellaAnterior: anterior })
    huellas.push(h)
    anterior = h
  }
  return huellas
}
