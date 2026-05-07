"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ServiciosIncluidos } from "@/components/servicios-incluidos"
import { ExtrasSelector } from "@/components/extras-selector"
import { MetodoPagoSelector } from "@/components/metodo-pago-selector"
import { ResumenReserva } from "@/components/resumen-reserva"
import { PhotoGallery } from "@/components/photo-gallery"
import { Sparkles, MapPin, CheckCircle2, Star, Quote, ArrowDown, Info, PartyPopper } from "lucide-react"
import { precioTurnoKey, type Turno } from "@/lib/turno"
import { Button } from "@/components/ui/button"

export type { Turno, LunVieTurno } from "@/lib/turno"
export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | null

export interface Extras {
  adultosAdicionales: number
  cantidadMozos: number
  personajesSeleccionados: string[]
  consultasPersonajes: string[] 
  animacion: boolean
  horaExtra: boolean
  robotLed: boolean
  zancosLed: boolean
  astronautasLed: boolean
  personaje: boolean
  mozoAdicional: boolean
}

export interface DatosCliente {
  nombre: string
  telefono: string
  email: string
  nombreCumpleanero: string
  edadCumple: string
}

const PRECIOS = {
  turnos: {
    primero: 710000,
    segundo: 790000,
    lun_vie: 710000,
  },
  extras: {
    adultosAdicionales: 7000,
    animacion: 60000,
    horaExtra: 200000,
    robotLed: 50000,
    zancosLed: 40000,
    astronautasLed: 60000,
    personaje: 30000,
    mozoAdicional: 40000,
  },
  sena: 400000,
  descuentoEfectivo: 0.1,
}

