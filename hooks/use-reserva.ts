"use client"

/**
 * Estado + lógica del formulario de reserva, compartido por /reservar (cumpleaños)
 * y /egresaditos. Extraído literalmente de ambas páginas (eran idénticas salvo:
 * el resolver de reglas, las 3 condiciones extra de canSubmit en egresaditos, y
 * el flag isEgresadito que cada página pasa a sus componentes).
 *
 * IMPORTANTE: el orden de los hooks y los arrays de deps replican exactamente
 * los de las páginas originales. No agregar useCallback/memos nuevos.
 */

import { useState, useMemo, useEffect } from "react"
import { type Turno } from "@/lib/turno"
import { obtenerReglasParaFecha, obtenerReglasEgresaditos, FeriadosNoCargadosError } from "@/lib/config-reservas"
import { calcularPrecios, type MetodoPago, type Extras, type DatosCliente } from "@/lib/reserva"

export function useReserva(esEgresadito: boolean) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTurno, setSelectedTurno] = useState<Turno>(null)
  const [showErrors, setShowErrors] = useState(false)

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTurno(null)
    setShowErrors(false)
  }

  const [extras, setExtras] = useState<Extras>({
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
  })

  const reglasFecha = useMemo(() => {
    if (!selectedDate) return null
    try {
      return esEgresadito ? obtenerReglasEgresaditos(selectedDate) : obtenerReglasParaFecha(selectedDate)
    } catch (e) {
      // Defensa en profundidad: si una fecha de un año sin feriados cargados
      // llegara hasta acá (el calendario ya la bloquea), no crashear el render.
      if (e instanceof FeriadosNoCargadosError) return null
      throw e
    }
    // esEgresadito es literal constante en cada página: nunca invalida el memo.
  }, [selectedDate, esEgresadito])

  useEffect(() => {
    if (reglasFecha && !reglasFecha.pileta_disponible && extras.pileta) {
      setExtras(prev => ({ ...prev, pileta: false }))
    }
  }, [reglasFecha, extras.pileta])

  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null)
  const [pagoTotalidad, setPagoTotalidad] = useState<boolean>(false)

  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: "",
    telefono: "",
    email: "",
    nombreCumpleanero: "",
    edadCumple: "",
    institucion: "",
    sala: "",
    turno_colegio: ""
  })

  // === CALCULADORA CENTRAL DE PRECIOS ===
  const calculos = useMemo(
    () => calcularPrecios({ selectedDate, selectedTurno, reglasFecha, extras, metodoPago, pagoTotalidad }),
    // Mismo array de deps que tenían ambas páginas (calcularPrecios es módulo-level, estable).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedTurno, selectedDate, extras, metodoPago, pagoTotalidad, reglasFecha]
  )

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length >= 10;
  };

  const hasSeleccionados = extras.personajesSeleccionados.length > 0;
  // Hoy sin consumidores en las páginas; conservado a propósito (existía en ambas).
  const errorPersonajeVacio = extras.personaje && !hasSeleccionados;
  const isValidPersonaje = !extras.personaje || hasSeleccionados;

  const canSubmit = Boolean(
    selectedDate &&
    selectedTurno &&
    metodoPago &&
    datosCliente.nombre.trim().length >= 3 &&
    isValidPhone(datosCliente.telefono) &&
    isValidEmail(datosCliente.email) &&
    isValidPersonaje &&
    (!esEgresadito || (
      (datosCliente.institucion?.trim() ?? "").length > 0 &&
      (datosCliente.sala?.trim() ?? "").length > 0 &&
      (datosCliente.turno_colegio?.trim() ?? "").length > 0
    ))
  )

  const handleSelectMetodoPago = (metodo: MetodoPago) => {
    if (metodoPago === metodo) {
      setMetodoPago(null)
      setPagoTotalidad(false)
    } else {
      setMetodoPago(metodo)
      if (metodo !== "efectivo") {
        setPagoTotalidad(false)
      }
    }
    setShowErrors(false)
  }

  const handleFailedSubmit = () => {
    setShowErrors(true)
    setTimeout(() => {
      const firstError = document.querySelector('.error-field, .error-specific')

      if (firstError) {
        const headerOffset = 120
        const elementPosition = firstError.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: "smooth" })
      }
    }, 100)
  }

  const handleAccordionToggle = (e: React.MouseEvent<HTMLDetailsElement>) => {
    const details = e.currentTarget;
    if (!details.open) {
      setTimeout(() => {
        const headerOffset = 100;
        const elementPosition = details.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }, 150);
    }
  };

  return {
    // Estado y setters que el JSX de las páginas usa directamente
    selectedDate,
    selectedTurno,
    setSelectedTurno,
    showErrors,
    setShowErrors,
    extras,
    setExtras,
    metodoPago,
    pagoTotalidad,
    setPagoTotalidad,
    datosCliente,
    setDatosCliente,
    // Derivados
    reglasFecha,
    calculos,
    canSubmit,
    isValidEmail,
    isValidPhone,
    isValidPersonaje,
    errorPersonajeVacio,
    // Handlers
    handleSelectDate,
    handleSelectMetodoPago,
    handleFailedSubmit,
    handleAccordionToggle,
  }
}
