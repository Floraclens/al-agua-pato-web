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
