"use client"

import React, { useState } from "react"
import {
  Users,
  Home,
  Armchair,
  Waves,
  Popcorn,
  PartyPopper,
  Cake,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown // <-- Agregado para la flechita del acordeón
} from "lucide-react"

interface ServiceItem {
  text: string
  highlight?: "warning"
}

interface ServiceCategory {
  id: string
  titulo: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  shadowColor: string
  items: ServiceItem[]
  nota?: {
    text: string
    type: "warning" | "info"
  }
}

const serviciosData: ServiceCategory[] = [
  {
    id: "capacidad",
    titulo: "Capacidad",
    icon: Users,
    color: "text-rosa",
    bgColor: "bg-rosa/10",
    borderColor: "border-rosa/20",
    shadowColor: "hover:shadow-rosa/10",
    items: [
      { text: "Máx 60 adultos y 40 niños" },
      { text: "Edad límite 8 añitos (sin excepción)", highlight: "warning" },
      { text: "Baños equipados" },
      { text: "Limpieza general antes y después" },
      { text: "Música" },
      { text: "2 mozos incluidos" },
    ],
  },
  {
    id: "instalaciones",
    titulo: "Instalaciones",
    icon: Home,
    color: "text-azul-claro",
    bgColor: "bg-azul-claro/10",
    borderColor: "border-azul-claro/20",
    shadowColor: "hover:shadow-azul-claro/10",
    items: [
      { text: "Salón/Quincho cerrado y climatizado" },
      { text: "Asador, galería y living" },
      { text: "Aire acondicionado" },
      { text: "Ventiladores de techo" },
      { text: "Freezer y heladera exhibidora vertical" },
      { text: "Horno, pava y microondas" },
      { text: "Lo básico para asador" },
    ],
  },
  {
    id: "mobiliario",
    titulo: "Mobiliario",
    icon: Armchair,
    color: "text-naranja",
    bgColor: "bg-naranja/10",
    borderColor: "border-naranja/20",
    shadowColor: "hover:shadow-naranja/10",
    items: [
      { text: "Mesas y sillas para grandes y niños" },
      { text: "Juegos de living" },
      { text: "Vasos, platos y jarras" },
      { text: "Vajilla para compartir" },
      { text: "Servilleteros e hieleras" },
      { text: "4 Equipos de mates" },
    ],
    nota: {
      text: "Aclaración: NO incluye vajilla individual",
      type: "warning",
    },
  },
  {
    id: "juegos",
    titulo: "Juegos",
    icon: Waves,
    color: "text-azul-claro",
    bgColor: "bg-azul-claro/10",
    borderColor: "border-azul-claro/20",
    shadowColor: "hover:shadow-azul-claro/10",
    items: [
      { text: "Pileta (45cm de alto) con parque acuático" },
      { text: "Montaña con toboganes y túneles" },
      { text: "Cama elástica" },
      { text: "Casita del árbol con tobogán y escalador" },
      { text: "Cancha de fútbol 8" },
      { text: "Castillo inflable con tobogán 3x5" },
      { text: "Pista de Karting (10 unidades)" },
      { text: "Rollers/Patines (Traer propios)" },
      { text: "Monopatín y Triciclos" },
      { text: "Andadores (3 unidades)" },
    ],
  },
  {
    id: "maquinas",
    titulo: "Snacks",
    icon: Popcorn,
    color: "text-amarillo",
    bgColor: "bg-amarillo/10",
    borderColor: "border-amarillo/20",
    shadowColor: "hover:shadow-amarillo/10",
    items: [
      { text: "2 Panchukeras" },
      { text: "Pochoclera" },
      { text: "Cascada de Chocolate (incluye bowls)" },
    ],
    nota: {
      text: "Solo las 3 primeras horas. NO incluye materia prima",
      type: "warning",
    },
  },
  {
    id: "decoracion",
    titulo: "Ambientación",
    icon: PartyPopper,
    color: "text-rosa",
    bgColor: "bg-rosa/10",
    borderColor: "border-rosa/20",
    shadowColor: "hover:shadow-rosa/10",
    items: [
      { text: "Escenario" },
      { text: "Telas blancas con luces LED" },
      { text: "Panel circular (1.20m, fondo LED)" },
      { text: "Panel triangular" },
      { text: "Panel rectangular con abertura" },
      { text: "Neón 'Feliz Cumpleaños'" },
    ],
  },
  {
    id: "candybar",
    titulo: "Candy Bar",
    icon: Cake,
    color: "text-naranja",
    bgColor: "bg-naranja/10",
    borderColor: "border-naranja/20",
    shadowColor: "hover:shadow-naranja/10",
    items: [
      { text: "4 Mesas cuadradas de distintas alturas" },
      { text: "Posatorta y posa chupetines" },
      { text: "Porta cupcakes" },
      { text: "Mini kiosko y más" },
    ],
  },
]

