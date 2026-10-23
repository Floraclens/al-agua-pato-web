/**
 * Condiciones de la reserva (P1 #14 de la propuesta). Textos decididos por la titular
 * (23/10/2026): solo reprogramación y saldo. Los usan /condiciones, el recuadro antes de
 * «Confirmar Reserva» y la pantalla de éxito.
 */

export interface Condicion {
  titulo: string
  texto: string
}

export const CONDICION_REPROGRAMACION: Condicion = {
  titulo: "REPROGRAMACIÓN",
  texto:
    "Reprogramamos la fecha por cuestiones climáticas. También podés reprogramar para las fechas siguientes disponibles, avisando uno o dos días antes o incluso el mismo día.",
}

// Aparte: en el resumen ya figura como renglón propio («Saldo»), junto a las demás reglas del salón.
export const CONDICION_SALDO: Condicion = {
  titulo: "SALDO",
  texto: "La totalidad se abona hasta 1 semana antes del evento.",
}
