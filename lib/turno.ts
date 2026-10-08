/** Lun–vie fuera de temporada: precio fijo; el horario concreto va en `label`. */
export type LunVieTurno = { id: "lun_vie"; label: string }

export type Turno = "primero" | "segundo" | LunVieTurno | null

export type PrecioTurnoKey = "primero" | "segundo" | "lun_vie"

export function getTurnoLabel(turno: NonNullable<Turno>): string {
  if (turno === "primero") return "1er Turno (12:00 - 16:00)"
  if (turno === "segundo") return "2do Turno (18:30 - 22:30)"
  return turno.label
}

/** Clave para `PRECIOS.turnos` — todo horario lun–vie usa `lun_vie`. */
export function precioTurnoKey(turno: NonNullable<Turno>): PrecioTurnoKey {
  if (turno === "primero") return "primero"
  if (turno === "segundo") return "segundo"
  return "lun_vie"
}

/**
 * Suma 1 hora a la hora de FIN de un horario si la reserva tiene hora extra.
 * Toma la última hora que aparece en el texto, así funciona con todos los
 * formatos guardados: "1er Turno (12:00 - 16:00)", "12:00 a 16:00 hs", "12 a 16".
 * Respeta el formato original (con o sin ":mm", con o sin cero adelante).
 */
export function horarioConHoraExtra(horario: string, horaExtra: boolean): string {
  if (!horaExtra || !horario) return horario

  const regex = /(\d{1,2})(?::(\d{2}))?/g
  let ultima: RegExpExecArray | null = null
  let m: RegExpExecArray | null
  while ((m = regex.exec(horario)) !== null) ultima = m
  if (!ultima) return horario

  const [textoOriginal, horaStr, minutos] = ultima
  const nuevaHora = (Number(horaStr) + 1) % 24
  const horaFmt = horaStr.length === 2 ? String(nuevaHora).padStart(2, "0") : String(nuevaHora)
  const reemplazo = minutos !== undefined ? `${horaFmt}:${minutos}` : horaFmt

  return horario.slice(0, ultima.index) + reemplazo + horario.slice(ultima.index + textoOriginal.length)
}
