"use client"

import { useState, useMemo, useEffect } from "react"
import { ReservationCalendar } from "@/components/reservation-calendar"
import { ExtrasSelector } from "@/components/extras-selector"
import { MetodoPagoSelector } from "@/components/metodo-pago-selector"
import { ResumenReserva } from "@/components/resumen-reserva"
import { Info, ArrowLeft, PartyPopper, MessageCircle, Lock, ChevronDown, AlertCircle } from "lucide-react" // Añadimos AlertCircle
import { type Turno } from "@/lib/turno"
import { obtenerReglasParaFecha, PRECIOS } from "@/lib/config-reservas"
import Link from "next/link"

export type { Turno } from "@/lib/turno"
export type MetodoPago = "efectivo" | "transferencia" | "tarjeta" | null

export interface Extras {
  adultosAdicionales: number
  cantidadMozos: number
  personajesSeleccionados: string[]
  animacion: boolean
  horaExtra: boolean
  robotLed: number
  zancosLed: number
  personaje: boolean
  mozoAdicional: boolean
  pileta: boolean
}

export interface DatosCliente {
  nombre: string
  telefono: string
  email: string
  nombreCumpleanero: string
  edadCumple: string
  institucion?: string
  sala?: string
  turno_colegio?: string
}

const SENIA = 400000
const DESCUENTO_EFECTIVO = 0.1

const formatMoneyUI = (amount: number) => {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
}