export function ServiciosIncluidos() {
  // Estado para el Acordeón en móviles (Iniciamos con el primero abierto)
  const [openAccordion, setOpenAccordion] = useState<string | null>(serviciosData[0].id)

  return (
    <div className="space-y-8 md:space-y-12">
      
      {/* --- VISTA MÓVIL: ACORDEÓN INTUITIVO --- */}
      <div className="md:hidden flex flex-col space-y-3 px-2">
        <p className="text-center text-sm font-bold text-azul-marino/60 mb-2">Toca cada categoría para ver detalles 👇</p>
        
        {serviciosData.map((servicio) => {
          const isOpen = openAccordion === servicio.id;
          const Icon = servicio.icon;

          return (
            <div
              key={servicio.id}
              className={`overflow-hidden bg-white rounded-2xl border-2 transition-all duration-300 ${
                isOpen ? `${servicio.borderColor} shadow-md` : "border-slate-100 shadow-sm"
              }`}
            >
              {/* Botón que despliega */}
              <button
                onClick={() => setOpenAccordion(isOpen ? null : servicio.id)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${servicio.bgColor} border border-white flex items-center justify-center shrink-0 shadow-inner`}>
                    <Icon className={`w-6 h-6 ${servicio.color}`} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-azul-marino leading-tight">
                      {servicio.titulo}
                    </h3>
                    <span className={`inline-block mt-1 text-[10px] font-extrabold ${servicio.color} bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider`}>
                      {servicio.items.length} incluidos
                    </span>
                  </div>
                </div>
                {/* Flechita animada */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-slate-100' : ''}`}>
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                </div>
              </button>

              {/* Contenido desplegable */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-4 pt-0 border-t border-slate-50/50 mt-1">
                  <div className="grid grid-cols-1 gap-2">
                    {servicio.items.map((item, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-xl ${
                          item.highlight === "warning"
                            ? "bg-red-50/50 border border-red-50"
                            : "bg-slate-50/50 border border-transparent"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {item.highlight === "warning" ? (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle2 className={`w-4 h-4 ${servicio.color}`} />
                          )}
                        </div>
                        <span className={`text-[13px] leading-snug font-bold pt-0.5 ${
                          item.highlight === "warning" ? "text-red-700" : "text-slate-700"
                        }`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Nota */}
                  {servicio.nota && (
                    <div className={`mt-3 flex items-start gap-2.5 text-xs font-extrabold p-3 rounded-xl border ${servicio.nota.type === "warning" ? "text-red-800 bg-red-50/50 border-red-100" : "text-azul-marino bg-azul-claro/10 border-azul-claro/20"}`}>
                      <AlertTriangle className={`w-4 h-4 shrink-0 ${servicio.nota.type === "warning" ? "text-red-600" : "text-azul-claro"}`} />
                      <p className="pt-0.5">{servicio.nota.text}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* --- VISTA ESCRITORIO: GRILLA BENTO (Intacta) --- */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 lg:gap-8">
        {serviciosData.map((servicio, index) => {
          const Icon = servicio.icon
          const isLast = index === serviciosData.length - 1

          return (
            <div
              key={servicio.id}
              className={`relative overflow-hidden bg-white rounded-[2rem] border-2 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl ${servicio.borderColor} ${servicio.shadowColor} ${isLast ? 'md:col-span-2' : ''} group`}
            >
              <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                <Icon className={`w-64 h-64 ${servicio.color}`} />
              </div>
              <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${servicio.bgColor.replace('10', '5')} to-transparent pointer-events-none`} />

              <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${servicio.bgColor} border border-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0`}>
                    <Icon className={`w-7 h-7 ${servicio.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-azul-marino tracking-tight leading-tight">
                      {servicio.titulo}
                    </h3>
                    <div className="flex items-center mt-1.5">
                      <span className={`text-[10px] md:text-xs font-extrabold ${servicio.color} bg-white border border-slate-100 shadow-sm px-2.5 py-0.5 rounded-full uppercase tracking-wider`}>
                        {servicio.items.length} incluidos
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 gap-2.5 flex-1 ${isLast ? 'md:grid-cols-2 lg:grid-cols-4' : ''}`}>
                  {servicio.items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-300 h-full ${
                        item.highlight === "warning"
                          ? "bg-red-50/50 border border-red-100 hover:bg-red-50"
                          : "bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0`}>
                        {item.highlight === "warning" ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <CheckCircle2 className={`w-5 h-5 ${servicio.color}`} />
                        )}
                      </div>
                      <span className={`text-[14px] leading-snug font-bold pt-0.5 ${
                        item.highlight === "warning" ? "text-red-700" : "text-slate-700"
                      }`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {servicio.nota && (
                  <div
                    className={`mt-5 flex items-start gap-3 text-sm font-extrabold p-4 rounded-2xl border shadow-inner ${
                      servicio.nota.type === "warning"
                        ? "text-red-800 bg-gradient-to-r from-red-50 to-white border-red-200"
                        : "text-azul-marino bg-gradient-to-r from-azul-claro/10 to-white border-azul-claro/20"
                    }`}
                  >
                    <div className={`p-1.5 rounded-full shrink-0 ${servicio.nota.type === "warning" ? "bg-red-200" : "bg-azul-claro/20"}`}>
                      <AlertTriangle className={`w-4 h-4 ${servicio.nota.type === "warning" ? "text-red-600" : "text-azul-claro"}`} />
                    </div>
                    <p className="pt-1 text-[13px] leading-tight">{servicio.nota.text}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Súper Cartelito de Todo Incluido */}
      <div className="relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 p-8 rounded-[2.5rem] bg-gradient-to-r from-amarillo via-[#fbbf24] to-naranja border-4 border-white shadow-2xl group hover:scale-[1.02] transition-transform duration-500 max-w-4xl mx-auto mt-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
        
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full shrink-0 relative z-10 shadow-[inset_0_2px_10px_rgba(255,255,255,0.5)] border border-white/30">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="text-center md:text-left relative z-10 drop-shadow-md">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">¡Todo esto está incluido!</h3>
          <p className="text-white/90 text-base md:text-lg font-bold">Reserva sin costos ocultos ni sorpresas de último momento.</p>
        </div>
      </div>

    </div>
  )
}