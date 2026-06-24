import { expect, test } from 'vitest'
import { computeHuellaAlta } from '../src/huella.js'
import { lint } from '../src/lint.js'
import type { RegistroAlta } from '../src/types.js'

const SIF = {
  NombreRazon: 'ACME SL', NIF: 'B12345678',
  NombreSistemaInformatico: 'ACME Facturador', IdSistemaInformatico: '01',
  Version: '1.0', NumeroInstalacion: '001',
}

function alta(num: string, huellaAnterior: string, prev?: RegistroAlta): RegistroAlta {
  const IDFactura = { IDEmisorFactura: '89890001K', NumSerieFactura: num, FechaExpedicionFactura: '01-01-2024' }
  const base = {
    IDVersion: '1.0', IDFactura, NombreRazonEmisor: 'ACME SL', TipoFactura: 'F1' as const,
    DescripcionOperacion: 'Servicios', Desglose: [], CuotaTotal: '12.35', ImporteTotal: '123.45',
    SistemaInformatico: SIF, FechaHoraHusoGenRegistro: '2024-01-01T19:20:30+01:00', TipoHuella: '01' as const,
  }
  const Huella = computeHuellaAlta({
    IDEmisorFactura: IDFactura.IDEmisorFactura, NumSerieFactura: num,
    FechaExpedicionFactura: IDFactura.FechaExpedicionFactura, TipoFactura: 'F1',
    CuotaTotal: '12.35', ImporteTotal: '123.45', huellaAnterior,
    FechaHoraHusoGenRegistro: '2024-01-01T19:20:30+01:00',
  })
  const Encadenamiento = prev
    ? { RegistroAnterior: { ...prev.IDFactura, Huella: prev.Huella! } }
    : { PrimerRegistro: 'S' as const }
  return { ...base, Encadenamiento, Huella }
}

test('serie válida encadenada: sin errores', () => {
  const r0 = alta('12345678/G33', '')
  const r1 = alta('12345679/G33', r0.Huella!, r0)
  const informe = lint([r0, r1])
  expect(informe.ok).toBe(true)
  expect(informe.errores).toBe(0)
})

test('factura manipulada (importe cambiado tras calcular huella) → cadena-rota', () => {
  const r0 = alta('12345678/G33', '')
  const manipulada = { ...r0, ImporteTotal: '999.99' }
  const informe = lint([manipulada])
  expect(informe.ok).toBe(false)
  expect(informe.incidencias.some((x) => x.code === 'cadena-rota')).toBe(true)
})

test('campo obligatorio ausente → error', () => {
  const r0 = alta('12345678/G33', '')
  const sinFecha = { ...r0, IDFactura: { ...r0.IDFactura, FechaExpedicionFactura: '' } }
  const informe = lint([sinFecha])
  expect(informe.ok).toBe(false)
  expect(informe.incidencias.some((x) => x.code === 'falta-fecha')).toBe(true)
})

test('segundo registro que no referencia la huella previa → encadenamiento-huella', () => {
  const r0 = alta('12345678/G33', '')
  const r1 = alta('12345679/G33', r0.Huella!, r0)
  const r1Malo = { ...r1, Encadenamiento: { RegistroAnterior: { ...r0.IDFactura, Huella: 'A'.repeat(64) } } }
  const informe = lint([r0, r1Malo])
  expect(informe.incidencias.some((x) => x.code === 'encadenamiento-huella')).toBe(true)
})
