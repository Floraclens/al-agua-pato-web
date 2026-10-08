/**
 * Conversión entre el objeto `Extras` y el texto que se guarda en
 * `reservas.extras_elegidos` (ej: "+2 Adulto/s, Animación, Hora Extra").
 *
 * Única fuente de verdad del formato: la usan el alta de reserva
 * (components/resumen-reserva.tsx) y el panel admin al editar extras.
 * Si cambiás un label acá, `textoAExtras` tiene que seguir entendiendo el
 * formato viejo (hay reservas guardadas con él).
 */

import type { Extras } from "./reserva"

export const LABEL_HORA_EXTRA = "Hora Extra"

export const EXTRAS_VACIOS: Extras = {
  adultosAdicionales: 0,
  cantidadMozos: 1,
  personajesSeleccionados: [],
  animacion: false,
  horaExtra: false,
  robotLed: 0,
  zancosLed: 0,
  personaje: false,
  mozoAdicional: false,
  pileta: false,
}

export function extrasALabels(extras: Extras): string[] {
  const labels: string[] = []

  if (extras.adultosAdicionales > 0) {
    labels.push(`+${extras.adultosAdicionales} Adulto/s`)
  }

  if (extras.mozoAdicional && extras.cantidadMozos > 0) {
    labels.push(`+${extras.cantidadMozos} Mozo/s`)
  }

  if (extras.animacion) labels.push("Animación")
  if (extras.horaExtra) labels.push(LABEL_HORA_EXTRA)

  if (extras.robotLed > 0) {
    labels.push(`Robot LED (x${extras.robotLed})`)
  }

  if (extras.zancosLed > 0) {
    labels.push(`Zancos LED (x${extras.zancosLed})`)
  }

  if (extras.pileta) {
    labels.push("Acceso a la Pileta")
  }

  if (extras.personaje && extras.personajesSeleccionados.length > 0) {
    labels.push(`Personajes (${extras.personajesSeleccionados.join(", ")})`)
  }

  return labels
}

/** Texto final para `extras_elegidos`. `extraLabels` = labels no reconocidos que se conservan tal cual. */
export function extrasATexto(extras: Extras, extraLabels: string[] = []): string {
  const labels = [...extrasALabels(extras), ...extraLabels]
  return labels.length > 0 ? labels.join(", ") : "Ninguno"
}

/** Separa por ", " ignorando las comas dentro de paréntesis (lista de personajes). */
function separarLabels(texto: string): string[] {
  const partes: string[] = []
  let profundidad = 0
  let actual = ""
  for (const ch of texto) {
    if (ch === "(") profundidad++
    if (ch === ")") profundidad = Math.max(0, profundidad - 1)
    if (ch === "," && profundidad === 0) {
      partes.push(actual)
      actual = ""
    } else {
      actual += ch
    }
  }
  partes.push(actual)
  return partes.map((p) => p.trim()).filter(Boolean)
}

/**
 * Inversa de `extrasATexto`. Lo que no reconoce lo devuelve en `desconocidos`
 * para que quien llame lo muestre y lo conserve (nunca se descarta en silencio).
 */
export function textoAExtras(texto: string | null | undefined): { extras: Extras; desconocidos: string[] } {
  const extras: Extras = { ...EXTRAS_VACIOS, personajesSeleccionados: [] }
  const desconocidos: string[] = []

  if (!texto || texto.trim() === "" || texto.trim() === "Ninguno") {
    return { extras, desconocidos }
  }

  for (const label of separarLabels(texto)) {
    let m: RegExpMatchArray | null

    if ((m = label.match(/^\+(\d+) Adulto\/s$/))) {
      extras.adultosAdicionales = Number(m[1])
    } else if ((m = label.match(/^\+(\d+) Mozo\/s$/))) {
      extras.mozoAdicional = true
      extras.cantidadMozos = Number(m[1])
    } else if (label === "Animación") {
      extras.animacion = true
    } else if (label === LABEL_HORA_EXTRA) {
      extras.horaExtra = true
    } else if ((m = label.match(/^Robot LED \(x(\d+)\)$/))) {
      extras.robotLed = Number(m[1])
    } else if ((m = label.match(/^Zancos LED \(x(\d+)\)$/))) {
      extras.zancosLed = Number(m[1])
    } else if (label === "Acceso a la Pileta") {
      extras.pileta = true
    } else if ((m = label.match(/^Personajes \((.*)\)$/))) {
      const lista = m[1].split(",").map((p) => p.trim()).filter(Boolean)
      if (lista.length > 0) {
        extras.personaje = true
        extras.personajesSeleccionados = lista
      }
    } else {
      desconocidos.push(label)
    }
  }

  return { extras, desconocidos }
}

/** true si el texto de extras incluye la hora extra (mismo criterio que el RPC get_invitacion). */
export function tieneHoraExtra(texto: string | null | undefined): boolean {
  return !!texto && texto.toLowerCase().includes(LABEL_HORA_EXTRA.toLowerCase())
}
