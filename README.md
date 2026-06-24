# verifactu

Librería **TypeScript totalmente libre (MIT)** para integrar y **verificar el
cumplimiento** de **VeriFactu** (AEAT) en cualquier desarrollo. Sin dependencias
de pago ni APIs de terceros: el núcleo es determinista y se ejecuta offline.

> Estado: **v0.1 (fase 1, en construcción)** — núcleo offline verificable.
> Fase 2 (firma XAdES + envío SOAP al web service AEAT) más adelante.

## ¿Qué resuelve?

El reglamento VeriFactu (RD 1007/2023 + Orden HAC/1177/2024) obliga a que el
software de facturación genere, por cada factura, un **registro encadenado por
huella SHA-256**, con **código QR** de cotejo y leyenda. Esta librería:

- **Construye** los registros de alta/anulación.
- **Calcula la huella canónica** y **encadena** la serie (inalterabilidad).
- **Genera el QR** (URL de cotejo AEAT + imagen) y la leyenda.
- **Verifica el cumplimiento** (`verifactu lint`): comprueba campos, formato,
  cadena de huellas intacta, QR y leyenda, y emite un informe.

A diferencia de los MCP/SaaS existentes, es una **librería embebible**, en
TypeScript, **independiente** y con **verificador de cumplimiento**.

## Instalación

```bash
npm i verifactu
```

## Uso

```ts
import { computeHuellaAlta, encadenarAltas, qrUrl, qrSvg, lint } from 'verifactu'

// 1) Huella encadenada (la del registro anterior entra en el cálculo; '' en el 1º)
const huella = computeHuellaAlta({
  IDEmisorFactura: '89890001K',
  NumSerieFactura: '12345678/G33',
  FechaExpedicionFactura: '01-01-2024',
  TipoFactura: 'F1',
  CuotaTotal: '12.35',
  ImporteTotal: '123.45',
  huellaAnterior: '',
  FechaHoraHusoGenRegistro: '2024-01-01T19:20:30+01:00',
})

// 2) QR de cotejo AEAT + leyenda
const url = qrUrl({ nif: '89890001K', numserie: '12345678/G33', fecha: '01-01-2024', importe: '123.45' })
const svg = await qrSvg({ nif: '89890001K', numserie: '12345678/G33', fecha: '01-01-2024', importe: '123.45' })

// 3) Verificar el cumplimiento de una serie de registros de alta
const informe = lint(misRegistrosDeAlta) // { ok, errores, avisos, incidencias[] }
```

## Verificador (CLI)

```bash
npx verifactu lint examples/serie-valida.json   # OK  (exit 0)
npx verifactu lint examples/serie-manipulada.json # NO CUMPLE (exit 1, detecta cadena-rota)
```

La base técnica (formato canónico + vector oficial de prueba) está en
[`spec/SPEC.md`](./spec/SPEC.md).


## Aviso legal

Proyecto **comunitario e independiente**, **no oficial** ni avalado por la AEAT.
No garantiza por sí mismo la aceptación por la Agencia Tributaria: contrasta
siempre contra las especificaciones oficiales y el entorno de pruebas de la AEAT.
Se entrega "tal cual", sin garantías (ver `LICENSE`).

Fechas de obligatoriedad vigentes (RD-ley 15/2025): sociedades **1-ene-2027**,
resto de obligados **1-jul-2027**.

## Licencia

[MIT](./LICENSE) © 2026 Ignacio Noguerol
