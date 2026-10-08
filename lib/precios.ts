/**
 * Precios editables: viven en la tabla `public.precios` de Supabase (db/precios.sql)
 * y los edita la admin desde /admin. Acá está el contrato (claves) y la carga.
 *
 * Regla de oro: NUNCA hay un valor por defecto. Si falta una clave o un valor es
 * inválido, `parsePrecios` lanza y la UI bloquea la reserva (jamás se cotiza con
 * precios viejos o incompletos).
 *
 * Imports relativos y solo tipos de Supabase: permite correr esto con tsx en
 * scripts de verificación sin depender del alias @/ de tsconfig.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export const CLAVES_PRECIOS = [
  // turnos (cumpleaños)
  "baja",
  "media_lun_vie",
  "media_turno_1",
  "media_turno_2",
  "alta_turno_1",
  "alta_turno_2",
  // egresaditos
  "egre_nov_lun_vie",
  "egre_nov_turno_1",
  "egre_nov_turno_2",
  "egre_dic_turno_1",
  "egre_dic_turno_2",
  // extras
  "adulto_adicional",
  "mozo_adicional",
  "animacion",
  "hora_extra",
  "robot_led_1",
  "robot_led_2",
  "zancos_led",
  "personaje",
  "pileta",
  // pagos
  "sena",
  "descuento_efectivo_pct",
  "recargo_tarjeta_pct",
] as const

export type ClavePrecio = (typeof CLAVES_PRECIOS)[number]
export type Precios = Record<ClavePrecio, number>

const CLAVES_PORCENTAJE: readonly ClavePrecio[] = ["descuento_efectivo_pct", "recargo_tarjeta_pct"]

export class PreciosInvalidosError extends Error {
  constructor(detalle: string) {
    super(`Precios inválidos o incompletos: ${detalle}`)
    this.name = "PreciosInvalidosError"
  }
}

/** Valida filas `{ clave, valor }` de la tabla y arma el objeto. Exige las 23 claves. */
export function parsePrecios(rows: unknown): Precios {
  if (!Array.isArray(rows)) throw new PreciosInvalidosError("la respuesta no es una lista")

  const porClave = new Map<string, unknown>()
  for (const row of rows) {
    if (row && typeof row === "object" && "clave" in row && "valor" in row) {
      porClave.set(String((row as { clave: unknown }).clave), (row as { valor: unknown }).valor)
    }
  }

  const precios = {} as Precios
  for (const clave of CLAVES_PRECIOS) {
    if (!porClave.has(clave)) throw new PreciosInvalidosError(`falta "${clave}"`)

    const raw = porClave.get(clave)
    const valor = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN
    if (!Number.isFinite(valor) || !Number.isInteger(valor)) {
      throw new PreciosInvalidosError(`"${clave}" no es un entero válido`)
    }

    if (CLAVES_PORCENTAJE.includes(clave)) {
      if (valor < 0 || valor > 50) throw new PreciosInvalidosError(`"${clave}" fuera de rango (0–50)`)
    } else if (valor <= 0) {
      throw new PreciosInvalidosError(`"${clave}" tiene que ser mayor a 0`)
    }

    precios[clave] = valor
  }
  return precios
}

/** Lee los precios vigentes. Lanza si la consulta falla o los datos no son válidos. */
export async function cargarPrecios(supabase: SupabaseClient): Promise<Precios> {
  const { data, error } = await supabase.from("precios").select("clave, valor")
  if (error) throw new Error(`No se pudieron leer los precios: ${error.message}`)
  return parsePrecios(data)
}

export function preciosIguales(a: Precios, b: Precios): boolean {
  return CLAVES_PRECIOS.every((clave) => a[clave] === b[clave])
}
