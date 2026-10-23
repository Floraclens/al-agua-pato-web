/**
 * Textos cortos editables desde /admin (tabla `public.textos_web`, db/p1-14-textos-web.sql).
 * Hoy uno solo: lo que dice la opción Tarjeta en el método de pago.
 *
 * A diferencia de los precios, acá SÍ hay valor por defecto: si la tabla no existe o no
 * responde, la web muestra TEXTO_TARJETA_DEFECTO y la reserva sigue.
 */

import type { SupabaseClient } from "@supabase/supabase-js"

export const TEXTO_TARJETA_DEFECTO = "Solo tarjetas bancarizadas"
export const MAX_TEXTO_WEB = 300

export async function cargarTextoTarjeta(supabase: SupabaseClient): Promise<string | null> {
  const { data, error } = await supabase.from("textos_web").select("texto").eq("clave", "tarjeta").maybeSingle()
  if (error) throw new Error(`No se pudo leer el texto de la tarjeta: ${error.message}`)
  return data?.texto ?? null
}

/** Res. SIC 4/2025 art. 2 inc. d): si se ofrecen cuotas, van precio de contado, cuotas y CFT. */
export function mencionaCuotas(texto: string): boolean {
  return /cuota/i.test(texto)
}

export function validarTextoTarjeta(texto: string): string | null {
  const t = texto.trim()
  if (t === "") return "Escribí un texto."
  if (t.length > MAX_TEXTO_WEB) return `Máximo ${MAX_TEXTO_WEB} caracteres.`
  if (mencionaCuotas(t) && !/\bCFT\b/i.test(t)) {
    return "Si mencionás cuotas, tenés que poner el CFT (además del precio de contado y el valor de cada cuota)."
  }
  return null
}
