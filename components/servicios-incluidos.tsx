"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Users,
  Home,
  Armchair,
  Waves,
  Car,
  Popcorn,
  PartyPopper,
  Cake,
  Sparkles,
  AlertTriangle,
  CheckCircle2 // <-- Agregamos el tilde verde para las mini-tarjetas
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
  items: ServiceItem[]
  nota?: {
    text: string
    type: "warning" | "info"
  }
}

const serviciosAccordion: ServiceCategory[] = [
  {
    id: "capacidad",
    titulo: "Capacidad y General",
    icon: Users,
    color: "text-rosa",
    bgColor: "bg-rosa/10",
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
    titulo: "Juegos y Entretenimiento",
    icon: Waves,
    color: "text-azul-claro",
    bgColor: "bg-azul-claro/10",
    items: [
      { text: "Pileta (45cm de alto) con juegos de parque acuático y flotadores" },
      { text: "Montaña con toboganes y túneles" },
      { text: "Cama elástica" },
      { text: "Casita del árbol con tobogán y escalador" },
      { text: "Cancha de fútbol 8" },
      { text: "Castillo inflable con tobogán 3x5" },
      { text: "Pista de Karting (10 unidades)" },
      { text: "Rollers/Patines (Traer tus rollers o patines)" },
      { text: "Monopatín (3 unidades)" },
      { text: "Triciclos (2 unidades)" },
      { text: "Andadores (3 unidades)" },
    ],
  },
  {
    id: "maquinas",
    titulo: "Estación Snack",
    icon: Popcorn,
    color: "text-amarillo",
    bgColor: "bg-amarillo/10",
    items: [
      { text: "Panchukera" },
      { text: "Pochoclera" },
      { text: "Cascada de Chocolate (incluye 10 bowls para toppings)" },
    ],
    nota: {
      text: "Solo las 3 primeras horas. NO incluye materia prima",
      type: "warning",
    },
  },
  {
    id: "decoracion",
    titulo: "Decoración",
    icon: PartyPopper,
    color: "text-rosa",
    bgColor: "bg-rosa/10",
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
    items: [
      { text: "Mesas cuadradas de distintas alturas" },
      { text: "Posatorta y posa chupetines" },
      { text: "Porta cupcakes" },
      { text: "Mini kiosko y más" },
    ],
  },
]

export function ServiciosIncluidos() {
  return (
    <div className="space-y-5">
      <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
        {serviciosAccordion.map((servicio) => {
          const Icon = servicio.icon
          return (
            <AccordionItem
              key={servicio.id}
              value={servicio.id}
              className="border border-border/50 rounded-2xl bg-white shadow-sm overflow-hidden group data-[state=open]:border-azul-marino/20 data-[state=open]:shadow-md transition-all duration-300"
            >
              <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 w-full pr-4">
                  {/* Ícono Principal */}
                  <div className={`w-12 h-12 rounded-full ${servicio.bgColor} flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${servicio.color}`} />
                  </div>
                  
                  {/* Título y Badge de cantidad */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-extrabold text-azul-marino text-left text-lg">
                      {servicio.titulo}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                      {servicio.items.length} incluidos
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5 pt-2">
                {/* Nueva Grilla de Mini-Tarjetas en lugar de una lista de texto aburrida */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {servicio.items.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-xl border ${
                        item.highlight === "warning"
                          ? "bg-red-50/50 border-red-100"
                          : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      } transition-colors`}
                    >
                      {/* El ícono cambia si es una advertencia o un check normal */}
                      {item.highlight === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${servicio.color}`} />
                      )}
                      
                      <span className={`text-sm leading-snug font-medium ${
                        item.highlight === "warning" ? "text-red-700" : "text-azul-marino/80"
                      }`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Notas o aclaraciones (ej: la vajilla, materia prima) */}
                {servicio.nota && (
                  <div
                    className={`mt-4 flex items-start gap-2 text-sm font-bold p-3.5 rounded-xl border ${
                      servicio.nota.type === "warning"
                        ? "text-red-700 bg-red-50 border-red-200"
                        : "text-azul-marino bg-azul-claro/10 border-azul-claro/20"
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p>{servicio.nota.text}</p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {/* Cartelito final de Todo Incluido */}
      <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-r from-amarillo/20 via-amarillo/10 to-transparent border border-amarillo/30 shadow-sm">
        <Sparkles className="w-6 h-6 text-amarillo shrink-0 animate-pulse" />
        <p className="text-base text-azul-marino">
          <span className="font-extrabold">¡Todo incluido!</span> Sin costos ocultos ni sorpresas.
        </p>
      </div>
    </div>
  )
}