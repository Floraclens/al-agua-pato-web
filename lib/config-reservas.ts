/**
 * Configuración centralizada de precios y reglas de reservas
 * Este archivo contiene todas las variables que el dueño del código puede modificar
 * sin necesidad de tocar la lógica de negocio.
 */

// Feriados estáticos de Argentina (Año 2026)
export const FERIADOS: string[] = [
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-03-23", "2026-03-24",
  "2026-04-02", "2026-04-03", "2026-05-01", "2026-05-25", "2026-06-15",
  "2026-06-20", "2026-07-09", "2026-07-10", "2026-08-17", "2026-10-12",
  "2026-11-23", "2026-12-07", "2026-12-08", "2026-12-25"
]

// PRECIOS CENTRALIZADOS
// PRECIOS CENTRALIZADOS
export const PRECIOS = {
  // Temporadas de Predio
  temporada_baja: { lunes_a_viernes: 700000, fines_de_semana: 700000 },
  temporada_media: { lunes_a_viernes: 710000, fines_de_semana: 710000 },
  temporada_alta: { turno_1_fijo: 730000, turno_2_fijo: 740000 },

  // --- SERVICIOS OPCIONALES (Personalizá tu evento) ---
  opcionales: {
    adultosAdicionales: 7000,
    animacion: 70000,
    horaExtra: 200000,
    robot_led: { // ACÁ ESTABA EL ERROR (antes decía robotLed)
      uno: 200000,
      dos: 350000,
      detalle: "1 hora de servicio"
    },
    zancos_led: { // ACÁ TAMBIÉN (antes decía zancosLed)
      precio_unidad: 200000,
      max: 2,
      detalle: "1 hora de servicio"
    },
    personaje: {
      precio_unidad: 125000,
      detalle: "1 hora de servicio"
    },
    mozoAdicional: 40000,
    pileta: {
      precio: 250000,
      meses_disponibles: [4, 5, 6, 7, 8], // Abril a Agosto
      detalle: "Solo disponible de Abril a Agosto"
    }
  }
}

export const HORARIOS = {
  duracion_turno_horas: 4,
  temporada_baja: {
    dias_aplica: "lunes_a_domingo",
    modalidad: "turno_flexible",
    franja_horaria: { inicio: "12:00", fin: "19:00" },
    ultimo_inicio_permitido: "15:00"
  },
  temporada_media: {
    lunes_a_viernes: {
      modalidad: "turno_flexible",
      franja_horaria: { inicio: "12:00", fin: "22:30" },
      ultimo_inicio_permitido: "18:30"
    },
    sabados_domingos_feriados: {
      modalidad: "doble_turno_fijo",
      turnos: [
        { id: "turno_1", nombre: "Turno 1", horario: "12:00 a 16:00", inicio_minutos: 720, fin_minutos: 960 },
        { id: "turno_2", nombre: "Turno 2", horario: "18:30 a 22:30", inicio_minutos: 1110, fin_minutos: 1350 }
      ]
    }
  },
  temporada_alta: {
    dias_aplica: "lunes_a_domingo",
    modalidad: "doble_turno_fijo",
    turnos: [
      { id: "turno_1", nombre: "Turno 1", horario: "12:00 a 16:00", inicio_minutos: 720, fin_minutos: 960 },
      { id: "turno_2", nombre: "Turno 2", horario: "18:30 a 22:30", inicio_minutos: 1110, fin_minutos: 1350 }
    ]
  }
}

export function determinarTemporada(fecha: Date): 'temporada_baja' | 'temporada_media' | 'temporada_alta' {
  const mes = fecha.getMonth() + 1
  const dia = fecha.getDate()
  if ((mes === 12 && dia >= 15) || (mes >= 1 && mes <= 3)) return 'temporada_alta'
  if (mes >= 4 && mes <= 8) return 'temporada_baja'
  return 'temporada_media'
}

export function esFinDeSemanaOFeriado(fecha: Date): boolean {
  const diaSemana = fecha.getDay()
  const esFinDeSemana = diaSemana === 0 || diaSemana === 6
  const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
  return esFinDeSemana || FERIADOS.includes(fechaStr)
}

export function obtenerReglasParaFecha(fecha: Date) {
  const temporada = determinarTemporada(fecha)
  const esFinde = esFinDeSemanaOFeriado(fecha)
  const mesActual = fecha.getMonth() + 1
  
  // Verificamos si la pileta está disponible para el mes de la fecha seleccionada
  const pileta_disponible = PRECIOS.opcionales.pileta.meses_disponibles.includes(mesActual)

  let baseReglas: any = { temporada, pileta_disponible }

  if (temporada === 'temporada_baja') {
    return { ...baseReglas, modalidad: HORARIOS.temporada_baja.modalidad, precio: PRECIOS.temporada_baja.lunes_a_viernes, franja_horaria: HORARIOS.temporada_baja.franja_horaria, ultimo_inicio_permitido: HORARIOS.temporada_baja.ultimo_inicio_permitido }
  }
  
  if (temporada === 'temporada_media') {
    if (esFinde) {
      return { ...baseReglas, modalidad: HORARIOS.temporada_media.sabados_domingos_feriados.modalidad, precio: PRECIOS.temporada_media.fines_de_semana, turnos: HORARIOS.temporada_media.sabados_domingos_feriados.turnos }
    }
    return { ...baseReglas, modalidad: HORARIOS.temporada_media.lunes_a_viernes.modalidad, precio: PRECIOS.temporada_media.lunes_a_viernes, franja_horaria: HORARIOS.temporada_media.lunes_a_viernes.franja_horaria, ultimo_inicio_permitido: HORARIOS.temporada_media.lunes_a_viernes.ultimo_inicio_permitido }
  }

  return { ...baseReglas, modalidad: HORARIOS.temporada_alta.modalidad, precio: PRECIOS.temporada_alta.turno_1_fijo, franja_horaria: { inicio: "12:00", fin: "22:30" }, turnos: HORARIOS.temporada_alta.turnos, precios: { turno_1: PRECIOS.temporada_alta.turno_1_fijo, turno_2: PRECIOS.temporada_alta.turno_2_fijo } }
}