export default function ReservasPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTurno, setSelectedTurno] = useState<Turno>(null)

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTurno(null)
  }
  
  const [extras, setExtras] = useState<Extras>({
    adultosAdicionales: 0,
    cantidadMozos: 1,
    personajesSeleccionados: [],
    consultasPersonajes: [], 
    animacion: false,
    horaExtra: false,
    robotLed: false,
    zancosLed: false,
    astronautasLed: false,
    personaje: false,
    mozoAdicional: false,
  })
  
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null)
  const [pagoTotalidad, setPagoTotalidad] = useState<boolean>(false)

  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: "",
    telefono: "",
    email: "",
    nombreCumpleanero: "",
    edadCumple: "",
  })

  const calculos = useMemo(() => {
    let subtotal = 0
    let precioTurno = 0
    let precioExtras = 0
    let descuento = 0

    if (selectedTurno) {
      precioTurno = PRECIOS.turnos[precioTurnoKey(selectedTurno)]
      subtotal += precioTurno
    }

    Object.keys(extras).forEach((key) => {
      if (key === "adultosAdicionales") {
        precioExtras += extras.adultosAdicionales * PRECIOS.extras.adultosAdicionales
      } else if (key === "mozoAdicional") {
        if (extras.mozoAdicional) {
          precioExtras += extras.cantidadMozos * PRECIOS.extras.mozoAdicional
        }
      } else if (key === "personaje") {
         if (extras.personaje) {
             const numSeleccionados = extras.personajesSeleccionados.length
             const numConsultas = extras.consultasPersonajes.length 
             const cantidadCobrable = numSeleccionados + numConsultas
             precioExtras += cantidadCobrable * PRECIOS.extras.personaje
         }
      } else if (key === "cantidadMozos" || key === "personajesSeleccionados" || key === "consultasPersonajes") {
        // Ignorados, se calculan arriba
      } else if (extras[key as keyof Extras] === true) {
        precioExtras += PRECIOS.extras[key as keyof typeof PRECIOS.extras]
      }
    })
    subtotal += precioExtras

    if (metodoPago === "efectivo" && pagoTotalidad && subtotal > 0) {
      descuento = subtotal * PRECIOS.descuentoEfectivo
    }

    const total = subtotal - descuento
    const senaFinal = pagoTotalidad ? total : PRECIOS.sena

    return {
      precioTurno,
      precioExtras,
      subtotal,
      descuento,
      total,
      sena: senaFinal,
    }
  }, [selectedTurno, extras, metodoPago, pagoTotalidad])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length >= 10;
  };

  const isConsulting = extras.consultasPersonajes.length > 0;
  const hasSeleccionados = extras.personajesSeleccionados.length > 0;
  const allConsultasFilled = extras.consultasPersonajes.every(c => c.trim().length > 0);

  const isValidPersonaje = !extras.personaje || 
    ((hasSeleccionados || isConsulting) && (!isConsulting || allConsultasFilled));

  const errorPersonajeVacio = extras.personaje && !hasSeleccionados && !isConsulting;
  const errorConsultaIncompleta = extras.personaje && isConsulting && !allConsultasFilled;

  const canSubmit = 
    selectedDate && 
    selectedTurno && 
    metodoPago && 
    datosCliente.nombre.trim().length >= 3 && 
    isValidPhone(datosCliente.telefono) &&
    isValidEmail(datosCliente.email) &&
    isValidPersonaje 

  const scrollToGaleria = () => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  }
  
  const scrollToReserva = () => {
    document.getElementById('seccion-reserva')?.scrollIntoView({ behavior: 'smooth' });
  }

  const handleSelectMetodoPago = (metodo: MetodoPago) => {
    if (metodoPago === metodo) {
      setMetodoPago(null)
      setPagoTotalidad(false)
    } else {
      setMetodoPago(metodo)
      if (metodo !== "efectivo") {
        setPagoTotalidad(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-background font-sans">
      
      <header className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amarillo shadow-sm bg-white shrink-0">
                <Image src="/og-image.jpg" alt="Logo Al Agua Pato" fill className="object-cover" priority />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-azul-marino tracking-tight leading-none">Al Agua Pato</h1>
                  <Sparkles className="h-5 w-5 text-amarillo hidden sm:block" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden sm:block">Predio de Eventos</span>
              </div>
            </div>
            <a href="https://maps.google.com/?q=Al+Agua+Pato+Salon+de+Fiestas" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border-2 border-azul-marino text-azul-marino hover:bg-azul-marino hover:text-white transition-all duration-200 font-bold text-xs md:text-sm rounded-full shadow-sm hover:shadow-md active:scale-95">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Ver en Maps</span>
              <span className="sm:hidden">Ubicación</span>
            </a>
          </div>
        </div>
      </header>

      {/* --- PORTADA SUPER PREMIUM --- */}
      <section className="relative pt-16 pb-16 md:pt-28 md:pb-24 text-center px-4 overflow-hidden bg-slate-50">
        
        {/* Manchas de luz desenfocadas de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-tr from-rosa/20 via-amarillo/20 to-azul-claro/20 blur-[100px] -z-10 rounded-full" />
        
        {/* Decoraciones flotantes */}
        <Sparkles className="absolute top-24 left-[10%] md:left-[20%] w-8 h-8 text-amarillo animate-pulse opacity-70" />
        <Star className="absolute bottom-32 right-[15%] md:right-[25%] w-6 h-6 text-rosa animate-bounce opacity-70" />
        <PartyPopper className="absolute top-40 right-[5%] md:right-[15%] w-10 h-10 text-azul-claro opacity-50 -rotate-12" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          
          {/* Etiqueta viva */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-rosa/30 shadow-[0_0_20px_rgba(236,72,153,0.15)] text-rosa font-black text-sm uppercase tracking-widest">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosa opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rosa"></span>
            </span>
            ¡Agenda 2026 Abierta!
          </div>

          {/* Título Monumental */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-black text-azul-marino tracking-tighter leading-[1.05] drop-shadow-sm">
              Tu evento soñado es <br className="hidden md:block" />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-2 bg-gradient-to-r from-rosa via-amarillo to-azul-claro blur-2xl opacity-40"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-rosa via-naranja to-amarillo">
                  Inolvidable
                </span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto text-balance font-medium leading-relaxed">
              <strong className="text-azul-marino font-extrabold">"Al agua pato"</strong> un espacio lleno de aventuras, juegos y experiencias únicas e inolvidables.
            </p>
          </div>

          {/* Tarjeta Sorpresa */}
          <div className="max-w-xl mx-auto relative group mt-12">
            <div className="absolute -inset-1 bg-gradient-to-r from-azul-claro via-lavanda to-rosa rounded-[2rem] blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-white via-azul-claro/5 to-rosa/5 backdrop-blur-xl ring-1 ring-white/50 rounded-[2rem] p-6 md:p-8 text-left flex items-start sm:items-center gap-5 shadow-2xl overflow-hidden">
              <Sparkles className="absolute -top-4 -left-4 w-12 h-12 text-amarillo opacity-20 rotate-12" />

              <div className="relative z-10 bg-gradient-to-br from-amarillo to-naranja p-4 rounded-2xl shrink-0 shadow-inner">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
              <div className="relative z-10">
                <h4 className="font-black text-azul-marino mb-1.5 text-lg md:text-xl">¡Se viene algo <span className="text-rosa">increíble!</span> 🚀</h4>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
                  Muy pronto estrenamos un nuevo espacio que te hará <strong className="text-naranja font-bold">saltar de diversión</strong>... ¿Estás preparado para lo que se viene?
                </p>
              </div>
            </div>
          </div>

          {/* Botón Principal (Animación en todo el span) */}
          <div className="mt-10 relative inline-block">
            <div className="absolute -inset-x-2 -top-1 -bottom-4 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-xl opacity-70 animate-pulse"></div>
            
            <Button 
              onClick={scrollToGaleria}
              className="group relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-lg h-20 px-12 rounded-full border border-white/40 shadow-lg active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100"></span>

              <span className="relative z-10 flex items-center gap-3 uppercase tracking-wider animate-bounce mt-1">
                ¡Conocenos! <ArrowDown className="h-6 w-6 text-azul-marino" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      <div id="galeria">
        <PhotoGallery />
      </div>

      <section className="py-12 md:py-16 bg-slate-50 border-y border-border/50 mt-12 mb-16 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-extrabold text-azul-marino">Lo que dicen las familias</h3>
            <p className="text-muted-foreground mt-2">Cientos de eventos inolvidables nos avalan</p>
          </div>
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 snap-x snap-mandatory gap-4 pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { nombre: "Laura G.", texto: "Festejamos los 5 de Mateo y salió todo perfecto. El predio es hermoso, súper limpio y los animadores unos genios totales. ¡Los chicos no pararon de jugar!" },
              { nombre: "Martín P.", texto: "Excelente atención de principio a fin. El show del Robot LED fue una locura, todos los invitados quedaron alucinados. Cero estrés para nosotros." },
              { nombre: "Sabrina V.", texto: "Súper recomendable. La comida, la organización, las chicas que atienden... de 10. Pagás y te olvidás de todo, ellos se encargan. Volveremos el año que viene." },
              { nombre: "Julieta F.", texto: "El mejor lugar al que fuimos. La ambientación es soñada y el pelotero es gigante. Estuvimos súper cómodos y nos atendieron como reyes." }
            ].map((review, i) => (
              <div key={i} className="min-w-[85%] sm:min-w-[60%] md:min-w-0 snap-center bg-white p-6 rounded-2xl shadow-sm border border-border/50 relative flex flex-col">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-azul-claro/20" />
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amarillo text-amarillo" />)}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4 relative z-10 italic flex-1">"{review.texto}"</p>
                <p className="font-bold text-azul-marino text-sm">{review.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-azul-marino mb-3 flex flex-col md:flex-row items-center justify-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-verde" /> ¿Qué incluye tu evento?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">Todo está pensado para que disfruten al máximo sin preocuparse por nada.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ServiciosIncluidos />
          </div>
        </div>

        {/* --- BOTÓN MEDIO SUPER PREMIUM Y RESPONSIVO --- */}
        <div className="text-center mt-12 mb-16 px-4">
          <div className="relative inline-block w-full sm:w-auto">
            <div className="absolute -inset-x-2 -top-1 -bottom-4 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-xl opacity-60 animate-pulse"></div>
            
            <Button 
              onClick={scrollToReserva} 
              // Adaptado para celular: fuente más chica, altura auto, permite wrap del texto
              className="group relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-[14px] sm:text-lg h-auto min-h-[64px] py-3 px-4 sm:px-10 rounded-full border border-white/40 shadow-lg active:scale-95 transition-all duration-300 overflow-hidden w-full sm:w-auto"
            >
              <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100"></span>
              <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-wide whitespace-normal text-center leading-tight">
                ¡Me encantó! Ver fechas disponibles ✨
              </span>
            </Button>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />

        <div id="seccion-reserva" className="text-center mb-6 pt-4 scroll-m-24">
          <h2 className="text-3xl md:text-4xl font-bold text-azul-marino mb-3 text-balance">Reservá tu lugar mágico</h2>
          <p className="text-muted-foreground text-lg">Armá tu paquete a medida y asegurá tu fecha</p>
        </div>

        <div className="max-w-3xl mx-auto mb-10 bg-azul-claro/10 border border-azul-claro/20 rounded-2xl p-5 md:p-6 text-left flex flex-col sm:flex-row gap-4 items-start shadow-sm">
          <div className="w-12 h-12 rounded-full bg-azul-claro/20 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-azul-marino" />
          </div>
          <div>
            <h4 className="text-lg font-extrabold text-azul-marino mb-2">Valores del Predio</h4>
            <p className="text-sm md:text-base text-azul-marino/80 leading-relaxed">
              El valor general del predio es de <strong className="text-azul-marino bg-white px-2 py-0.5 rounded-md shadow-sm border border-border/50">$710.000</strong>.<br className="hidden sm:block" />
              <span className="block mt-2 text-xs md:text-sm bg-white/50 p-3 rounded-lg border border-azul-claro/10">
                <strong className="text-azul-marino">Excepción:</strong> El turno de las <strong>18:30 a 22:30hs</strong> tiene un valor de <strong className="text-azul-marino">$790.000</strong> aplicable <strong>exclusivamente</strong> los días Sábados, Domingos, Feriados y en Temporada Alta (del 15 de Diciembre hasta fines de Febrero).
              </span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-rosa/20 flex items-center justify-center text-rosa text-sm font-extrabold">1</span>
                Elegí la fecha y turno
              </h3>
              <ReservationCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} onTurnoBooked={setSelectedTurno} />
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-lavanda/20 flex items-center justify-center text-lavanda text-sm font-extrabold">2</span>
                Personalizá tu evento (Opcional)
              </h3>
              <ExtrasSelector extras={extras} onChangeExtras={setExtras} precios={PRECIOS.extras} />
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-verde/20 flex items-center justify-center text-verde text-sm font-extrabold">3</span>
                Tus Datos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Nombre y Apellido *</label>
                  <input type="text" className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20" placeholder="Ej: María Gómez" value={datosCliente.nombre} onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Teléfono / WhatsApp *</label>
                  <input type="tel" inputMode="numeric" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors ${datosCliente.telefono && !isValidPhone(datosCliente.telefono) ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: 3843123456" value={datosCliente.telefono} onChange={(e) => { const soloNumeros = e.target.value.replace(/\D/g, ""); setDatosCliente({...datosCliente, telefono: soloNumeros}); }} />
                  {datosCliente.telefono && !isValidPhone(datosCliente.telefono) && <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un número válido (Mínimo 10 dígitos).</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-azul-marino">Email *</label>
                  <input type="email" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors ${datosCliente.email && !isValidEmail(datosCliente.email) ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: maria@email.com" value={datosCliente.email} onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})} />
                  {datosCliente.email && !isValidEmail(datosCliente.email) && <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un correo electrónico válido.</p>}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Nombre del Cumpleañero/a</label>
                  <input type="text" className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20" placeholder="Ej: Lucas" value={datosCliente.nombreCumpleanero} onChange={(e) => setDatosCliente({...datosCliente, nombreCumpleanero: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">¿Cuántos años cumple?</label>
                  <input type="text" inputMode="numeric" maxLength={2} className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20" placeholder="Ej: 5" value={datosCliente.edadCumple} onChange={(e) => { const soloNumeros = e.target.value.replace(/\D/g, ""); setDatosCliente({...datosCliente, edadCumple: soloNumeros}); }} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-amarillo/20 flex items-center justify-center text-azul-marino text-sm font-extrabold">4</span>
                Método de pago
              </h3>
              <MetodoPagoSelector
                metodoPago={metodoPago}
                onSelectMetodoPago={handleSelectMetodoPago}
                pagoTotalidad={pagoTotalidad}
                onSelectPagoTotalidad={setPagoTotalidad}
              />
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-[100px]">
              <ResumenReserva
                selectedDate={selectedDate}
                selectedTurno={selectedTurno}
                extras={extras}
                metodoPago={metodoPago}
                datosCliente={datosCliente}
                calculos={calculos}
                canSubmit={!!canSubmit}
                pagoTotalidad={pagoTotalidad}
              />
              
              {/* MENSAJES DE ERROR DE VALIDACIÓN */}
              {errorPersonajeVacio && (
                <p className="text-red-500 text-xs font-bold text-center mt-4">
                  * Marcaste la opción de Personajes pero no elegiste ninguno. Seleccionalo o destildá la opción.
                </p>
              )}
              {errorConsultaIncompleta && (
                <p className="text-red-500 text-xs font-bold text-center mt-4">
                  * Por favor, completá los nombres de todos los personajes que querés consultar, o reducí la cantidad.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-azul-marino text-white py-12 mt-12 border-t-8 border-amarillo">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
             <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                <Image src="/og-image.jpg" alt="Logo Al Agua Pato" fill className="object-cover" />
             </div>
          </div>
          <h4 className="text-xl font-bold mb-2">Al Agua Pato</h4>
          <p className="text-sm opacity-80 mb-6">Predio de Eventos</p>
          <div className="w-16 h-px bg-white/20 mx-auto mb-6" />
          <p className="text-xs opacity-60">© {new Date().getFullYear()} Al Agua Pato. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  )
}