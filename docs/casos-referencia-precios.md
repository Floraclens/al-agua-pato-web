# Casos de referencia — precios y reglas de reserva

**Propósito:** documentar el comportamiento EXACTO del código actual (`lib/config-reservas.ts` +
la fórmula de `calculos` duplicada en `app/reservar/page.tsx` y `app/egresaditos/page.tsx`) antes
de tocar la duplicación entre esas dos páginas. Después del refactor, volver a correr estos mismos
casos y confirmar que el resultado es idéntico byte a byte.

> **Actualización post-refactor:** la fórmula de `calculos` ya no vive duplicada en las páginas;
> se extrajo como función pura `calcularPrecios()` en `lib/reserva.ts` (consumida por el hook
> `hooks/use-reserva.ts`). Los 15 casos de este documento se re-ejecutaron contra ese código real
> tras el refactor y coincidieron caso por caso (18/18 checks OK). Para futuras verificaciones,
> importar `calcularPrecios` directamente desde `lib/reserva.ts` en el caso I.

**Cómo se generó esta tabla:** NO se calculó a mano. Se escribió un script temporal
(`_tmp_casos_referencia.mts`, borrado al terminar, nunca commiteado) que importa directamente las
funciones y constantes reales exportadas por `lib/config-reservas.ts`
(`determinarTemporada`, `esFinDeSemanaOFeriado`, `obtenerReglasParaFecha`, `obtenerReglasEgresaditos`,
`feriadosCargadosParaAnio`, `FeriadosNoCargadosError`, `PRECIOS`, `RECARGOS_Y_DESCUENTOS`, `VALOR_SENA`)
y las ejecuta contra fechas concretas con `npx tsx`. Para los casos de recargo/descuento (I), el
script reproduce literalmente la fórmula que hoy está copiada e idéntica en ambas páginas
(`subtotal → descuento/recargo → total → sena`), pero usando las constantes reales importadas, no
números tipeados a mano. La salida de esa corrida es la que se transcribe abajo tal cual.

No se modificó ningún archivo de lógica real (`lib/`, `app/reservar`, `app/egresaditos`) para esta auditoría.

---

## A. Temporada baja — 2026-06-10 (miércoles) — cumpleaños

| Campo | Valor |
|---|---|
| Temporada | `temporada_baja` |
| `esFinDeSemanaOFeriado` | `false` |
| Modalidad | `turno_flexible` |
| Precio base | `700000` |
| Franja horaria | 12:00 a 19:00 (último inicio 15:00) |
| Pileta disponible | `true` |

## B. Temporada alta — 2026-01-15 (jueves) — cumpleaños

| Campo | Valor |
|---|---|
| Temporada | `temporada_alta` |
| `esFinDeSemanaOFeriado` | `false` |
| Modalidad | `doble_turno_fijo` |
| Turno 1 | `970000` (12:00–16:00) |
| Turno 2 | `1050000` (18:30–22:30) |
| Pileta disponible | `false` |

## C. Temporada media, día de semana — 2026-09-16 (miércoles) — cumpleaños

| Campo | Valor |
|---|---|
| Temporada | `temporada_media` |
| `esFinDeSemanaOFeriado` | `false` |
| Modalidad | `turno_flexible` |
| Precio base | `1000000` |
| Franja horaria | 12:00 a 22:30 (último inicio 18:30) |
| Pileta disponible | `false` |

## D. Temporada media, fin de semana — 2026-09-19 (sábado) — cumpleaños

| Campo | Valor |
|---|---|
| Temporada | `temporada_media` |
| `esFinDeSemanaOFeriado` | `true` |
| Modalidad | `doble_turno_fijo` |
| Turno 1 | `970000` |
| Turno 2 | `1050000` |
| Pileta disponible | `false` |

## E. Temporada media, feriado — 2026-10-12 (lunes) — cumpleaños

> Nota: el 12/10/2026 cae **lunes** (no es fin de semana), así que este caso aísla específicamente
> la rama `FERIADOS.includes(fechaStr)` de `esFinDeSemanaOFeriado` — confirma que un feriado entre
> semana también activa el modo fin-de-semana, no solo sábado/domingo.

| Campo | Valor |
|---|---|
| Temporada | `temporada_media` |
| `esFinDeSemanaOFeriado` | `true` (por feriado, no por día de semana) |
| Modalidad | `doble_turno_fijo` |
| Turno 1 | `970000` |
| Turno 2 | `1050000` |
| Pileta disponible | `false` |

## F. Egresadito noviembre — 2026-11-05 (jueves)

| Campo | Valor |
|---|---|
| `esFinDeSemanaOFeriado` | `false` |
| Disponible | `true` |
| Modalidad | `turno_flexible` |
| Precio base | `1100000` |
| Franja horaria | 12:00 a 22:30 (último inicio 18:30) |
| Pileta disponible | `false` |

## G. Egresadito diciembre, antes del día 15 — 2026-12-05 (sábado)

| Campo | Valor |
|---|---|
| `esFinDeSemanaOFeriado` | `true` |
| Disponible | `true` |
| Modalidad | `doble_turno_fijo` |
| Turno 1 | `1100000` |
| Turno 2 | `1100000` |
| Pileta disponible | `false` |