export default function PaginaReserva() {
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
    animacion: false,
    horaExtra: false,
    robotLed: 0,
    zancosLed: 0,
    personaje: false,
    mozoAdicional: false,
    pileta: false,
  })
  
  const reglasFecha = useMemo(() => {
    return selectedDate ? obtenerReglasParaFecha(selectedDate) : null
  }, [selectedDate])

  useEffect(() => {
    if (reglasFecha && !reglasFecha.pileta_disponible && extras.pileta) {
      setExtras(prev => ({ ...prev, pileta: false }))
    }
  }, [reglasFecha, extras.pileta])

  const [metodoPago, setMetodoPago] = useState<MetodoPago>(null)
  const [pagoTotalidad, setPagoTotalidad] = useState<boolean>(false)

  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: "",
    telefono: "",
    email: "",
    nombreCumpleanero: "",
    edadCumple: "",
    institucion: "",
    sala: "",
    turno_colegio: ""
  })

  const calculos = useMemo(() => {
    let subtotal = 0
    let precioTurno = 0
    let precioExtras = 0
    let descuento = 0

    if (selectedTurno && selectedDate && reglasFecha) {
      if (reglasFecha.modalidad === 'doble_turno_fijo') {
        if (reglasFecha.precios) {
          if (selectedTurno === "primero") precioTurno = reglasFecha.precios.turno_1
          else if (selectedTurno === "segundo") precioTurno = reglasFecha.precios.turno_2
        } else {
          precioTurno = reglasFecha.precio
        }
      } else {
        precioTurno = reglasFecha.precio
      }
      subtotal += precioTurno
    }

    if (extras.adultosAdicionales > 0) {
      precioExtras += extras.adultosAdicionales * PRECIOS.opcionales.adultosAdicionales
    }
    if (extras.mozoAdicional && extras.cantidadMozos > 0) {
      precioExtras += extras.cantidadMozos * PRECIOS.opcionales.mozoAdicional
    }
    if (extras.personaje && extras.personajesSeleccionados.length > 0) {
      precioExtras += extras.personajesSeleccionados.length * PRECIOS.opcionales.personaje.precio_unidad
    }
    if (extras.animacion) {
      precioExtras += PRECIOS.opcionales.animacion
    }
    if (extras.horaExtra) {
      precioExtras += PRECIOS.opcionales.horaExtra
    }
    if (extras.robotLed === 1) {
      precioExtras += PRECIOS.opcionales.robot_led.uno
    } else if (extras.robotLed === 2) {
      precioExtras += PRECIOS.opcionales.robot_led.dos
    }
    if (extras.zancosLed > 0) {
      precioExtras += extras.zancosLed * PRECIOS.opcionales.zancos_led.precio_unidad
    }
    if (extras.pileta) {
      precioExtras += PRECIOS.opcionales.pileta.precio
    }

    subtotal += precioExtras

    if (metodoPago === "efectivo" && pagoTotalidad && subtotal > 0) {
      descuento = subtotal * DESCUENTO_EFECTIVO
    }

    const total = subtotal - descuento
    const senaFinal = pagoTotalidad ? total : SENIA

    return {
      precioTurno,
      precioExtras,
      subtotal,
      descuento,
      total,
      sena: senaFinal,
    }
  }, [selectedTurno, selectedDate, extras, metodoPago, pagoTotalidad, reglasFecha])

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "");
    return numbers.length >= 10;
  };

  const hasSeleccionados = extras.personajesSeleccionados.length > 0;
  const isValidPersonaje = !extras.personaje || hasSeleccionados;
  const errorPersonajeVacio = extras.personaje && !hasSeleccionados;

  const canSubmit = 
    selectedDate && 
    selectedTurno && 
    metodoPago && 
    datosCliente.nombre.trim().length >= 3 && 
    isValidPhone(datosCliente.telefono) &&
    isValidEmail(datosCliente.email) &&
    isValidPersonaje 

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
    <main className="min-h-screen bg-slate-50 font-sans pb-16">
      <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-azul-marino font-bold hover:text-azul-marino/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-8 md:pt-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-black text-azul-marino mb-3">Tu Reserva</h1>
          <p className="text-muted-foreground text-lg">Completá los datos y asegurá tu fecha mágica.</p>
        </div>

        <div className="max-w-3xl mx-auto mb-10 bg-azul-claro/5 border border-azul-claro/20 rounded-3xl p-5 md:p-6 text-left flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
            <div className="w-12 h-12 rounded-full bg-azul-claro/20 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-azul-marino" />
            </div>
            <div className="w-full">
              <h4 className="text-lg font-extrabold text-azul-marino mb-3">Costos de tu evento</h4>
              
              <div className="space-y-2 w-full">
                
                {/* Temporada Baja (DINÁMICA) */}
                <details className="group bg-white rounded-xl border border-azul-claro/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-3.5 select-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-azul-marino text-sm md:text-base">📅 Temporada Baja <span className="font-medium opacity-70 text-xs ml-1">(1 Abr - 31 Ago)</span></span>
                    <ChevronDown className="w-5 h-5 text-azul-marino/50 transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-3 text-sm text-azul-marino/80 border-t border-border/50 space-y-2 mt-1">
                    <p className="flex items-center gap-2">
                      <span className="font-extrabold text-azul-marino text-base">{formatMoneyUI(PRECIOS.temporada_baja.lunes_a_viernes)}</span>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Costo Fijo</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-1.5 text-xs md:text-sm">
                      <li><strong>Turno de 4 horas.</strong></li>
                      <li>Franja horaria disponible: <strong>12:00 a 19:00 hs</strong>.</li>
                      <li className="text-muted-foreground italic">* El último turno puede comenzar a las 15:00 hs como máximo.</li>
                    </ul>
                  </div>
                </details>

                {/* Temporada Media (DINÁMICA) */}
                <details className="group bg-white rounded-xl border border-azul-claro/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-3.5 select-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-azul-marino text-sm md:text-base">⭐ Temporada Media <span className="font-medium opacity-70 text-xs ml-1">(1 Sep - 14 Dic)</span></span>
                    <ChevronDown className="w-5 h-5 text-azul-marino/50 transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-3 text-sm text-azul-marino/80 border-t border-border/50 mt-1">
                    
                    {/* CARTEL DE CONGELAMIENTO */}
                    <div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-orange-900 leading-snug">
                        <strong className="block text-orange-700 mb-0.5 uppercase tracking-wide text-xs">¡Precios Congelados!</strong>
                        Abonando la <strong>totalidad</strong> de tu evento antes del <strong>31 de Julio</strong>. <br/> 
                        <span className="opacity-80 italic">(A partir de Agosto aplicarán las nuevas tarifas definidas)</span>
                      </p>
                    </div>

                    <ul className="list-disc pl-4 space-y-3 text-xs md:text-sm">
                      <li>
                        <strong>Lunes a Viernes:</strong> <span className="font-extrabold text-azul-marino text-base">{formatMoneyUI(PRECIOS.temporada_media.lunes_a_viernes)}</span> <br/>
                        <span className="inline-block mt-1">Turno de 4 horas a elección (Franja de 12:00 a 22:30 hs).</span> <br/>
                        <span className="text-muted-foreground italic">* El último turno puede comenzar a las 18:30 hs.</span>
                      </li>
                      <li>
                        <strong>Sábados, Domingos y Feriados (Turnos fijos):</strong>
                        <ul className="list-[circle] pl-5 mt-2 space-y-1.5">
                          <li>Turno 1 (12:00 a 16:00 hs): <strong className="text-azul-marino text-sm">{formatMoneyUI(PRECIOS.temporada_media.turno_1_fijo)}</strong></li>
                          <li>Turno 2 (18:30 a 22:30 hs): <strong className="text-azul-marino text-sm">{formatMoneyUI(PRECIOS.temporada_media.turno_2_fijo)}</strong></li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                </details>

                {/* Temporada Alta (DINÁMICA) */}
                <details className="group bg-white rounded-xl border border-azul-claro/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-3.5 select-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-azul-marino text-sm md:text-base">🔥 Temporada Alta <span className="font-medium opacity-70 text-xs ml-1">(15 Dic - 31 Mar)</span></span>
                    <ChevronDown className="w-5 h-5 text-azul-marino/50 transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-3 text-sm text-azul-marino/80 border-t border-border/50 mt-1">
                    
                    {/* CARTEL DE CONGELAMIENTO */}
                    <div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-orange-900 leading-snug">
                        <strong className="block text-orange-700 mb-0.5 uppercase tracking-wide text-xs">¡Precios Congelados!</strong>
                        Abonando la <strong>totalidad</strong> de tu evento antes del <strong>31 de Julio</strong>. <br/> 
                        <span className="opacity-80 italic">(A partir de Agosto aplicarán las nuevas tarifas definidas)</span>
                      </p>
                    </div>

                    <div className="inline-block bg-lavanda/20 text-azul-marino font-bold px-3 py-1.5 rounded-lg text-xs md:text-sm border border-lavanda/30 shadow-sm mb-3">
                      Todos los días (Turnos fijos):
                    </div>
                    <ul className="list-disc pl-4 space-y-2 text-xs md:text-sm">
                      <li><strong>Turno 1 (12:00 a 16:00 hs):</strong> <span className="font-bold text-azul-marino text-base">{formatMoneyUI(PRECIOS.temporada_alta.turno_1_fijo)}</span></li>
                      <li><strong>Turno 2 (18:30 a 22:30 hs):</strong> <span className="font-bold text-azul-marino text-base">{formatMoneyUI(PRECIOS.temporada_alta.turno_2_fijo)}</span></li>
                    </ul>
                  </div>
                </details>

              </div>
            </div>
          </div>
          
          <div className="mt-6 p-3.5 bg-gradient-to-r from-amarillo/40 to-naranja/20 rounded-xl border-2 border-amarillo/50 shadow-sm flex items-start sm:items-center gap-3 ml-0 sm:ml-16 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-2xl rounded-full"></div>
             <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
               <PartyPopper className="w-5 h-5 text-naranja" />
             </div>
             <p className="text-[13px] md:text-sm text-slate-800 font-medium leading-snug relative z-10">
               <strong className="font-extrabold text-azul-marino">✨ Bonus Exclusivo:</strong> Tu reserva incluye automáticamente el acceso a nuestro panel VIP para crear y descargar la <strong className="text-naranja">Invitación Digital Personalizada</strong> para tus invitados.
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-rosa/20 flex items-center justify-center text-rosa text-sm font-extrabold">1</span>
                Elegí la fecha y turno
              </h3>
              <ReservationCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} onTurnoBooked={setSelectedTurno} />
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-lavanda/20 flex items-center justify-center text-lavanda text-sm font-extrabold">2</span>
                Personalizá tu evento (Opcional)
              </h3>
              <ExtrasSelector 
                extras={extras} 
                onChangeExtras={setExtras} 
                showPileta={reglasFecha?.pileta_disponible || false} 
              />
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
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
                  {datosCliente.telefono && !isValidPhone(datosCliente.telefono) ? (
                    <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un número válido (Mínimo 10 dígitos).</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Lock className="w-3 h-3" /> Solo para enviarte tu confirmación.
                    </p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-azul-marino">Email *</label>
                  <input type="email" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors ${datosCliente.email && !isValidEmail(datosCliente.email) ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: maria@email.com" value={datosCliente.email} onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})} />
                  {datosCliente.email && !isValidEmail(datosCliente.email) ? (
                    <p className="text-xs text-red-500 font-semibold mt-1">Ingresá un correo electrónico válido.</p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Lock className="w-3 h-3" /> 100% privado. Sin spam.
                    </p>
                  )}
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

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
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
              
              {errorPersonajeVacio && (
                <p className="text-red-500 text-xs font-bold text-center mt-4 bg-red-50 p-2 rounded-lg border border-red-200 shadow-sm">
                  * Marcaste la opción de Personajes pero no elegiste ninguno. Seleccionalo o destildá la opción.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <a 
        href="https://wa.me/5493854470103?text=Hola!%20Estoy%20en%20la%20página%20de%20reservas%20y%20tengo%20una%20duda..." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-[60] bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 lg:p-4 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all hover:-translate-y-1 active:scale-95 group flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7" />
        <span className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden lg:block">
          ¿Dudas con tu reserva?
        </span>
      </a>
    </main>
  )
}