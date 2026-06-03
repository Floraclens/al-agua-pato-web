"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Turno, LunVieTurno } from "@/lib/turno"
import { createBrowserClient } from "@/lib/supabase/client"
import { obtenerReglasParaFecha, obtenerReglasEgresaditos } from "@/lib/config-reservas"
import { Calendar as CalendarIcon, CheckCircle, ChevronDown, Search, AlertCircle, Clock, Loader2 } from "lucide-react"

const LABEL_MANANA = "12:00 a 16:00 hs"
const LABEL_NOCHE = "18:30 a 22:30 hs"

// --- HELPERS ---
function pad2(n: number) { return String(n).padStart(2, "0") }

// Label ultracorto para que no se rompa el diseño en pantallas de celulares chicos
function obtenerLabelTurnoCorto(turno: Turno): string {
  if (!turno) return ""
  if (typeof turno === "string") {
    return turno === "primero" ? "Mañana" : "Tarde/Noche"
  }
  return turno.label.split(" a ")[0] + " hs"
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

function showDualFixedSlots(date: Date, isEgresadito: boolean = false): boolean {
  const reglas = isEgresadito ? obtenerReglasEgresaditos(date) : obtenerReglasParaFecha(date)
  return reglas?.modalidad === 'doble_turno_fijo'
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

// --- COMPONENTE PRINCIPAL ---
interface ReservationCalendarProps {
  selectedDate: Date | undefined
  onSelectDate: (date: Date | undefined) => void
  onTurnoBooked: (turno: Turno) => void
  ignoreReservaId?: number
  isEgresadito?: boolean 
}

type VerificationState = 'idle' | 'checking' | 'success' | 'error'

export function ReservationCalendar({
  selectedDate,
  onSelectDate,
  onTurnoBooked,
  ignoreReservaId,
  isEgresadito = false 
}: ReservationCalendarProps) {
  
  const [fechaBuscada, setFechaBuscada] = useState<Date | undefined>(selectedDate)
  const [turnoBuscado, setTurnoBuscado] = useState<Turno | null>(null)
  
  // UI States
  const [showCalendar, setShowCalendar] = useState(false)
  const [showHours, setShowHours] = useState(false) 
  const [verificacion, setVerificacion] = useState<VerificationState>('idle')
  const [dateWarning, setDateWarning] = useState(false)

  const disabledDays = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date <= today) return true

    if (isEgresadito) {
      const month = date.getMonth() + 1 
      if (month !== 11 && month !== 12) return true
    }
    return false
  }, [isEgresadito])

  const handleDateSelect = (date: Date | undefined) => {
    setFechaBuscada(date)
    setTurnoBuscado(null)
    setVerificacion('idle')
    setDateWarning(false)
    setShowCalendar(false) 
    
    if (date) {
      setShowHours(true) 
    }
    
    onSelectDate(undefined) 
  }

  const handleTurnSelect = (turno: Turno) => {
    setTurnoBuscado(turno)
    setVerificacion('idle')
    setShowHours(false) 
  }

  const handleFakeTurnClick = () => {
    setDateWarning(true)
    setShowCalendar(true) 
    setShowHours(false)
    setTimeout(() => setDateWarning(false), 4000)
  }

  const handleVerify = async () => {
    if (!fechaBuscada || !turnoBuscado) return

    setVerificacion('checking')
    
    const y = fechaBuscada.getFullYear()
    const m = String(fechaBuscada.getMonth() + 1).padStart(2, "0")
    const d = String(fechaBuscada.getDate()).padStart(2, "0")
    const dateStr = `${y}-${m}-${d}`

    const supabase = createBrowserClient()
    let query = supabase.from("reservas").select("turno").eq("fecha", dateStr)
    if (ignoreReservaId) query = query.neq("id", ignoreReservaId)

    const { data, error } = await query

    if (error) {
      console.error("Error consultando disponibilidad:", error)
      setVerificacion('error')
      return
    }

    const bookedSlots = data ? data.map(r => r.turno) : []
    const isDual = showDualFixedSlots(fechaBuscada, isEgresadito)

    let isOverlap = false
    if (isDual) {
      if (turnoBuscado === "primero") isOverlap = checkOverlap(12 * 60, 16 * 60, bookedSlots)
      if (turnoBuscado === "segundo") isOverlap = checkOverlap(18 * 60 + 30, 22 * 60 + 30, bookedSlots)
    } else {
      if (isLunVieTurn(turnoBuscado)) {
        isOverlap = bookedSlots.length > 0 
      }
    }

    setTimeout(() => {
      if (isOverlap) {
        setVerificacion('error')
      } else {
        setVerificacion('success')
        onSelectDate(fechaBuscada)
        onTurnoBooked(turnoBuscado)
      }
    }, 600)
  }

  const defaultMonth = useMemo(() => {
    if (!isEgresadito) return undefined;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    if (currentMonth < 11) return new Date(today.getFullYear(), 10, 1); 
    return today;
  }, [isEgresadito]);

  const lunVieStartOptions: number[] = []
  if (fechaBuscada) {
    const reglas = isEgresadito ? obtenerReglasEgresaditos(fechaBuscada) : obtenerReglasParaFecha(fechaBuscada)
    if (reglas && reglas.modalidad === 'turno_flexible' && reglas.ultimo_inicio_permitido) {
      const [horaInicio] = reglas.franja_horaria.inicio.split(':').map(Number)
      const [horaUltimoInicio, minutoUltimoInicio] = reglas.ultimo_inicio_permitido.split(':').map(Number)
      const ultimoInicioMinutos = horaUltimoInicio * 60 + minutoUltimoInicio
      for (let min = horaInicio * 60; min <= ultimoInicioMinutos; min += 30) {
        lunVieStartOptions.push(min)
      }
    }
  }

  const isDual = fechaBuscada ? showDualFixedSlots(fechaBuscada, isEgresadito) : false

  return (
    <div className="w-full space-y-4">
      
      {/* 1. BARRA DE CONTROL (Botones 50/50 en todas las pantallas) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        
        {/* BOTÓN FECHA */}
        <button
          type="button"
          onClick={() => { setShowCalendar(!showCalendar); setShowHours(false); }}
          className={cn(
            "w-full h-[68px] sm:h-[72px] px-3 sm:px-4 rounded-2xl border-2 flex items-center justify-between transition-all bg-white text-left",
            fechaBuscada ? "border-azul-marino shadow-sm" : "border-slate-200 hover:border-azul-claro",
            dateWarning && !fechaBuscada && "border-red-300 ring-2 ring-red-100",
            showCalendar && "border-azul-marino ring-2 ring-azul-marino/10"
          )}
        >
          <div className="flex flex-col items-start overflow-hidden w-full">
            <span className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", dateWarning && !fechaBuscada ? "text-red-500" : "text-slate-400")}>
              1. Fecha
            </span>
            <span className={cn("text-xs sm:text-sm font-bold truncate w-full", fechaBuscada ? "text-azul-marino" : "text-slate-400")}>
              {fechaBuscada ? format(fechaBuscada, "d MMM yyyy", { locale: es }) : "Elegir día..."}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform text-slate-400", showCalendar && "rotate-180 text-azul-marino")} />
        </button>

        {/* BOTÓN HORARIO */}
        <button
          type="button"
          onClick={fechaBuscada ? () => { setShowHours(!showHours); setShowCalendar(false); } : handleFakeTurnClick}
          className={cn(
            "w-full h-[68px] sm:h-[72px] px-3 sm:px-4 rounded-2xl border-2 flex items-center justify-between transition-all bg-white text-left",
            turnoBuscado ? "border-azul-marino shadow-sm" : "border-slate-200 hover:border-azul-claro",
            showHours && "border-azul-marino ring-2 ring-azul-marino/10"
          )}
        >
          <div className="flex flex-col items-start overflow-hidden w-full">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              2. Horario
            </span>
            <span className={cn("text-xs sm:text-sm font-bold truncate w-full", turnoBuscado ? "text-azul-marino" : "text-slate-400")}>
              {turnoBuscado ? obtenerLabelTurnoCorto(turnoBuscado) : "Elegir hora..."}
            </span>
          </div>
          <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform text-slate-400", showHours && "rotate-180 text-azul-marino")} />
        </button>

      </div>

      {/* ALERTA: Si intenta elegir horario sin elegir fecha */}
      {dateWarning && !fechaBuscada && (
        <div className="flex items-center justify-center gap-2 text-red-500 bg-red-50 py-2.5 px-3 rounded-xl border border-red-100 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-bold leading-tight text-center">Por favor, seleccioná la fecha primero.</span>
        </div>
      )}

      {/* 2. PANEL DESPLEGABLE: CALENDARIO (Ocupa el 100% del ancho abajo de los botones) */}
      {showCalendar && (
        <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={fechaBuscada}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              defaultMonth={fechaBuscada || defaultMonth} 
              locale={es}
              className="rounded-xl border-none bg-transparent p-0 w-full max-w-[340px]"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4 w-full",
                caption: "flex justify-center pt-1 relative items-center mb-2",
                caption_label: "text-[16px] font-black text-azul-marino capitalize",
                nav: "space-x-1 flex items-center",
                nav_button: "h-8 w-8 bg-white border border-slate-200 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100",
                nav_button_previous: "absolute left-0",
                nav_button_next: "absolute right-0",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-between w-full mb-2",
                head_cell: "text-slate-400 font-extrabold text-[10px] uppercase w-8 sm:w-10 text-center",
                row: "flex justify-between w-full mt-1.5",
                cell: "h-9 w-8 sm:w-10 text-center p-0",
                day: "h-9 w-8 sm:w-10 p-0 font-bold text-slate-600 bg-white border border-transparent hover:border-slate-300 rounded-lg shadow-sm transition-all",
                day_selected: "!bg-azul-marino !text-white !font-black scale-105 shadow-md",
                day_today: "border-2 !border-amarillo",
                day_outside: "text-slate-300 opacity-40 font-medium bg-transparent shadow-none border-none",
                day_disabled: "text-slate-200 opacity-30 cursor-not-allowed bg-transparent shadow-none border-none",
              }}
            />
          </div>
        </div>
      )}

      {/* 3. PANEL DESPLEGABLE: HORARIOS (Ocupa el 100% del ancho) */}
      {showHours && fechaBuscada && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-300">
          {isDual ? (
            /* FIN DE SEMANA / TEMPORADA ALTA */
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleTurnSelect("primero")}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4",
                  turnoBuscado === "primero" ? "bg-naranja text-white border-naranja font-bold shadow-md" : "bg-white text-azul-marino hover:border-naranja/40 border-slate-200"
                )}
              >
                <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Turno Mañana</span>
                <span className="text-base font-extrabold">{LABEL_MANANA}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTurnSelect("segundo")}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4",
                  turnoBuscado === "segundo" ? "bg-lavanda text-white border-lavanda font-bold shadow-md" : "bg-white text-azul-marino hover:border-lavanda/40 border-slate-200"
                )}
              >
                <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Turno Tarde/Noche</span>
                <span className="text-base font-extrabold">{LABEL_NOCHE}</span>
              </button>
            </div>
          ) : (
            /* DÍAS DE SEMANA FLEXIBLES */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {lunVieStartOptions.map((min) => {
                const labelFormateado = formatFourHourRange(min)
                const isSelected = isLunVieTurn(turnoBuscado!) && turnoBuscado?.label === labelFormateado
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => handleTurnSelect({ id: "lun_vie", label: labelFormateado })}
                    className={cn(
                      "py-3 px-2 text-xs sm:text-sm font-bold rounded-xl border-2 text-center transition-all",
                      isSelected
                        ? "bg-azul-marino text-white border-azul-marino shadow-md scale-[1.03]"
                        : "bg-white text-azul-marino border-slate-200 hover:border-azul-marino hover:bg-slate-50"
                    )}
                  >
                    {formatClock(min)} hs
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. BOTÓN VERIFICAR Y RESPUESTA (Solo cuando todo está cerrado y elegido) */}
      {fechaBuscada && turnoBuscado && !showCalendar && !showHours && (
        <div className="animate-in fade-in slide-in-from-bottom-2 mt-2">
          {verificacion === 'idle' || verificacion === 'loading' ? (
            <button
              type="button"
              onClick={handleVerify}
              disabled={verificacion === 'loading'}
              className="w-full h-14 bg-verde hover:bg-green-600 text-white font-black rounded-xl shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {verificacion === 'loading' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
              ) : (
                <><Search className="w-5 h-5" /> Verificar Disponibilidad</>
              )}
            </button>
          ) : null}

          {/* MENSAJES DE ERROR PERSONALIZADOS (Lógica inteligente condicional) */}
          {verificacion === 'error' && (
            <div className="bg-red-50 border-2 border-red-200 p-5 rounded-2xl text-center shadow-inner animate-in zoom-in-95">
              <div className="mx-auto bg-red-100 text-red-500 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              
              {isDual ? (
                <>
                  {/* Mensaje para días con múltiples turnos (Fin de semana) */}
                  <p className="text-red-700 font-black text-sm mb-1 uppercase tracking-wide">Turno Ocupado</p>
                  <p className="text-red-500 text-xs font-medium mb-4">Por favor, verificá disponibilidad en el otro horario o elegí un día diferente.</p>
                </>
              ) : (
                <>
                  {/* Mensaje para días con evento único (Días de semana flexibles) */}
                  <p className="text-red-700 font-black text-sm mb-1 uppercase tracking-wide">Fecha Ocupada</p>
                  <p className="text-red-500 text-xs font-medium mb-4">Realizamos un único evento por día bajo esta modalidad. Por favor, elegí otra fecha.</p>
                </>
              )}
              
              <button 
                onClick={() => { setVerificacion('idle'); setShowCalendar(!isDual); setShowHours(isDual); }} 
                className="text-xs font-black bg-white border-2 border-red-200 text-red-600 px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors w-full sm:w-auto"
              >
                Modificar Búsqueda
              </button>
            </div>
          )}

          {/* RESULTADO LIBRE */}
          {verificacion === 'success' && (
            <div className="bg-green-50 border-2 border-verde/40 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-in zoom-in-95">
              <div className="bg-verde text-white p-1.5 rounded-full shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-800 font-black text-sm uppercase tracking-wide mb-0.5">¡Turno Confirmado Libre!</p>
                <p className="text-green-700 text-xs font-medium">Hemos reservado este espacio temporalmente para vos. Completá tus datos abajo para asegurar la fecha.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}