"use client"

import { cn } from "@/lib/utils"
import { Sun, Moon, CalendarDays, Clock } from "lucide-react"
import type { Turno } from "@/app/page"

interface TurnoSelectorProps {
  selectedTurno: Turno
  onSelectTurno: (turno: Turno) => void
  precios: {
    primero: number
    segundo: number
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function TurnoSelector({
  selectedTurno,
  onSelectTurno,
  precios,
}: TurnoSelectorProps) {
  const turnos = [
    {
      id: "primero" as const,
      titulo: "1er Turno (Día)",
      horario: "12:00 a 16:00 hs",
      descripcion: "Ideal para cumpleaños de mediodía",
      precio: precios.primero,
      icon: Sun,
      bgColor: "bg-naranja/10",
      iconColor: "text-naranja",
    },
    {
      id: "segundo" as const,
      titulo: "2do Turno (Noche)",
      horario: "18:30 a 22:30 hs",
      descripcion: "Perfecto para fiestas de tarde-noche",
      precio: precios.segundo,
      icon: Moon,
      bgColor: "bg-lavanda/10",
      iconColor: "text-lavanda",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Información de horarios disponibles */}
      <div className="bg-azul-claro/10 rounded-xl p-5 border border-azul-claro/20">
        <h4 className="font-bold text-azul-marino mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-azul-claro" />
          Horarios Disponibles:
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-naranja mt-2 shrink-0" />
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-azul-marino">
                Sábados, Domingos, Feriados y Temporada Alta (15 Dic al 28 Feb):
              </span>{" "}
              Doble turno de 12:00 a 16:00 hs y de 18:30 a 22:30 hs.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-lavanda mt-2 shrink-0" />
            <p className="text-sm text-foreground/80">
              <span className="font-semibold text-azul-marino">
                Lunes a Viernes (Resto del año):
              </span>{" "}
              1 turno de 4 horas a elección del cliente.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de turno */}
      <div>
        <h4 className="font-semibold text-azul-marino mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-azul-claro" />
          Selecciona tu turno:
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {turnos.map((turno) => {
            const isSelected = selectedTurno === turno.id
            const Icon = turno.icon

            return (
              <button
                key={turno.id}
                onClick={() => onSelectTurno(turno.id)}
                className={cn(
                  "relative p-5 rounded-xl border-2 transition-all duration-200 text-left group",
                  turno.bgColor,
                  isSelected
                    ? "border-azul-marino shadow-lg scale-[1.02]"
                    : "border-transparent hover:border-border hover:shadow-md"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-azul-marino flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      turno.bgColor
                    )}
                  >
                    <Icon className={cn("w-6 h-6", turno.iconColor)} />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-azul-marino">
                      {turno.titulo}
                    </h4>
                    <p className="text-sm font-semibold text-foreground/80 mb-1">
                      {turno.horario}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {turno.descripcion}
                    </p>
                    <p className="text-xl font-extrabold text-azul-marino">
                      {formatPrice(turno.precio)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
