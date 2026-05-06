"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Turno, LunVieTurno } from "@/lib/turno"
import { createBrowserClient } from "@/lib/supabase/client"

const LABEL_MANANA = "12:00 a 16:00 hs"
const LABEL_NOCHE = "18:30 a 22:30 hs"

const LUN_VIE_FIRST_START = 12 * 60

const FERIADOS: string[] = [
  "2026-05-01",
  "2026-05-25",
  "2026-06-17",
  "2026-06-20",
  "2026-07-09",
  "2026-10-12",
  "2026-11-20",
  "2026-12-08",
  "2026-12-25"
]

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${pad2(h)}:${pad2(m)}`
}

function formatFourHourRange(startMinutes: number): string {
  const endMin = startMinutes + 4 * 60
  return `${formatClock(startMinutes)} a ${formatClock(endMin)} hs`
}

function isLunVieTurn(t: NonNullable<Turno>): t is LunVieTurno {
  return typeof t === "object" && t !== null && "id" in t && t.id === "lun_vie"
}

// Alta temporada: Del 15 de Diciembre hasta fines de Marzo
function isHighSeason(date: Date): boolean {
  const m = date.getMonth() + 1
  const d = date.getDate()
  if (m === 12 && d >= 15) return true
  if (m >= 1 && m <= 3) return true 
  return false
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

function isHoliday(date: Date): boolean {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return FERIADOS.includes(`${y}-${m}-${d}`)
}

// Define si el día tiene 2 turnos fijos (Fines de semana, Feriados o Temporada Alta)
function showDualFixedSlots(date: Date): boolean {
  return isWeekend(date) || isHighSeason(date) || isHoliday(date)
}

function parseTimeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number)
  return h * 60 + m
}

function checkOverlap(slotStartMin: number, slotEndMin: number, bookedLabels: string[]): boolean {
  for (const label of bookedLabels) {
    const matches = label.match(/(\d{1,2}):(\d{2})/g)
    if (matches && matches.length >= 2) {
      const bookedStart = parseTimeStringToMinutes(matches[0])
      const bookedEnd = parseTimeStringToMinutes(matches[1])
      
      if (Math.max(slotStartMin, bookedStart) < Math.min(slotEndMin, bookedEnd)) {
        return true
      }
    }
  }
  return false
}

interface ReservationCalendarProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  onTurnoBooked: (turno: Turno) => void
}

export function ReservationCalendar({
  selectedDate,
  onSelectDate,
  onTurnoBooked,
}: ReservationCalendarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [activeBubble, setActiveBubble] = useState<string | number | null>(null)
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Estado para guardar todas las reservas y pintar el calendario
  const [globalBookings, setGlobalBookings] = useState<Record<string, string[]>>({})

  useEffect(() => {
    setIsMounted(true)
    
    // Buscar todas las reservas al iniciar para colorear el calendario
    async function fetchAllReservations() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from("reservas").select("fecha, turno")
      if (!error && data) {
        const mapping: Record<string, string[]> = {}
        data.forEach((r) => {
          const dateOnly = r.fecha.split("T")[0]
          if (!mapping[dateOnly]) mapping[dateOnly] = []
          mapping[dateOnly].push(r.turno)
        })
        setGlobalBookings(mapping)
      }
    }
    fetchAllReservations()
  }, [])

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([])
      return
    }

    async function fetchReservations() {
      setIsLoadingSlots(true)
      const supabase = createBrowserClient()
      
      const y = selectedDate!.getFullYear()
      const m = String(selectedDate!.getMonth() + 1).padStart(2, "0")
      const d = String(selectedDate!.getDate()).padStart(2, "0")
      const dateStr = `${y}-${m}-${d}`

      const { data, error } = await supabase
        .rpc("obtener_turnos_ocupados", { fecha_busqueda: dateStr })

      if (!error && data) {
        setBookedSlots(data.map((r: { turno: string }) => r.turno))
      } else if (error) {
        console.error("Error al obtener turnos:", error)
      }
      setIsLoadingSlots(false)
    }

    fetchReservations()
  }, [selectedDate])

  // Evalúa si un día está 100% ocupado para pintarlo de rojo
  const isDayFullyBooked = useCallback((date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    const dateStr = `${y}-${m}-${d}`

    const bookings = globalBookings[dateStr] || []
    if (bookings.length === 0) return false

    const isDual = showDualFixedSlots(date)
    if (isDual) {
      return bookings.length >= 2 
    } else {
      return bookings.length >= 1 
    }
  }, [globalBookings])

  // MODIFICADO: Solo desactiva "hoy" y fechas pasadas. Permite reservar para mañana.
  const disabledDays = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date <= today
  }, [])

  const handleSelectDate = useCallback(
    (date: Date | undefined) => {
      onSelectDate(date)
      setActiveBubble(null)
    },
    [onSelectDate]
  )

  const handleTurnSelect = useCallback(
    (turno: NonNullable<Turno>, bubbleId: string | number) => {
      if (!selectedDate) return

      const dual = showDualFixedSlots(selectedDate)
      if (dual && isLunVieTurn(turno)) return
      if (!dual && (turno === "primero" || turno === "segundo")) return

      setActiveBubble(bubbleId)
      onTurnoBooked(turno)
    },
    [selectedDate, onTurnoBooked]
  )

  if (!isMounted) {
    return <div className="flex justify-center min-h-[350px]" />
  }

  const isDual = selectedDate ? showDualFixedSlots(selectedDate) : false

  const isPrimeroBooked = isDual ? checkOverlap(12 * 60, 16 * 60, bookedSlots) : false
  const isSegundoBooked = isDual ? checkOverlap(18 * 60 + 30, 22 * 60 + 30, bookedSlots) : false
  const isLunVieFullyBooked = !isDual && bookedSlots.length > 0

  // Generación dinámica de horarios de Lunes a Viernes
  const lunVieStartOptions: number[] = []
  if (selectedDate) {
    const m = selectedDate.getMonth() + 1
    const d = selectedDate.getDate()
    
    let lastStart = 15 * 60 // Por defecto: Abril a Agosto (inicio máximo a las 15:00)
    
    // Si es de Septiembre al 14 de Diciembre, el horario se extiende (inicio máximo a las 18:30)
    if ((m >= 9 && m <= 11) || (m === 12 && d <= 14)) {
      lastStart = 18 * 60 + 30 
    }
    
    for (let min = LUN_VIE_FIRST_START; min <= lastStart; min += 30) {
      lunVieStartOptions.push(min)
    }
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Tarjetas informativas de los horarios */}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-azul-claro/10 rounded-xl p-4 text-center border border-azul-claro/20 shadow-sm flex flex-col justify-center">
          <span className="font-extrabold text-xs uppercase tracking-wider text-azul-marino mb-1">📅 Lunes a Viernes</span>
          <span className="text-[10px] text-azul-marino/70 mb-2 uppercase font-semibold">(Abril al 14 de Dic)</span>
          <span className="text-xs font-medium text-azul-marino">Un evento por día. Horario de 4hs a elección.</span>
        </div>
        <div className="bg-naranja/10 rounded-xl p-4 text-center border border-naranja/20 shadow-sm flex flex-col justify-center">
          <span className="font-extrabold text-xs uppercase tracking-wider text-azul-marino mb-1">⭐ Sáb/Dom, Feriados y Verano</span>
          <span className="text-[10px] text-azul-marino/70 mb-2 uppercase font-semibold">(15 Dic a fines de Marzo)</span>
          <span className="text-xs font-medium text-azul-marino">Dos turnos fijos: 12:00 a 16:00 o 18:30 a 22:30.</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-500 uppercase mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white border border-slate-300 shadow-sm" /> Disponible
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-400 shadow-sm" /> Ocupado
        </div>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelectDate}
          disabled={(date) => disabledDays(date) || isDayFullyBooked(date)}
          locale={es}
          className="rounded-xl border border-border/50 bg-background p-3"
          modifiers={{
            ocupado: (date) => isDayFullyBooked(date),
          }}
          modifiersClassNames={{
            ocupado: "!bg-red-100 !text-red-600 !line-through !opacity-100 !font-bold border border-red-300"
          }}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-bold text-azul-marino capitalize",
            nav: "space-x-1 flex items-center",
            nav_button: "h-9 w-9 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-azul-claro/20 rounded-lg transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] capitalize",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-rosa/20 rounded-lg transition-colors",
            day_range_end: "day-range-end",
            day_selected: "bg-azul-marino text-white hover:bg-azul-marino hover:text-white focus:bg-azul-marino focus:text-white font-bold",
            day_today: "bg-amarillo/30 text-azul-marino font-bold",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-30",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
        />
      </div>

      {!selectedDate && (
        <p className="text-sm text-muted-foreground text-center">
          Seleccioná un día en el calendario para ver los horarios disponibles.
        </p>
      )}

      {selectedDate && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div>
            <p className="text-sm font-bold text-azul-marino text-center mb-1">
              Horarios disponibles para el{" "}
              {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>

          {isLoadingSlots ? (
            <p className="text-sm text-center text-muted-foreground">Verificando disponibilidad...</p>
          ) : isDual ? (
            isPrimeroBooked && isSegundoBooked ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center shadow-sm">
                <p className="text-red-600 font-semibold text-sm">
                  ❌ Este día ya se encuentra completamente reservado.
                </p>
                <p className="text-red-500/80 text-xs mt-1">
                  (Ambos turnos están ocupados)
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isPrimeroBooked}
                  onClick={() => handleTurnSelect("primero", "primero")}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 transition-all min-h-[76px]",
                    isPrimeroBooked
                      ? "border-red-200 bg-red-50/80 text-red-500/80 cursor-not-allowed"
                      : activeBubble === "primero"
                      ? "border-naranja bg-naranja text-white shadow-md scale-[1.02]"
                      : "border-azul-marino/20 bg-naranja/10 text-azul-marino hover:border-azul-marino"
                  )}
                >
                  <span className="text-sm font-semibold">{LABEL_MANANA}</span>
                  {isPrimeroBooked && (
                    <span className="text-xs font-bold text-red-600 mt-1">❌ Turno Reservado</span>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSegundoBooked}
                  onClick={() => handleTurnSelect("segundo", "segundo")}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 px-4 py-3 transition-all min-h-[76px]",
                    isSegundoBooked
                      ? "border-red-200 bg-red-50/80 text-red-500/80 cursor-not-allowed"
                      : activeBubble === "segundo"
                      ? "border-lavanda bg-lavanda text-white shadow-md scale-[1.02]"
                      : "border-azul-marino/20 bg-lavanda/10 text-azul-marino hover:border-azul-marino"
                  )}
                >
                  <span className="text-sm font-semibold">{LABEL_NOCHE}</span>
                  {isSegundoBooked && (
                    <span className="text-xs font-bold text-red-600 mt-1">❌ Turno Reservado</span>
                  )}
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {isLunVieFullyBooked ? (
                 <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center shadow-sm">
                   <p className="text-red-600 font-semibold text-sm">
                     ❌ Este día ya se encuentra reservado. 
                   </p>
                   <p className="text-red-500/80 text-xs mt-1">
                     (Solo se realiza un evento por día de lunes a viernes)
                   </p>
                 </div>
              ) : (
                <>
                  <p className="text-sm text-center text-foreground/90 leading-relaxed mb-3">
                    Elegí la hora de inicio de tu evento (duración de 4 horas):
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {lunVieStartOptions.map((min) => {
                      const labelFormateado = formatFourHourRange(min)
                      const isSelected = activeBubble === min

                      return (
                        <button
                          key={min}
                          type="button"
                          onClick={() =>
                            handleTurnSelect(
                              { id: "lun_vie", label: labelFormateado },
                              min
                            )
                          }
                          className={cn(
                            "rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-200",
                            isSelected
                              ? "bg-azul-marino text-white border-azul-marino shadow-md scale-105"
                              : "bg-background text-azul-marino border-azul-marino/30 hover:bg-azul-marino hover:text-white"
                          )}
                        >
                          {formatClock(min)}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}