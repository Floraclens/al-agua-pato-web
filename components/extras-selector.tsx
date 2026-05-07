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

  const updateMozos = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation() 
    const newVal = Math.max(1, Math.min(10, extras.cantidadMozos + delta))
    onChangeExtras({ ...extras, cantidadMozos: newVal })
  }

  const updatePersonajesConsulta = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation() 
    const newVal = Math.max(1, Math.min(10, extras.cantidadPersonajeConsulta + delta))
    onChangeExtras({ ...extras, cantidadPersonajeConsulta: newVal })
  }

  const togglePersonaje = (e: React.MouseEvent, personaje: string) => {
    e.stopPropagation()
    const actuales = extras.personajesSeleccionados
    if (actuales.includes(personaje)) {
      onChangeExtras({ ...extras, personajesSeleccionados: actuales.filter(p => p !== personaje) })
    } else {
      onChangeExtras({ ...extras, personajesSeleccionados: [...actuales, personaje] })
    }
  }

  const isConsulting = extras.consultasPersonajes.length > 0

  const toggleConsultar = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isConsulting) {
      onChangeExtras({ ...extras, consultasPersonajes: [] }) 
    } else {
      onChangeExtras({ ...extras, consultasPersonajes: [""] }) 
    }
  }

  const updateCantConsultas = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    const current = [...extras.consultasPersonajes]
    const newLength = Math.max(1, Math.min(10, current.length + delta))
    
    if (newLength > current.length) {
      current.push("") 
    } else if (newLength < current.length) {
      current.pop() 
    }
    onChangeExtras({ ...extras, consultasPersonajes: current })
  }

  const updateConsultaText = (index: number, text: string) => {
    const current = [...extras.consultasPersonajes]
    current[index] = text
    onChangeExtras({ ...extras, consultasPersonajes: current })
  }

  const personajesDisponibles = [
    "Huggy Wuggy", "Woody", "Mickey Mouse", "Minnie Mouse", "Peppa Pig",
    "Elsa", "Spider-Man", "Guardia de Squid Game", "Muñeca unicornio", "Vaca", "Gallo"
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
      descripcion: "Agregá mozos extra si tenés muchos invitados (hasta 10).",
      precio: precios.mozoAdicional,
      icon: UserPlus,
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      needsMozoCounter: true,
    },
    {
      id: "robotLed" as const,
      titulo: "Robot LED",
      descripcion: "Show interactivo de Robot LED para sorprender a todos.",
      precio: precios.robotLed,
      imagen: "/extras/robot.jpg",
    },
    {
      id: "zancosLed" as const,
      titulo: "Zancos LED",
      descripcion: "Artista en zancos con traje de luces LED.",
      precio: precios.zancosLed,
      imagen: "/extras/zancos.jpg",
    },
    {
      id: "astronautasLed" as const,
      titulo: "Astronautas LED",
      descripcion: "Equipo de astronautas con trajes LED luminosos.",
      precio: precios.astronautasLed,
      imagen: "/extras/astronautas.jpg",
    },
    {
      id: "personaje" as const,
      titulo: "Personajes a elección",
      descripcion: "Podes elegir 1 o más personajes para animar la fiesta, o consultar por otro.",
      precio: precios.personaje,
      imagen: "/extras/personajes.jpg",
      needsMultiSelect: true,
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
                  updates.personajesSeleccionados = []
                  updates.consultasPersonajes = [] 
                }
                
                if (extra.id === "mozoAdicional" && isChecked) {
                  updates.cantidadMozos = 1
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
              "relative w-full h-[200px] sm:h-48 overflow-hidden flex items-center justify-center",
              extra.imagen ? "bg-slate-900" : (extra.bgColor || "bg-slate-50")
            )}>
              {extra.imagen ? (
                <>
                  {/* EFECTO CINE: Imagen de fondo desenfocada */}
                  <div className="absolute inset-0 z-0 opacity-60">
                    <Image 
                      src={extra.imagen} 
                      alt=""
                      fill
                      className="object-cover blur-xl scale-125 saturate-150"
                    />
                  </div>

                  {/* IMAGEN PRINCIPAL: Contenida y completa */}
                  <div className="absolute inset-0 z-10 p-3">
                    <Image 
                      src={extra.imagen} 
                      alt={extra.titulo}
                      fill
                      className={cn(
                        "object-contain drop-shadow-2xl transition-transform duration-700",
                        isChecked ? "scale-105" : "group-hover:scale-105"
                      )}
                    />
                  </div>
                  
                  {/* Degradado oscuro inferior para que el texto resalte */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-10 pointer-events-none" />
                </>
              ) : (
                Icon && <Icon className={cn("w-20 h-20 opacity-80 transition-transform duration-500", isChecked ? "scale-110" : "group-hover:scale-110", extra.iconColor)} />
              )}

              <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                <Checkbox
                  id={extra.id}
                  checked={isChecked}
                  onCheckedChange={() => {}} 
                  className="h-5 w-5 border-2 border-slate-300 data-[state=checked]:bg-azul-claro data-[state=checked]:border-azul-claro text-white pointer-events-none transition-colors"
                  aria-readonly
                />
              </div>

              <div className="absolute bottom-3 right-3 z-20 bg-azul-marino text-white px-3 py-1.5 rounded-full text-sm font-extrabold shadow-md border border-white/10">
                +{formatPrice(extra.precio)} {(extra.needsAdultsCounter || extra.needsMozoCounter || extra.needsMultiSelect) ? "c/u" : ""}
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

              {extra.needsMozoCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-indigo-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateMozos(e, -1)} disabled={extras.cantidadMozos <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 hover:shadow-sm disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.cantidadMozos}</span>
                    <button type="button" onClick={(e) => updateMozos(e, 1)} disabled={extras.cantidadMozos >= 10} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 hover:shadow-sm disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {extra.needsMultiSelect && extras.personaje && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full space-y-4 pt-3 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-2">
                    {personajesDisponibles.map((personaje) => (
                      <button
                        key={personaje}
                        onClick={(e) => togglePersonaje(e, personaje)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors w-auto text-left whitespace-normal h-auto break-words",
                          extras.personajesSeleccionados.includes(personaje)
                            ? "bg-amarillo text-azul-marino border-amarillo"
                            : "bg-white text-muted-foreground border-slate-200 hover:border-amarillo"
                        )}
                      >
                        {personaje}
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={toggleConsultar}
                      className={cn(
                        "w-full text-sm font-bold rounded-lg px-4 py-2.5 transition-all text-left border-2",
                        isConsulting 
                          ? "bg-azul-claro/10 text-azul-marino border-azul-claro/40" 
                          : "bg-slate-50 text-muted-foreground border-slate-200 hover:border-amarillo hover:text-azul-marino"
                      )}
                    >
                      {isConsulting ? "✓ Ocultar consulta de personajes" : "+ Consultar por otro personaje"}
                    </button>

                    {isConsulting && (
                      <div className="mt-3 space-y-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">¿Cuántos querés consultar?</span>
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1 h-[36px]">
                            <button type="button" onClick={(e) => updateCantConsultas(e, -1)} disabled={extras.consultasPersonajes.length <= 1} className="w-8 h-full flex items-center justify-center rounded-md hover:bg-slate-200 disabled:opacity-50 text-azul-marino transition-all">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center font-extrabold text-azul-marino text-sm">{extras.consultasPersonajes.length}</span>
                            <button type="button" onClick={(e) => updateCantConsultas(e, 1)} disabled={extras.consultasPersonajes.length >= 5} className="w-8 h-full flex items-center justify-center rounded-md hover:bg-slate-200 disabled:opacity-50 text-azul-marino transition-all">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 mt-2">
                          {extras.consultasPersonajes.map((consulta, idx) => (
                            <input
                              key={idx}
                              type="text"
                              placeholder={`Nombre del personaje ${idx + 1}...`}
                              className="w-full text-sm border-2 border-slate-200 focus:border-amarillo bg-slate-50 focus:bg-white rounded-lg px-3 py-2 outline-none text-azul-marino font-medium transition-all"
                              value={consulta}
                              onChange={(e) => updateConsultaText(idx, e.target.value)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}