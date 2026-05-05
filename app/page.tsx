"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ServiciosIncluidos } from "@/components/servicios-incluidos"
import { ExtrasSelector } from "@/components/extras-selector"
import { MetodoPagoSelector } from "@/components/metodo-pago-selector"
import { ResumenReserva } from "@/components/resumen-reserva"
import { PhotoGallery } from "@/components/photo-gallery"
import { Sparkles, MapPin, CheckCircle2, Star, Quote, ArrowDown } from "lucide-react"
import { precioTurnoKey, type Turno } from "@/lib/turno"
import { Button } from "@/components/ui/button"

export type { Turno, LunVieTurno } from "@/lib/turno"
export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | null

export interface Extras {
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
    animacion: 60000,
    horaExtra: 200000,
    robotLed: 50000,
    zancosLed: 40000,
    astronautasLed: 60000,
    personaje: 30000,
    mozoAdicional: 40000,
  },
  sena: 350000,
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
    animacion: false,
    horaExtra: false,
    robotLed: false,
    zancosLed: false,
    astronautasLed: false,
    personaje: false,
    mozoAdicional: false,
  })
  
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null)

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
      if (extras[key as keyof Extras]) {
        precioExtras += PRECIOS.extras[key as keyof typeof PRECIOS.extras]
      }
    })
    subtotal += precioExtras

    if (metodoPago === "efectivo" && subtotal > 0) {
      descuento = subtotal * PRECIOS.descuentoEfectivo
    }

    const total = subtotal - descuento

    return {
      precioTurno,
      precioExtras,
      subtotal,
      descuento,
      total,
      sena: PRECIOS.sena,
    }
  }, [selectedTurno, extras, metodoPago])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length >= 10;
  };

  const canSubmit = 
    selectedDate && 
    selectedTurno && 
    metodoPago && 
    datosCliente.nombre.trim().length >= 3 && 
    isValidPhone(datosCliente.telefono) &&
    isValidEmail(datosCliente.email)

  const scrollToGaleria = () => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  }
  
  const scrollToReserva = () => {
    document.getElementById('seccion-reserva')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <main className="min-h-screen bg-background font-sans">
      
      <header className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-amarillo shadow-sm bg-white shrink-0">
                <Image 
                  src="/og-image.jpg" 
                  alt="Logo Al Agua Pato" 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-extrabold text-azul-marino tracking-tight leading-none">
                    Al Agua Pato
                  </h1>
                  <Sparkles className="h-5 w-5 text-amarillo hidden sm:block" />
                </div>
                <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden sm:block">
                  Salón de Fiestas Infantiles
                </span>
              </div>
            </div>
            <a
              href="https://maps.google.com/?q=Al+Agua+Pato+Salon+de+Fiestas"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border-2 border-azul-marino text-azul-marino hover:bg-azul-marino hover:text-white transition-all duration-200 font-bold text-xs md:text-sm rounded-full shadow-sm hover:shadow-md active:scale-95"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Ver en Maps</span>
              <span className="sm:hidden">Ubicación</span>
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-azul-claro/10 via-transparent to-transparent pt-12 pb-8 md:pt-20 md:pb-12 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rosa/10 text-rosa font-bold text-sm mb-4">
            <Sparkles className="w-4 h-4" /> ¡Fechas disponibles 2026!
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-azul-marino tracking-tight text-balance leading-tight">
            Cumpleaños mágicos, <br className="hidden md:block" />
            <span className="text-azul-claro">cero estrés para vos.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            El salón más completo con pelotero gigante, animación y shows exclusivos. Relajate y disfrutá, nosotros nos encargamos del resto.
          </p>
          <div className="pt-6">
            <Button 
              onClick={scrollToGaleria}
              variant="outline"
              className="border-2 border-azul-claro text-azul-marino bg-white/50 hover:bg-azul-claro/10 font-bold text-lg h-14 px-8 rounded-full shadow-sm transition-all"
            >
              Conocé el salón <ArrowDown className="ml-2 h-5 w-5 text-azul-claro animate-bounce" />
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
            <p className="text-muted-foreground mt-2">Cientos de cumpleaños inolvidables nos avalan</p>
          </div>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-3 snap-x snap-mandatory gap-4 pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[
              { nombre: "Laura G.", texto: "Festejamos los 5 de Mateo y salió todo perfecto. El salón es hermoso, súper limpio y los animadores unos genios totales. ¡Los chicos no pararon de jugar!" },
              { nombre: "Martín P.", texto: "Excelente atención de principio a fin. El show del Robot LED fue una locura, todos los invitados quedaron alucinados. Cero estrés para nosotros." },
              { nombre: "Sabrina V.", texto: "Súper recomendable. La comida, la organización, las chicas que atienden... de 10. Pagás y te olvidás de todo, ellos se encargan. Volveremos el año que viene." }
            ].map((review, i) => (
              <div 
                key={i} 
                className="min-w-[85%] sm:min-w-[60%] md:min-w-0 snap-center bg-white p-6 rounded-2xl shadow-sm border border-border/50 relative flex flex-col"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-azul-claro/20" />
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-amarillo text-amarillo" />)}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4 relative z-10 italic flex-1">
                  "{review.texto}"
                </p>
                <p className="font-bold text-azul-marino text-sm">{review.nombre}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-12">
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-azul-marino mb-3 flex items-center justify-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-verde" />
              ¿Qué incluye tu fiesta?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
              Todo está pensado para que disfruten al máximo sin preocuparse por nada.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ServiciosIncluidos />
          </div>
        </div>

        <div className="text-center mt-12 mb-16">
          <Button 
            onClick={scrollToReserva}
            className="bg-amarillo hover:bg-amarillo/90 text-azul-marino font-extrabold text-lg h-16 px-10 rounded-full shadow-[0_10px_40px_-10px_rgba(250,204,21,0.6)] hover:shadow-[0_10px_40px_-5px_rgba(250,204,21,0.8)] transition-all hover:-translate-y-1 w-full sm:w-auto"
          >
            ¡Me encantó! Ver fechas disponibles ✨
          </Button>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-12" />

        <div id="seccion-reserva" className="text-center mb-10 pt-4 scroll-m-24">
          <h2 className="text-3xl md:text-4xl font-bold text-azul-marino mb-3 text-balance">
            Reservá tu lugar mágico
          </h2>
          <p className="text-muted-foreground text-lg">
            Armá tu paquete a medida y asegurá tu fecha
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-rosa/20 flex items-center justify-center text-rosa text-sm font-extrabold">1</span>
                Elegí la fecha y turno
              </h3>
              <ReservationCalendar
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onTurnoBooked={setSelectedTurno}
              />
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-lavanda/20 flex items-center justify-center text-lavanda text-sm font-extrabold">2</span>
                Personalizá tu fiesta (Opcional)
              </h3>
              <ExtrasSelector
                extras={extras}
                onChangeExtras={setExtras}
                precios={PRECIOS.extras}
              />
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-verde/20 flex items-center justify-center text-verde text-sm font-extrabold">3</span>
                Tus Datos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Nombre y Apellido *</label>
                  <input 
                    type="text" 
                    className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"
                    placeholder="Ej: María Gómez"
                    value={datosCliente.nombre}
                    onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Teléfono / WhatsApp *</label>
                  <input 
                    type="tel" 
                    inputMode="numeric"
                    className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors ${
                      datosCliente.telefono && !isValidPhone(datosCliente.telefono)
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"
                    }`}
                    placeholder="Ej: 3843123456"
                    value={datosCliente.telefono}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, "");
                      setDatosCliente({...datosCliente, telefono: soloNumeros});
                    }}
                  />
                  {datosCliente.telefono && !isValidPhone(datosCliente.telefono) && (
                    <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un número válido (Mínimo 10 dígitos).</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-azul-marino">Email *</label>
                  <input 
                    type="email" 
                    className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors ${
                      datosCliente.email && !isValidEmail(datosCliente.email)
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"
                    }`}
                    placeholder="Ej: maria@email.com"
                    value={datosCliente.email}
                    onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
                  />
                  {datosCliente.email && !isValidEmail(datosCliente.email) && (
                    <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un correo electrónico válido.</p>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">Nombre del Cumpleañero/a</label>
                  <input 
                    type="text" 
                    className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"
                    placeholder="Ej: Lucas"
                    value={datosCliente.nombreCumpleanero}
                    onChange={(e) => setDatosCliente({...datosCliente, nombreCumpleanero: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-azul-marino">¿Cuántos años cumple?</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    maxLength={2}
                    className="flex h-11 w-full rounded-lg border border-input bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"
                    placeholder="Ej: 5"
                    value={datosCliente.edadCumple}
                    onChange={(e) => {
                      const soloNumeros = e.target.value.replace(/\D/g, "");
                      setDatosCliente({...datosCliente, edadCumple: soloNumeros});
                    }}
                  />
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
                onSelectMetodoPago={setMetodoPago}
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
              />
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
          <p className="text-sm opacity-80 mb-6">Salón de Fiestas Infantiles</p>
          <div className="w-16 h-px bg-white/20 mx-auto mb-6" />
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} Al Agua Pato. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}