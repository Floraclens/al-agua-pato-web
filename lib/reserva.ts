/**
 * Tipos y cálculo de precios compartidos entre /reservar (cumpleaños) y /egresaditos.
 * La lógica fue extraída LITERALMENTE de app/reservar/page.tsx (idéntica a la de
 * egresaditos salvo formato) — ver docs/casos-referencia-precios.md como contrato
 * de comportamiento.
 *
 * Imports relativos a propósito: permiten ejecutar calcularPrecios() con tsx
 * (scripts de verificación) sin depender del alias @/ de tsconfig.
 */

import { PRECIOS, VALOR_SENA, RECARGOS_Y_DESCUENTOS } from "./config-reservas"
import type { Turno } from "./turno"

export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | null

export interface Extras {
  adultosAdicionales: number
  cantidadMozos: number
  personajesSeleccionados: string[]
  animacion: boolean
  horaExtra: boolean
  robotLed: number
  zancosLed: number
  personaje: boolean
  mozoAdicional: boolean
  pileta: boolean
}

export interface DatosCliente {
  nombre: string
  telefono: string
  email: string
  nombreCumpleanero: string
  edadCumple: string
  institucion?: string
  sala?: string
  turno_colegio?: string
}

export interface Calculos {
  precioTurno: number
  precioExtras: number
  subtotal: number
  descuento: number
  recargo: number
  total: number
  sena: number
}

export const formatMoneyUI = (amount: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
}

// reglasFecha queda `any` a propósito: obtenerReglasParaFecha/obtenerReglasEgresaditos
// devuelven any (construyen sobre baseReglas: any). Tiparlas es un refactor aparte.
export function calcularPrecios({
  selectedDate,
  selectedTurno,
  reglasFecha,
  extras,
  metodoPago,
  pagoTotalidad,
}: {
  selectedDate: Date | undefined
  selectedTurno: Turno
  reglasFecha: any
  extras: Extras
  metodoPago: MetodoPago
  pagoTotalidad: boolean
}): Calculos {
  let subtotal = 0
  let precioTurno = 0
  let precioExtras = 0
  let descuento = 0
  let recargo = 0

  if (selectedTurno && selectedDate && reglasFecha) {
    if (reglasFecha.modalidad === 'doble_turno_fijo') {
      if (reglasFecha.precios) {
        if (selectedTurno === "primero") precioTurno = reglasFecha.precios.turno_1
        else if (selectedTurno === "segundo") precioTurno = reglasFecha.precios.turno_2
      } else {
        precioTurno = reglasFecha.precio
      }
    } else {
      precioTurno = reglasFecha.precio
    }
    subtotal += precioTurno
  }

  if (extras.adultosAdicionales > 0) {
    precioExtras += extras.adultosAdicionales * PRECIOS.opcionales.adultosAdicionales
  }
  if (extras.mozoAdicional && extras.cantidadMozos > 0) {
    precioExtras += extras.cantidadMozos * PRECIOS.opcionales.mozoAdicional
  }
  if (extras.personaje && extras.personajesSeleccionados.length > 0) {
    precioExtras += extras.personajesSeleccionados.length * PRECIOS.opcionales.personaje.precio_unidad
  }
  if (extras.animacion) {
    precioExtras += PRECIOS.opcionales.animacion
  }
  if (extras.horaExtra) {
    precioExtras += PRECIOS.opcionales.horaExtra
  }
  if (extras.robotLed === 1) {
    precioExtras += PRECIOS.opcionales.robot_led.uno
  } else if (extras.robotLed === 2) {
    precioExtras += PRECIOS.opcionales.robot_led.dos
  }
  if (extras.zancosLed > 0) {
    precioExtras += extras.zancosLed * PRECIOS.opcionales.zancos_led.precio_unidad
  }
  if (extras.pileta) {
    precioExtras += PRECIOS.opcionales.pileta.precio
  }

  subtotal += precioExtras

  // LÓGICA DE DESCUENTO (Efectivo)
  if (metodoPago === "efectivo" && pagoTotalidad && subtotal > 0) {
    descuento = subtotal * (RECARGOS_Y_DESCUENTOS.efectivo_totalidad_descuento_porcentaje / 100)
  }

  // LÓGICA DE RECARGO (Tarjeta) — hoy el porcentaje es 0, pero la rama debe
  // existir para cuando ese valor cambie en config-reservas.
  if (metodoPago === "tarjeta" && subtotal > 0) {
    recargo = subtotal * (RECARGOS_Y_DESCUENTOS.tarjeta_recargo_porcentaje / 100)
  }

  const total = subtotal - descuento + recargo

  // CORRECCIÓN LÓGICA DE SEÑA: La seña no recibe recargos. Se mantiene estática salvo que abonen la totalidad.
  let senaFinal = VALOR_SENA

  if (pagoTotalidad) {
    senaFinal = total
  }

  return {
    precioTurno,
    precioExtras,
    subtotal,
    descuento,
    recargo,
    total,
    sena: senaFinal,
  }
}
