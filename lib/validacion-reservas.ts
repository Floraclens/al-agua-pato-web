/**
 * Sistema de validación de reservas usando la configuración centralizada
 * Este archivo contiene todas las validaciones de negocio para las reservas
 */

import { obtenerReglasParaFecha, obtenerReglasEgresaditos, determinarTemporada } from "./config-reservas"
import type { Turno } from "./turno"

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Valida que una fecha y turno sean válidos según las reglas configuradas
 */
export function validarFechaYTurno(fecha: Date, turno: Turno, isEgresadito: boolean = false): ValidationResult {
  const errors: ValidationError[] = []

  // Validar que la fecha no sea en el pasado
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  if (fecha <= hoy) {
    errors.push({
      field: 'fecha',
      message: 'La fecha debe ser posterior a hoy'
    })
  }

  // Validar que se haya seleccionado un turno
  if (!turno) {
    errors.push({
      field: 'turno',
      message: 'Debe seleccionar un turno'
    })
    return { isValid: false, errors }
  }

  // Obtener reglas para la fecha según si es egresadito o no
  const reglas = isEgresadito ? obtenerReglasEgresaditos(fecha) : obtenerReglasParaFecha(fecha)

  // Validar compatibilidad del turno con la modalidad
  if (reglas.modalidad === 'doble_turno_fijo') {
    // En modalidad de turnos fijos, solo se permiten "primero" o "segundo"
    if (typeof turno === 'object' && turno.id === 'lun_vie') {
      errors.push({
        field: 'turno',
        message: `En ${reglas.temporada?.replace('_', ' ') || 'esta fecha'}, solo se permiten turnos fijos (Turno 1 o Turno 2)`
      })
    }
  } else {
    // En modalidad flexible, solo se permite turno flexible
    if (turno === 'primero' || turno === 'segundo') {
      errors.push({
        field: 'turno',
        message: `En esta fecha, solo se permite un turno flexible (elegir hora de inicio)`
      })
    }

    // Validar que el turno flexible esté dentro de la franja horaria permitida
    if (typeof turno === 'object' && turno.id === 'lun_vie') {
      const horaLabel = turno.label
      const horaInicioMatch = horaLabel.match(/(\d{1,2}):(\d{2})/)
      
      if (horaInicioMatch) {
        const [, hora, minutos] = horaInicioMatch.map(Number)
        const inicioMinutos = hora * 60 + minutos
        
        // Validar que esté dentro de la franja horaria
        const [horaInicioPermitida] = reglas.franja_horaria.inicio.split(':').map(Number)
        const [horaFinPermitida, minutoFinPermitido] = reglas.franja_horaria.fin.split(':').map(Number)
        const inicioPermitidoMinutos = horaInicioPermitida * 60
        const finPermitidoMinutos = horaFinPermitida * 60 + minutoFinPermitido
        
        if (inicioMinutos < inicioPermitidoMinutos || inicioMinutos + 4 * 60 > finPermitidoMinutos) {
          errors.push({
            field: 'turno',
            message: `El turno debe estar dentro de la franja horaria permitida (${reglas.franja_horaria.inicio} a ${reglas.franja_horaria.fin})`
          })
        }

        // Validar último inicio permitido
        if (reglas.ultimo_inicio_permitido) {
          const [horaUltimo, minutoUltimo] = reglas.ultimo_inicio_permitido.split(':').map(Number)
          const ultimoInicioPermitidoMinutos = horaUltimo * 60 + minutoUltimo
          
          if (inicioMinutos > ultimoInicioPermitidoMinutos) {
            errors.push({
              field: 'turno',
              message: `El último horario de inicio permitido es ${reglas.ultimo_inicio_permitido}`
            })
          }
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida que el precio calculado sea correcto según la configuración
 */
export function validarPrecio(fecha: Date, turno: Turno, precioCalculado: number, isEgresadito: boolean = false): ValidationResult {
  const errors: ValidationError[] = []

  if (!turno) {
    return { isValid: false, errors: [{ field: 'precio', message: 'No hay turno seleccionado' }] }
  }

  const reglas = isEgresadito ? obtenerReglasEgresaditos(fecha) : obtenerReglasParaFecha(fecha)
  let precioEsperado = 0

  if (reglas.modalidad === 'doble_turno_fijo') {
    if (reglas.precios) {
      // Temporada alta o media fin de semana
      if (turno === 'primero') {
        precioEsperado = reglas.precios.turno_1
      } else if (turno === 'segundo') {
        precioEsperado = reglas.precios.turno_2
      }
    } else {
      precioEsperado = reglas.precio || 0
    }
  } else {
    // Turno flexible
    precioEsperado = reglas.precio || 0
  }

  if (precioCalculado !== precioEsperado) {
    errors.push({
      field: 'precio',
      message: `El precio calculado ($${precioCalculado.toLocaleString('es-AR')}) no coincide con el precio esperado ($${precioEsperado.toLocaleString('es-AR')})`
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida todos los datos de una reserva
 */
export function validarReservaCompleta(
  fecha: Date,
  turno: Turno,
  datosCliente: {
    nombre: string
    telefono: string
    email: string
    institucion?: string // NUEVO CAMPO OPCIONAL
    sala?: string        // NUEVO CAMPO OPCIONAL
    turno_colegio?: string // NUEVO CAMPO OPCIONAL
  },
  metodoPago: string,
  isEgresadito: boolean = false // NUEVO PARÁMETRO PARA ACTIVAR LAS REGLAS DE EGRESADOS
): ValidationResult {
  const errors: ValidationError[] = []

  // Validar fecha y turno
  const validacionFechaTurno = validarFechaYTurno(fecha, turno, isEgresadito)
  errors.push(...validacionFechaTurno.errors)

  // Validar datos del cliente
  if (!datosCliente.nombre || datosCliente.nombre.trim().length < 3) {
    errors.push({
      field: 'nombre',
      message: 'El nombre debe tener al menos 3 caracteres'
    })
  }

  const telefonoSoloNumeros = datosCliente.telefono.replace(/\D/g, '')
  if (!telefonoSoloNumeros || telefonoSoloNumeros.length < 10) {
    errors.push({
      field: 'telefono',
      message: 'El teléfono debe tener al menos 10 dígitos'
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!datosCliente.email || !emailRegex.test(datosCliente.email)) {
    errors.push({
      field: 'email',
      message: 'El email no es válido'
    })
  }

  // Validar método de pago
  if (!metodoPago || !['efectivo', 'transferencia', 'tarjeta'].includes(metodoPago)) {
    errors.push({
      field: 'metodo_pago',
      message: 'Debe seleccionar un método de pago válido'
    })
  }

  // REGLAS ESPECÍFICAS DE EGRESADITOS
  if (isEgresadito) {
    if (!datosCliente.institucion || datosCliente.institucion.trim() === '') {
      errors.push({ field: 'institucion', message: 'El nombre de la institución es obligatorio' })
    }
    if (!datosCliente.sala || datosCliente.sala.trim() === '') {
      errors.push({ field: 'sala', message: 'La sala o curso es obligatoria' })
    }
    if (!datosCliente.turno_colegio || datosCliente.turno_colegio.trim() === '') {
      errors.push({ field: 'turno_colegio', message: 'El turno del colegio es obligatorio' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Obtiene un mensaje descriptivo de los errores de validación
 */
export function formatearErroresValidacion(errors: ValidationError[]): string {
  if (errors.length === 0) return ''
  
  return errors.map(error => `• ${error.message}`).join('\n')
}