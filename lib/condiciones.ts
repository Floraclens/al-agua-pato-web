/**
 * Condiciones de la reserva (P1 #14 de la propuesta). Textos del informe 26-T, pregunta 2,
 * sección (3), con la regla de reprogramación de la titular y la cláusula de fuerza mayor.
 * Los usan /condiciones, el recuadro antes de «Confirmar Reserva», la pantalla de éxito y
 * el mensaje de WhatsApp.
 *
 * Son MODELOS: no se publican hasta que la titular los apruebe.
 */

import { WHATSAPP_VISIBLE } from "./datos-titular"

export interface Condicion {
  titulo: string
  texto: string
}

/** `sena`: monto ya formateado; sin él, se remite al resumen de la reserva. */
export function condicionesReserva(sena?: string): Condicion[] {
  return [
    {
      titulo: "DERECHO DE REVOCACIÓN",
      texto: `Si contrataste a distancia (web/WhatsApp), tenés derecho a revocar la aceptación dentro de los 10 (diez) días corridos desde la celebración del contrato, sin costo ni responsabilidad alguna (art. 34 Ley 24.240 y arts. 1110 a 1113 del Código Civil y Comercial). En ese caso te devolvemos el 100 % de la seña, por el mismo medio en que la pagaste. Podés hacerlo desde el BOTÓN DE ARREPENTIMIENTO de esta web o escribiéndonos al WhatsApp ${WHATSAPP_VISIBLE}. No podés revocar una vez que el servicio fue utilizado.`,
    },
    {
      titulo: "SEÑA",
      texto: sena
        ? `La reserva se confirma con una seña de ${sena}, que se toma a cuenta del precio total.`
        : "La reserva se confirma con una seña (el monto figura en el resumen de tu reserva), que se toma a cuenta del precio total.",
    },
    {
      titulo: "CANCELACIÓN PASADO EL PLAZO DE REVOCACIÓN",
      texto: "Vencidos los 10 días, si cancelás la reserva, la seña se pierde (art. 1059 del Código Civil y Comercial). Si el salón cancela por causas propias, te devuelve la seña doblada.",
    },
    {
      titulo: "FUERZA MAYOR",
      texto: "Si el salón no puede realizar el evento por fuerza mayor (clima, corte de luz u otra causa ajena), devuelve la seña o se reprograma, a elección del cliente.",
    },
    {
      titulo: "REPROGRAMACIÓN",
      texto: "En lugar de cancelar, podés reprogramar para las fechas siguientes disponibles, avisando uno o dos días antes o incluso el mismo día. En ese caso la seña se mantiene a cuenta del nuevo evento.",
    },
  ]
}

// Aparte: en el resumen ya figura como renglón propio («Saldo»), junto a las demás reglas del salón.
export const CONDICION_SALDO: Condicion = {
  titulo: "SALDO",
  texto: "La totalidad se abona hasta 1 semana antes del evento.",
}

/** Renglón para el mensaje de WhatsApp que arma la web al reservar. */
export function condicionesParaWhatsApp(urlCondiciones: string): string {
  return `*Condiciones:* puedo revocar la reserva dentro de los 10 días corridos con devolución del 100 % de la seña; pasado ese plazo, si cancelo, la seña se pierde, y puedo reprogramar. Detalle: ${urlCondiciones}`
}
