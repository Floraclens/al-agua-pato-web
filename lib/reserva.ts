/**
 * Tipos y cálculo de precios compartidos entre /reservar (cumpleaños) y /egresaditos.
 * La lógica fue extraída LITERALMENTE de app/reservar/page.tsx (idéntica a la de
 * egresaditos salvo formato) — ver docs/casos-referencia-precios.md como contrato
 * de comportamiento.
 *
 * Imports relativos a propósito: permiten ejecutar calcularPrecios() con tsx
 * (scripts de verificación) sin depender del alias @/ de tsconfig.
 */

import type { Precios } from "./precios"
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

/**
 * Precio de los extras a los precios VIGENTES (tabla `precios`). Extraído tal cual de
 * calcularPrecios (mismo resultado) para reusarlo en el panel admin al editar extras.
 */
export function calcularPrecioExtras(extras: Extras, precios: Precios): number {
  let precioExtras = 0
  if (extras.adultosAdicionales > 0) {
    precioExtras += extras.adultosAdicionales * precios.adulto_adicional
  }
  if (extras.mozoAdicional && extras.cantidadMozos > 0) {
    precioExtras += extras.cantidadMozos * precios.mozo_adicional
  }
  if (extras.personaje && extras.personajesSeleccionados.length > 0) {
    precioExtras += extras.personajesSeleccionados.length * precios.personaje
  }
  if (extras.animacion) {
    precioExtras += precios.animacion
  }
  if (extras.horaExtra) {
    precioExtras += precios.hora_extra
  }
  if (extras.robotLed === 1) {
    precioExtras += precios.robot_led_1
  } else if (extras.robotLed === 2) {
    precioExtras += precios.robot_led_2
  }
  if (extras.zancosLed > 0) {
    precioExtras += extras.zancosLed * precios.zancos_led
  }
  if (extras.pileta) {
    precioExtras += precios.pileta
  }
  return precioExtras
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
  precios,
}: {
  selectedDate: Date | undefined
  selectedTurno: Turno
  reglasFecha: any
  extras: Extras
  metodoPago: MetodoPago
  pagoTotalidad: boolean
  precios: Precios
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

  precioExtras = calcularPrecioExtras(extras, precios)

  subtotal += precioExtras

  // LÓGICA DE DESCUENTO (Efectivo)
  if (metodoPago === "efectivo" && pagoTotalidad && subtotal > 0) {
    descuento = subtotal * (precios.descuento_efectivo_pct / 100)
  }

  // LÓGICA DE RECARGO (Tarjeta) — hoy el porcentaje es 0, pero la rama debe
  // existir para cuando la admin cambie ese valor en /admin.
  if (metodoPago === "tarjeta" && subtotal > 0) {
    recargo = subtotal * (precios.recargo_tarjeta_pct / 100)
  }

  const total = subtotal - descuento + recargo

  // CORRECCIÓN LÓGICA DE SEÑA: La seña no recibe recargos. Se mantiene estática salvo que abonen la totalidad.
  let senaFinal = precios.sena

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