---

## H. Casos límite de corte de fecha

### H1 — temporada_alta → temporada_baja (31-mar / 1-abr, cumpleaños)

| Fecha | Temporada | Modalidad | Precio |
|---|---|---|---|
| 2026-03-31 (martes) | `temporada_alta` | `doble_turno_fijo` | T1 `970000` / T2 `1050000` |
| 2026-04-01 (miércoles) | `temporada_baja` | `turno_flexible` | `700000` |

El corte es exacto: el 31/3 todavía cotiza como alta, el 1/4 ya cotiza como baja.

### H2 — temporada_media → temporada_alta (14-dic / 15-dic)

Este es el corte más sensible: afecta **tanto** a cumpleaños (cambio de temporada) **como** a
egresaditos (cambio de régimen de precios `nov_a_dic14` → `dic15_a_fin`), el mismo día.

| Fecha | Tipo | Temporada / régimen | Modalidad | Precio |
|---|---|---|---|---|
| 2026-12-14 (lunes) | cumpleaños | `temporada_media` | `turno_flexible` | `1000000` |
| 2026-12-15 (martes) | cumpleaños | `temporada_alta` | `doble_turno_fijo` | T1 `970000` / T2 `1050000` |
| 2026-12-14 (lunes) | egresadito | `nov_a_dic14` | `turno_flexible` | `1100000` |
| 2026-12-15 (martes) | egresadito | `dic15_a_fin` | `doble_turno_fijo` | T1 `1100000` / T2 `1100000` |

Confirmado: ambos 14/12 son días de semana no feriados (`esFinDeSemanaOFeriado: false`), así que el
cambio de modalidad/precio se debe únicamente al corte de fecha `dia >= 15`, no a un efecto lateral
de fin de semana.

---

## I. Recargo con tarjeta vs. descuento con efectivo

Misma fecha y mismos extras para poder comparar directamente:

- Fecha: **2026-06-10** (temporada baja) → `precioTurno = 700000`
- Extras: 2 adultos adicionales + animación → `precioExtras = 104000` (2×7000 + 90000)
- Constantes reales vigentes: `RECARGOS_Y_DESCUENTOS = { efectivo_totalidad_descuento_porcentaje: 10, tarjeta_recargo_porcentaje: 0 }`
- `VALOR_SENA = 350000`

| Escenario | subtotal | descuento | recargo | total | seña |
|---|---|---|---|---|---|
| Efectivo + pago de la totalidad | 804000 | 80400 (10%) | 0 | **723600** | **723600** (= total, porque `pagoTotalidad`) |
| Tarjeta, solo seña (`pagoTotalidad=false`) | 804000 | 0 | 0 (0%) | 804000 | **350000** (= `VALOR_SENA`, no afectada por el total) |
| Tarjeta + pago de la totalidad | 804000 | 0 | 0 (0%) | 804000 | **804000** (= total) |

**Dato a preservar en el refactor:** `tarjeta_recargo_porcentaje` está en `0` hoy — el recargo de
tarjeta existe como mecanismo en el código pero actualmente no suma nada al precio. Si el refactor
"simplifica" y elimina esa rama porque "total siempre da igual sin ella", cambiaría el comportamiento
el día que alguien suba ese porcentaje a un valor > 0.

---

## J. Año sin feriados cargados (2028 — fuera de `ANIOS_FERIADOS_CARGADOS`)

Caso: cumpleaños en **2028-01-15** (año no cargado; `ANIOS_FERIADOS_CARGADOS = [2026, 2027]`).

- `feriadosCargadosParaAnio(fecha)` → `false`
- `obtenerReglasParaFecha` / `esFinDeSemanaOFeriado` → **lanza** `FeriadosNoCargadosError`
- Mensaje real de la excepción (`Error.message`):
  > `No hay feriados cargados para el año 2028. Cargá la lista oficial en lib/config-reservas.ts.`
- El aviso visible al usuario (texto literal tomado de `components/reservation-calendar.tsx`, donde
  se atrapa este error y se bloquea la selección de fecha):
  > `Todavía no podemos calcular el precio para fechas de 2028. Escribinos por WhatsApp para reservar esa fecha.`

No cotiza en silencio: no hay temporada, modalidad ni precio para este caso — el sistema debe
seguir fallando visible, no asumir una temporada por defecto.

---

## Checklist para después del refactor

Volver a correr los 15 casos anteriores (A–J, incluyendo los 4 sub-casos de H y los 3 de I) contra
el código refactorizado y confirmar que:

- [ ] Temporada / régimen detectado es idéntico
- [ ] Modalidad (`turno_flexible` / `doble_turno_fijo`) es idéntica
- [ ] Precio(s) base son idénticos (incluye turno_1/turno_2 cuando aplica)
- [ ] `pileta_disponible` es idéntico
- [ ] Los cortes de fecha (H1, H2) siguen exactos, sin corrimiento de un día
- [ ] subtotal/descuento/recargo/total/seña de los casos de pago (I) son idénticos
- [ ] El caso de año sin feriados (J) sigue lanzando `FeriadosNoCargadosError` con el mismo mensaje,
      y la UI sigue mostrando el mismo aviso en vez de cotizar
