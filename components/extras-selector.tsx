"use client"

import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { PartyPopper, Clock, UserPlus, Users, Minus, Plus } from "lucide-react"
import type { Extras } from "@/app/page"

interface ExtrasSelectorProps {
  extras: Extras
  onChangeExtras: (extras: Extras) => void
  precios: {
    adultosAdicionales: number
    animacion: number
    horaExtra: number
    robotLed: number
    zancosLed: number
    astronautasLed: number
    personaje: number
    mozoAdicional: number
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

export function ExtrasSelector({
  extras,
  onChangeExtras,
  precios,
}: ExtrasSelectorProps) {
  
  const updateAdults = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation() 
    const newVal = Math.max(1, Math.min(10, extras.adultosAdicionales + delta))
    onChangeExtras({ ...extras, adultosAdicionales: newVal })
  }

  const personajesDisponibles = [
    "Huggy Wuggy",
    "Woody",
    "Mickey Mouse",
    "Minnie Mouse",
    "Peppa Pig",
    "Elsa",
    "Spider-Man",
    "Guardia de Squid Game",
    "Muñeca unicornio",
    "Vaca",
    "Gallo"
  ]

  const extrasOptions = [
    {
      id: "adultosAdicionales" as const, 
      titulo: "Adultos Extra",
      descripcion: "Agregá hasta 10 invitados adultos adicionales a tu evento.",
      precio: precios.adultosAdicionales,
      icon: Users,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      needsAdultsCounter: true, 
    },
    {
      id: "animacion" as const,
      titulo: "Animación",
      descripcion: "Globología, pinta cara, baile, juegos adentro/fuera pileta.",
      precio: precios.animacion,
      icon: PartyPopper,
      bgColor: "bg-rosa/20",
      iconColor: "text-rosa",
    },
    {
      id: "horaExtra" as const,
      titulo: "Hora Extra",
      descripcion: "Extiende tu fiesta una hora más para seguir disfrutando.",
      precio: precios.horaExtra,
      icon: Clock,
      bgColor: "bg-azul-claro/20",
      iconColor: "text-azul-claro",
    },
    {
      id: "mozoAdicional" as const,
      titulo: "Mozo Adicional",
      descripcion: "Agrega un mozo mas si necesitas.",
      precio: precios.mozoAdicional,
      icon: UserPlus,
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
    },
    {
      id: "robotLed" as const,
      titulo: "Robot LED",
      descripcion: "Show interactivo de Robot LED para sorprender a todos.",
      precio: precios.robotLed,
      imagen: "/extras/robot.jpg",
      bgColor: "bg-lavanda/10",
    },
    {
      id: "zancosLed" as const,
      titulo: "Zancos LED",
      descripcion: "Artista en zancos con traje de luces LED.",
      precio: precios.zancosLed,
      imagen: "/extras/zancos.jpg",
      bgColor: "bg-naranja/10",
    },
    {
      id: "astronautasLed" as const,
      titulo: "Astronautas LED",
      descripcion: "Equipo de astronautas con trajes LED luminosos.",
      precio: precios.astronautasLed,
      imagen: "/extras/astronautas.jpg",
      bgColor: "bg-azul-claro/10",
    },
    {
      id: "personaje" as const,
      titulo: "Personaje a elección",
      descripcion: "Huggy Wuggy, Woody, Mickey Mouse, Minnie Mouse, Peppa Pig, Elsa, Spider-Man, Guardia de Squid Game, Muñeca unicornio, Vaca o Gallo.",
      precio: precios.personaje,
      imagen: "/extras/personajes.jpg",
      bgColor: "bg-amarillo/10",
      needsSelectInput: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {extrasOptions.map((extra) => {
        
        const isAdultos = extra.id === "adultosAdicionales"
        const isChecked = isAdultos ? extras.adultosAdicionales > 0 : extras[extra.id as keyof Extras] === true
        const Icon = extra.icon

        return (
          <div
            key={extra.id}
            onClick={() => {
              if (extra.id === "adultosAdicionales") {
                onChangeExtras({
                  ...extras,
                  adultosAdicionales: isChecked ? 0 : 1 
                })
              } else {
                const updates: Partial<Extras> = { [extra.id]: !extras[extra.id as keyof Extras] }
                
                if (extra.id === "personaje" && isChecked) {
                  updates.personajeName = ""
                }

                onChangeExtras({ ...extras, ...updates } as Extras)
              }
            }}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group flex flex-col",
              isChecked 
                ? "border-azul-claro bg-azul-claro/5 shadow-md ring-4 ring-azul-claro/20" 
                : "border-border/60 hover:border-azul-marino/30 hover:shadow-sm"
            )}
          >
            <div className={cn(
              "relative w-full h-[200px] sm:h-48 overflow-hidden flex items-center justify-center p-2",
              extra.bgColor || "bg-slate-50"
            )}>
              {extra.imagen ? (
                <>
                  <Image 
                    src={extra.imagen} 
                    alt={extra.titulo}
                    fill
                    className={cn(
                      "object-contain p-2 transition-transform duration-700",
                      isChecked ? "scale-105" : "group-hover:scale-105"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-80" />
                </>
              ) : (
                Icon && <Icon className={cn("w-20 h-20 opacity-80 transition-transform duration-500", isChecked ? "scale-110" : "group-hover:scale-110", extra.iconColor)} />
              )}

              <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                <Checkbox
                  id={extra.id}
                  checked={isChecked}
                  onCheckedChange={() => {}} 
                  className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-azul-claro data-[state=checked]:border-azul-claro text-white pointer-events-none transition-colors"
                  aria-readonly
                />
              </div>

              <div className="absolute bottom-3 right-3 z-10 bg-azul-marino text-white px-3 py-1.5 rounded-full text-sm font-extrabold shadow-md border border-white/10">
                +{formatPrice(extra.precio)} {extra.needsAdultsCounter ? "c/u" : ""}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col bg-transparent justify-between gap-3">
              <div>
                <h4 className="font-bold text-azul-marino text-lg mb-1 flex items-center justify-between">
                  {extra.titulo}
                </h4>
                <p className="text-sm text-muted-foreground leading-snug">
                  {extra.descripcion}
                </p>
              </div>
              
              {/* Contador de Adultos */}
              {extra.needsAdultsCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-emerald-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateAdults(e, -1)} disabled={extras.adultosAdicionales <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 hover:shadow-sm disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.adultosAdicionales}</span>
                    <button type="button" onClick={(e) => updateAdults(e, 1)} disabled={extras.adultosAdicionales >= 10} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 hover:shadow-sm disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dropdown de Personajes */}
              {extra.needsSelectInput && extras.personaje && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <select 
                    className="w-full text-sm border-2 border-azul-claro/40 focus:border-azul-claro bg-white rounded-lg px-3 py-2.5 outline-none text-azul-marino font-semibold shadow-sm transition-all cursor-pointer appearance-none"
                    value={extras.personajeName || ""}
                    onChange={(e) => onChangeExtras({ ...extras, personajeName: e.target.value })}
                  >
                    <option value="" disabled>Seleccioná un personaje...</option>
                    {personajesDisponibles.map((personaje) => (
                      <option key={personaje} value={personaje}>
                        {personaje}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}