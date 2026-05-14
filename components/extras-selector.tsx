"use client"

import { useState } from "react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { PartyPopper, Clock, UserPlus, Users, Minus, Plus, Eye, EyeOff, AlertCircle } from "lucide-react"
import { PRECIOS } from "@/lib/config-reservas"

interface ExtrasSelectorProps {
  extras: any
  onChangeExtras: (extras: any) => void
  showPileta?: boolean
  showErrors?: boolean // NUEVO: Propiedad para recibir el aviso de error desde el padre
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
  showPileta = false,
  showErrors = false // Recibe si debe mostrar errores
}: ExtrasSelectorProps) {
  
  const [preciosRevelados, setPreciosRevelados] = useState<string[]>([])

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

  const updateRobot = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    const current = typeof extras.robotLed === 'number' ? extras.robotLed : (extras.robotLed ? 1 : 0)
    const newVal = Math.max(1, Math.min(2, current + delta))
    onChangeExtras({ ...extras, robotLed: newVal })
  }

  const updateZancos = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation()
    const current = typeof extras.zancosLed === 'number' ? extras.zancosLed : (extras.zancosLed ? 1 : 0)
    const newVal = Math.max(1, Math.min(2, current + delta))
    onChangeExtras({ ...extras, zancosLed: newVal })
  }

  const togglePersonaje = (e: React.MouseEvent, personaje: string) => {
    e.stopPropagation()
    const actuales = extras.personajesSeleccionados || []
    if (actuales.includes(personaje)) {
      onChangeExtras({ ...extras, personajesSeleccionados: actuales.filter((p: string) => p !== personaje) })
    } else {
      onChangeExtras({ ...extras, personajesSeleccionados: [...actuales, personaje] })
    }
  }

  const personajesDisponibles = [
    "ALEGRIA", "AMONG US", "BATMAN", "BIZARRAP", "CAPIBARA", "CAPITAN AMERICA", 
    "DADY YANKEE", "DEADPOOL", "DINOSAURIO T-REX", "DOCTORA JUGUETE", "EL JUEGO DEL CALAMAR", 
    "ELSA", "FROZEN", "GOKU", "GRANJA DE ZENON", "HARLEY QUINN", "HELLO KITTY", 
    "HUGGY WUGGY", "HULK", "HUNTRIX (GUERRERAS K-POP)", "IRONMAN", "KUROMI", 
    "LADYBUG", "LOL", "MARIO BROS", "MESSI", "MICKEY Y MINNIE", "MINNION", 
    "MOANA", "MUJER MARAVILLA", "PAPÁ NOEL", "PATRULLA CANINA", "PEPPA PIG", 
    "PJ MASKS", "PLIM-PLIM", "PRINCESITA SOFÍA", "SIRENITA", "SONIC", 
    "SPIDERMAN", "STICH", "SUPERMAN", "THOR", "UNICORNIO", "VISION", "WOLVERINE"
  ]

  let extrasOptions = [
    {
      id: "adultosAdicionales", 
      titulo: "Adultos Extra",
      descripcion: "Agregá invitados adultos extra (Límite máximo: 10 adultos).",
      precio: PRECIOS.opcionales.adultosAdicionales,
      icon: Users,
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      needsAdultsCounter: true, 
      precioTexto: `+${formatPrice(PRECIOS.opcionales.adultosAdicionales)} c/u`
    },
    {
      id: "animacion",
      titulo: "Animación",
      descripcion: "Globología, pinta cara, baile, juegos adentro/fuera pileta.",
      precio: PRECIOS.opcionales.animacion,
      icon: PartyPopper,
      bgColor: "bg-rosa/20",
      iconColor: "text-rosa",
      precioTexto: `+${formatPrice(PRECIOS.opcionales.animacion)}`
    },
    {
      id: "horaExtra",
      titulo: "Hora Extra",
      descripcion: "Extiende tu fiesta una hora más para seguir disfrutando.",
      precio: PRECIOS.opcionales.horaExtra,
      icon: Clock,
      bgColor: "bg-azul-claro/20",
      iconColor: "text-azul-claro",
      precioTexto: `+${formatPrice(PRECIOS.opcionales.horaExtra)}`
    },
    {
      id: "mozoAdicional",
      titulo: "Mozo Adicional",
      descripcion: "Agregá mozos extra si tenés muchos invitados.",
      precio: PRECIOS.opcionales.mozoAdicional,
      icon: UserPlus,
      bgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-500",
      needsMozoCounter: true,
      precioTexto: `+${formatPrice(PRECIOS.opcionales.mozoAdicional)} c/u`
    },
    {
      id: "robotLed",
      titulo: "Robot LED",
      descripcion: "Show interactivo de Robot LED. 1 hora de servicio.",
      precio: PRECIOS.opcionales.robot_led.uno,
      imagen: "/extras/robot.jpg",
      needsRobotCounter: true,
      precioTexto: `+${formatPrice(PRECIOS.opcionales.robot_led.uno)} (o 2 x ${formatPrice(PRECIOS.opcionales.robot_led.dos)})`
    },
    {
      id: "zancosLed",
      titulo: "Zancos LED",
      descripcion: "Artista en zancos con traje de luces LED. 1 hora de servicio.",
      precio: PRECIOS.opcionales.zancos_led.precio_unidad,
      imagen: "/extras/zancos.jpg",
      needsZancosCounter: true,
      precioTexto: `+${formatPrice(PRECIOS.opcionales.zancos_led.precio_unidad)} c/u`
    },
    {
      id: "personaje",
      titulo: "Personajes a elección",
      descripcion: "Podes elegir 1 o más personajes para animar la fiesta. 1 hora de servicio.",
      precio: PRECIOS.opcionales.personaje.precio_unidad,
      imagen: "/extras/personajes.jpg",
      needsMultiSelect: true,
      precioTexto: `+${formatPrice(PRECIOS.opcionales.personaje.precio_unidad)} c/u`
    },
  ]

  if (showPileta) {
    extrasOptions.push({
      id: "pileta",
      titulo: "Acceso a la Pileta",
      descripcion: PRECIOS.opcionales.pileta.detalle,
      precio: PRECIOS.opcionales.pileta.precio,
      imagen: "/extras/pileta.jpg", 
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
      precioTexto: `+${formatPrice(PRECIOS.opcionales.pileta.precio)}`
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {extrasOptions.map((extra) => {
        
        const isAdultos = extra.id === "adultosAdicionales"
        const isRobot = extra.id === "robotLed"
        const isZancos = extra.id === "zancosLed"
        
        const isChecked = 
          isAdultos ? extras.adultosAdicionales > 0 : 
          isRobot ? extras.robotLed > 0 :
          isZancos ? extras.zancosLed > 0 :
          extras[extra.id] === true

        const isRevealed = preciosRevelados.includes(extra.id) || isChecked;
        const Icon = extra.icon

        // NUEVO: Detectar si esta tarjeta específica tiene un error (personaje sin elegir)
        const hasPersonajeError = showErrors && extra.id === "personaje" && isChecked && (!extras.personajesSeleccionados || extras.personajesSeleccionados.length === 0);

        return (
          <div
            key={extra.id}
            onClick={() => {
              if (isAdultos) {
                onChangeExtras({ ...extras, adultosAdicionales: isChecked ? 0 : 1 })
              } else if (isRobot) {
                onChangeExtras({ ...extras, robotLed: isChecked ? 0 : 1 })
              } else if (isZancos) {
                onChangeExtras({ ...extras, zancosLed: isChecked ? 0 : 1 })
              } else {
                const updates: any = { [extra.id]: !extras[extra.id] }
                
                if (extra.id === "personaje" && isChecked) {
                  updates.personajesSeleccionados = []
                }
                
                if (extra.id === "mozoAdicional" && isChecked) {
                  updates.cantidadMozos = 1
                }

                onChangeExtras({ ...extras, ...updates })
              }
            }}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer group flex flex-col",
              // Inyectamos la clase 'error-specific' y estilos rojos SOLO en la tarjeta que falla
              hasPersonajeError ? "error-specific border-red-500 ring-4 ring-red-500/20 bg-red-50/10 shadow-lg" : 
              isChecked ? "border-azul-claro bg-azul-claro/5 shadow-md ring-4 ring-azul-claro/20" : 
              "border-border/60 hover:border-azul-marino/30 hover:shadow-sm"
            )}
          >
            <div className={cn(
              "relative w-full h-[200px] sm:h-48 overflow-hidden flex items-center justify-center",
              extra.imagen ? "bg-slate-900" : (extra.bgColor || "bg-slate-50")
            )}>
              {extra.imagen ? (
                <>
                  <div className="absolute inset-0 z-0 opacity-60">
                    <Image 
                      src={extra.imagen} 
                      alt=""
                      fill
                      className="object-cover blur-xl scale-125 saturate-150"
                    />
                  </div>
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
                  className={cn(
                    "h-5 w-5 border-2 text-white pointer-events-none transition-colors",
                    hasPersonajeError ? "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" : "border-slate-300 data-[state=checked]:bg-azul-claro data-[state=checked]:border-azul-claro"
                  )}
                  aria-readonly
                />
              </div>

              <div className={cn(
                "absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full text-sm font-extrabold shadow-md border transition-all duration-300",
                hasPersonajeError ? "bg-red-500 text-white border-red-400" :
                isChecked ? "bg-azul-marino text-white border-white/10" : 
                "bg-white/95 text-slate-700 border-white/20 backdrop-blur-sm hover:bg-slate-100"
              )}>
                {isChecked ? (
                  extra.precioTexto
                ) : isRevealed ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreciosRevelados(prev => prev.filter(item => item !== extra.id));
                    }}
                    className="flex items-center gap-2 group/btn"
                    title="Ocultar precio"
                  >
                    {extra.precioTexto} 
                    <EyeOff className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-700 transition-colors" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreciosRevelados(prev => [...prev, extra.id]);
                    }}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                  >
                    <Eye className="w-3.5 h-3.5" /> Ver precio
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col bg-transparent justify-between gap-3">
              <div>
                <h4 className={cn("font-bold text-lg mb-1 flex items-center justify-between", hasPersonajeError ? "text-red-600" : "text-azul-marino")}>
                  {extra.titulo}
                </h4>
                <p className="text-sm text-muted-foreground leading-snug">
                  {extra.descripcion}
                </p>
              </div>
              
              {extra.needsAdultsCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-emerald-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateAdults(e, -1)} disabled={extras.adultosAdicionales <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.adultosAdicionales}</span>
                    <button type="button" onClick={(e) => updateAdults(e, 1)} disabled={extras.adultosAdicionales >= 10} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {extra.needsRobotCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-blue-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateRobot(e, -1)} disabled={(extras.robotLed || 0) <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.robotLed || 1}</span>
                    <button type="button" onClick={(e) => updateRobot(e, 1)} disabled={(extras.robotLed || 0) >= 2} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {extra.needsZancosCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-purple-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateZancos(e, -1)} disabled={(extras.zancosLed || 0) <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.zancosLed || 1}</span>
                    <button type="button" onClick={(e) => updateZancos(e, 1)} disabled={(extras.zancosLed || 0) >= 2} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {extra.needsMozoCounter && isChecked && (
                <div className="animate-in slide-in-from-top-2 duration-300 w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 bg-white border border-indigo-200 shadow-sm rounded-lg p-1.5 w-fit">
                    <button type="button" onClick={(e) => updateMozos(e, -1)} disabled={extras.cantidadMozos <= 1} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-8 text-center font-extrabold text-azul-marino text-xl">{extras.cantidadMozos}</span>
                    <button type="button" onClick={(e) => updateMozos(e, 1)} disabled={extras.cantidadMozos >= 10} className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-slate-100 disabled:opacity-50 text-azul-marino transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {extra.needsMultiSelect && extras.personaje && (
                <div className={cn("animate-in slide-in-from-top-2 duration-300 w-full pt-3 border-t", hasPersonajeError ? "border-red-200" : "border-slate-200")} onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 pb-2">
                    {personajesDisponibles.map((personaje) => (
                      <button
                        key={personaje}
                        onClick={(e) => togglePersonaje(e, personaje)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-bold border transition-colors w-auto text-left whitespace-normal h-auto break-words",
                          (extras.personajesSeleccionados || []).includes(personaje)
                            ? "bg-amarillo text-azul-marino border-amarillo shadow-sm"
                            : hasPersonajeError ? "bg-white text-red-500 border-red-300 hover:bg-red-50" 
                            : "bg-white text-muted-foreground border-slate-200 hover:border-amarillo hover:bg-slate-50"
                        )}
                      >
                        {personaje}
                      </button>
                    ))}
                  </div>
                  
                  {/* NUEVO: Mensaje de error inyectado directamente abajo de la lista de botones */}
                  {hasPersonajeError && (
                    <div className="mt-2 flex items-start gap-1.5 text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-bold leading-tight">
                        ¡Atención! No seleccionaste ningún personaje. Elegí al menos uno para continuar o destildá la opción.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}