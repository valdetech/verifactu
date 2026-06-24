# Especificación canónica usada por `verifactu`

Resumen accionable de la spec técnica VeriFactu en que se basa la librería,
consolidado de fuentes oficiales AEAT/BOE y verificado adversarialmente.
`[CONFIRMADO]` = consenso de varias fuentes incl. AEAT. `[VERIFICAR]` = requiere
contrastar el PDF/XSD oficial (ver §4) antes de producción.

## 1. Huella / hash

- Cadena `clave=valor` unida por `&` (sin espacios), **UTF-8**, **SHA-256**,
  salida **hex MAYÚSCULAS** (64). `[CONFIRMADO]`
- **RegistroAlta** — 8 campos en orden:
  `IDEmisorFactura, NumSerieFactura, FechaExpedicionFactura, TipoFactura,
  CuotaTotal, ImporteTotal, Huella, FechaHoraHusoGenRegistro`.
- **RegistroAnulación** — 5 campos:
  `IDEmisorFacturaAnulada, NumSerieFacturaAnulada, FechaExpedicionFacturaAnulada,
  Huella, FechaHoraHusoGenRegistro`.
- Primer registro de la serie: `Huella=` **vacío** (no hay semilla). `[CONFIRMADO]`

### Vector oficial de prueba (verificado, ver tests/huella.test.ts)
```
IDEmisorFactura=89890001K&NumSerieFactura=12345678/G33&FechaExpedicionFactura=01-01-2024&TipoFactura=F1&CuotaTotal=12.35&ImporteTotal=123.45&Huella=&FechaHoraHusoGenRegistro=2024-01-01T19:20:30+01:00
```
→ `3C464DAF61ACB827C65FDA19F352A4E3BDC2C640E9E9FC4CC058073F38F12F60`

> Regla de diseño: la huella se construye con los **mismos strings serializados**
> que van al XML (no re-formatear números/fechas), para respetar automáticamente
> cualquier convención de decimales/fecha que exija la AEAT.

## 2. Código QR
- URL cotejo: prod `https://www2.agenciatributaria.es/wlpl/TIKE-CONT/ValidarQR`,
  pruebas `https://prewww2.aeat.es/wlpl/TIKE-CONT/ValidarQR`.
- Params en orden, URL-encoded (`/`→`%2F`): `nif, numserie, fecha (DD-MM-YYYY),
  importe (punto decimal)`.
- QR ISO/IEC 18004 nivel **M**, 30–40 mm.
- Leyenda: `VERI*FACTU` (modo Veri*Factu) o
  `Factura verificable en la sede electrónica de la AEAT`.

## 3. Modelo de registro
Ver `src/types.ts`. RegistroAlta obligatorios: NIF+nombre emisor, NIF receptor
(salvo simplificada F2), num+serie, fecha expedición, TipoFactura (F1..F6/R1..R5),
descripción, ImporteTotal, Desglose, CuotaTotal, Huella, FechaHoraHusoGenRegistro,
SistemaInformatico. Firma XML **NO** obligatoria en Veri*Factu.

## 4. Pendiente de confirmar contra PDF/XSD oficial `[VERIFICAR]`
- Formato exacto de `FechaExpedicionFactura` en la huella vs en el XML (la huella
  usa `dd-mm-yyyy` según el vector; el XML podría diferir).
- Normalización de decimales (¿ceros de cola?) y de espacios en los valores.
- Percent-encoding y orden estricto del QR contra `DetalleEspecificacTecnCodigoQRfactura.pdf`.
- Nombres de clave exactos del RegistroAnulación y campos de tipo de anulación.
- Validación completa del `Desglose` (operación exenta sanidad, claves E1..E6).

Descargar de:
https://www.agenciatributaria.es/AEAT.desarrolladores/Desarrolladores/_menu_/Documentacion/Sistemas_Informaticos_de_Facturacion_y_Sistemas_VERI_FACTU/Sistemas_Informaticos_de_Facturacion_y_Sistemas_VERI_FACTU.html
