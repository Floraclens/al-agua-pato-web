"use client"

import { ReservationCalendar } from "@/components/reservation-calendar"
import { ExtrasSelector } from "@/components/extras-selector"
import { MetodoPagoSelector } from "@/components/metodo-pago-selector"
import { ResumenReserva } from "@/components/resumen-reserva"
import { LogoWatermark } from "@/components/logo-watermark"
import { Info, ArrowLeft, PartyPopper, MessageCircle, Lock, ChevronDown, GraduationCap, School, AlertCircle } from "lucide-react"
import { PRECIOS_EGRESADITOS } from "@/lib/config-reservas"
import { formatMoneyUI } from "@/lib/reserva"
import { useReserva } from "@/hooks/use-reserva"
import Link from "next/link"

export default function PaginaReservaEgresaditos() {
  const {
    selectedDate,
    selectedTurno,
    setSelectedTurno,
    showErrors,
    setShowErrors,
    extras,
    setExtras,
    metodoPago,
    pagoTotalidad,
    setPagoTotalidad,
    datosCliente,
    setDatosCliente,
    reglasFecha,
    calculos,
    canSubmit,
    isValidEmail,
    isValidPhone,
    handleSelectDate,
    handleSelectMetodoPago,
    handleFailedSubmit,
    handleAccordionToggle,
  } = useReserva(true)

  return (
    <main className="relative isolate min-h-screen bg-slate-50/30 font-sans pb-16">
      <LogoWatermark />
      <header className="bg-white border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-azul-marino font-bold hover:text-azul-marino/80 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver al inicio
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-8 md:pt-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-lavanda/10 border border-lavanda/30 mb-6 shadow-sm">
             <GraduationCap className="w-5 h-5 text-lavanda" />
             <span className="text-sm font-bold tracking-wide text-azul-marino uppercase">Exclusivo Colegios</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-lavanda mb-3">Egresaditos</h1>
          <h2 className="sr-only">Reserva tu evento escolar</h2>
          <p className="text-muted-foreground text-lg">Completá los datos y asegurá la mejor despedida.</p>
        </div>

        <div className="max-w-3xl mx-auto mb-10 bg-lavanda/5 border border-lavanda/20 rounded-3xl p-5 md:p-6 text-left flex flex-col shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start w-full">
            <div className="w-12 h-12 rounded-full bg-lavanda/20 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6 text-lavanda" />
            </div>
            <div className="w-full">
              <h4 className="text-lg font-extrabold text-azul-marino mb-3">Costos de tu evento</h4>
              
              <div className="space-y-2 w-full">
                
                {/* TEMPORADA 1 (NOVIEMBRE - DICIEMBRE 14) */}
                <details name="temporadas" onClick={handleAccordionToggle} className="group bg-white rounded-xl border border-lavanda/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-3.5 select-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-azul-marino text-sm md:text-base">📅 1 de Noviembre al 14 de Diciembre</span>
                    <ChevronDown className="w-5 h-5 text-azul-marino/50 transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-3 text-sm text-azul-marino/80 border-t border-border/50 mt-1">
                    
                    <div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-orange-900 leading-snug">
                        <strong className="block text-orange-700 mb-0.5 uppercase tracking-wide text-xs">¡Precios congelados hasta el 31/07!</strong>
                        Abonando la seña hoy y cancelando hasta el 31/07, mantenemos el precio. <br/> 
                        <span className="opacity-80 italic">(A partir de Agosto se aplicarán las nuevas tarifas definidas hasta Diciembre)</span>
                      </p>
                    </div>

                    <div className="block mb-5">
                      <div className="inline-block bg-lavanda/20 text-azul-marino font-bold px-3 py-1.5 rounded-lg text-xs md:text-sm border border-lavanda/30 shadow-sm mb-3">Lunes a Viernes:</div>
                      <ul className="list-disc pl-4 space-y-2 text-sm text-slate-700">
                        <li><span className="font-extrabold text-azul-marino">{formatMoneyUI(PRECIOS_EGRESADITOS.nov_a_dic14.lunes_a_viernes)}</span></li>
                        <li>✨ <strong className="text-slate-800">Exclusividad total:</strong> Solo 1 evento por día.</li>
                        <li>🕒 <strong className="text-slate-800">4 horas a elección</strong> (12:00 a 22:30 hs).</li>
                      </ul>
                      <span className="inline-block text-muted-foreground italic text-xs ml-4 mt-2">* El último turno puede comenzar a las 18:30 hs.</span>
                    </div>

                    <div className="block">
                      <div className="inline-block bg-lavanda/20 text-azul-marino font-bold px-3 py-1.5 rounded-lg text-xs md:text-sm border border-lavanda/30 shadow-sm mb-3">Sábados, Domingos y Feriados:</div>
                      <ul className="list-disc pl-4 space-y-2 text-sm text-slate-700">
                        <li>🗓️ <strong className="text-slate-800">2 turnos disponibles por día.</strong></li>
                        <li><strong className="text-slate-800">Turno 1 (12:00 a 16:00 hs):</strong> <span className="font-extrabold text-azul-marino">{formatMoneyUI(PRECIOS_EGRESADITOS.nov_a_dic14.turno_1_fijo)}</span></li>
                        <li><strong className="text-slate-800">Turno 2 (18:30 a 22:30 hs):</strong> <span className="font-extrabold text-azul-marino">{formatMoneyUI(PRECIOS_EGRESADITOS.nov_a_dic14.turno_2_fijo)}</span></li>
                      </ul>
                    </div>
                  </div>
                </details>

                {/* TEMPORADA 2 (DICIEMBRE 15 - FIN DE MES) */}
                <details name="temporadas" onClick={handleAccordionToggle} className="group bg-white rounded-xl border border-lavanda/20 shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-3.5 select-none bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <span className="font-bold text-azul-marino text-sm md:text-base">🔥 15 de Diciembre a Fin de Mes</span>
                    <ChevronDown className="w-5 h-5 text-azul-marino/50 transition-transform duration-300 group-open:-rotate-180" />
                  </summary>
                  <div className="px-4 pb-4 pt-3 text-sm text-azul-marino/80 border-t border-border/50 mt-1">
                    
                    <div className="mb-4 bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-orange-900 leading-snug">
                        <strong className="block text-orange-700 mb-0.5 uppercase tracking-wide text-xs">¡Precios congelados hasta el 31/07!</strong>
                        Abonando la seña hoy y cancelando hasta el 31/07, mantenemos el precio. <br/> 
                        <span className="opacity-80 italic">(A partir de Agosto se aplicarán las nuevas tarifas definidas hasta Diciembre)</span>
                      </p>
                    </div>

                    <div className="block">
                      <div className="inline-block bg-lavanda/20 text-azul-marino font-bold px-3 py-1.5 rounded-lg text-xs md:text-sm border border-lavanda/30 shadow-sm mb-3">Todos los días:</div>
                      <ul className="list-disc pl-4 space-y-2 text-sm text-slate-700">
                        <li>🗓️ <strong className="text-slate-800">2 turnos disponibles por día.</strong></li>
                        <li><strong className="text-slate-800">Turno 1 (12:00 a 16:00 hs):</strong> <span className="font-extrabold text-azul-marino">{formatMoneyUI(PRECIOS_EGRESADITOS.dic15_a_fin.turno_1_fijo)}</span></li>
                        <li><strong className="text-slate-800">Turno 2 (18:30 a 22:30 hs):</strong> <span className="font-extrabold text-azul-marino">{formatMoneyUI(PRECIOS_EGRESADITOS.dic15_a_fin.turno_2_fijo)}</span></li>
                      </ul>
                    </div>

                  </div>
                </details>

              </div>
            </div>
          </div>
          <div className="mt-6 p-3.5 bg-gradient-to-r from-amarillo/40 to-naranja/20 rounded-xl border-2 border-amarillo/50 shadow-sm flex items-start sm:items-center gap-3 ml-0 sm:ml-16 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 blur-2xl rounded-full"></div>
             <div className="bg-white p-2 rounded-lg shadow-sm shrink-0"><PartyPopper className="w-5 h-5 text-naranja" /></div>
             <p className="text-[13px] md:text-sm text-slate-800 font-medium leading-snug relative z-10">
               <strong className="font-extrabold text-azul-marino">✨ Bonus Exclusivo:</strong> Tu reserva incluye automáticamente el acceso a nuestro panel VIP para crear y descargar la <strong className="text-naranja">Invitación Digital Personalizada</strong> para tus invitados.
             </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            
            <section className={`bg-white rounded-3xl p-6 shadow-sm border ${showErrors && (!selectedDate || !selectedTurno) ? "border-red-400 error-field ring-4 ring-red-500/10" : "border-border/50"} transition-all`}>
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-rosa/20 flex items-center justify-center text-rosa text-sm font-extrabold">1</span>
                Elegí la fecha y turno
              </h3>
              <ReservationCalendar selectedDate={selectedDate} onSelectDate={handleSelectDate} onTurnoBooked={setSelectedTurno} isEgresadito={true} />
              {showErrors && (!selectedDate || !selectedTurno) && (
                <p className="text-sm text-red-500 font-bold mt-4 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Por favor, elegí un día y un horario para tu reserva.</p>
              )}
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-border/50">
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-lavanda/20 flex items-center justify-center text-lavanda text-sm font-extrabold">2</span>
                Personalizá tu evento (Opcional)
              </h3>
              <ExtrasSelector 
                extras={extras} 
                onChangeExtras={(newExtras) => { setExtras(newExtras); if(showErrors) setShowErrors(false) }} 
                showPileta={reglasFecha?.pileta_disponible || false}
                showErrors={showErrors} 
              />
            </section>

            <section className={`bg-white rounded-3xl p-6 shadow-sm border ${showErrors && (datosCliente.nombre.trim().length < 3 || !isValidPhone(datosCliente.telefono) || !isValidEmail(datosCliente.email) || !datosCliente.institucion || !datosCliente.sala || !datosCliente.turno_colegio) ? "border-red-400 error-field ring-4 ring-red-500/10" : "border-border/50"} transition-all`}>
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-verde/20 flex items-center justify-center text-verde text-sm font-extrabold">3</span>
                Datos de los Egresaditos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-2">
                  <label htmlFor="egresaditos-nombre" className="text-sm font-bold text-azul-marino">Tu Nombre y Apellido *</label>
                  <input id="egresaditos-nombre" type="text" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${showErrors && datosCliente.nombre.trim().length < 3 ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: María Gómez" value={datosCliente.nombre} onChange={(e) => { setDatosCliente({...datosCliente, nombre: e.target.value}); if(showErrors) setShowErrors(false) }} />
                  {showErrors && datosCliente.nombre.trim().length < 3 && <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá tu nombre completo.</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="egresaditos-telefono" className="text-sm font-bold text-azul-marino">Teléfono / WhatsApp *</label>
                  <input id="egresaditos-telefono" type="tel" inputMode="numeric" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${(showErrors || datosCliente.telefono) && !isValidPhone(datosCliente.telefono) ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: 3843123456" value={datosCliente.telefono} onChange={(e) => { const soloNumeros = e.target.value.replace(/\D/g, ""); setDatosCliente({...datosCliente, telefono: soloNumeros}); if(showErrors) setShowErrors(false) }} />
                  {(showErrors || datosCliente.telefono) && !isValidPhone(datosCliente.telefono) ? (
                    <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá un número válido.</p>
                  ) : (
                    <p className="text-[13px] text-muted-foreground flex items-center gap-1 mt-1"><Lock className="w-3 h-3" /> Privado.</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="egresaditos-email" className="text-sm font-bold text-azul-marino">Email *</label>
                  <input id="egresaditos-email" type="email" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${(showErrors || datosCliente.email) && !isValidEmail(datosCliente.email) ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: maria@email.com" value={datosCliente.email} onChange={(e) => { setDatosCliente({...datosCliente, email: e.target.value}); if(showErrors) setShowErrors(false) }} />
                  {(showErrors || datosCliente.email) && !isValidEmail(datosCliente.email) && <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá un correo electrónico válido.</p>}
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="egresaditos-institucion" className="text-sm font-bold text-azul-marino flex items-center gap-2"><School className="w-4 h-4 text-lavanda"/> Nombre de la Institución *</label>
                  <input id="egresaditos-institucion" type="text" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${showErrors && !datosCliente.institucion ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: Colegio San José" value={datosCliente.institucion} onChange={(e) => { setDatosCliente({...datosCliente, institucion: e.target.value}); if(showErrors) setShowErrors(false) }} />
                  {showErrors && !datosCliente.institucion && <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá la institución.</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="egresaditos-sala" className="text-sm font-bold text-azul-marino">Sala / Curso *</label>
                  <input id="egresaditos-sala" type="text" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${showErrors && !datosCliente.sala ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: Salita de 5 Verde" value={datosCliente.sala} onChange={(e) => { setDatosCliente({...datosCliente, sala: e.target.value}); if(showErrors) setShowErrors(false) }} />
                  {showErrors && !datosCliente.sala && <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá la sala o curso.</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="egresaditos-turno" className="text-sm font-bold text-azul-marino">Turno (Mañana/Tarde) *</label>
                  <input id="egresaditos-turno" type="text" className={`flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors ${showErrors && !datosCliente.turno_colegio ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-input focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"}`} placeholder="Ej: Tarde" value={datosCliente.turno_colegio} onChange={(e) => { setDatosCliente({...datosCliente, turno_colegio: e.target.value}); if(showErrors) setShowErrors(false) }} />
                  {showErrors && !datosCliente.turno_colegio && <p className="text-[13px] text-red-500 font-semibold mt-1">Ingresá el turno escolar.</p>}
                </div>
              </div>
            </section>

            {/* 4. Pago */}
            <section className={`bg-white rounded-3xl p-6 shadow-sm border ${showErrors && !metodoPago ? "border-red-400 error-field ring-4 ring-red-500/10" : "border-border/50"} transition-all`}>
              <h3 className="text-xl font-bold text-azul-marino mb-6 flex items-center gap-3 pb-4 border-b border-border/50">
                <span className="w-8 h-8 rounded-full bg-amarillo/20 flex items-center justify-center text-azul-marino text-sm font-extrabold">4</span>
                Método de pago
              </h3>
              <MetodoPagoSelector metodoPago={metodoPago} onSelectMetodoPago={handleSelectMetodoPago} pagoTotalidad={pagoTotalidad} onSelectPagoTotalidad={setPagoTotalidad} />
              {showErrors && !metodoPago && (
                <p className="text-sm text-red-500 font-bold mt-4 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Por favor, elegí un método de pago.</p>
              )}
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
                isEgresadito={true}
                onSubmitAttempt={handleFailedSubmit} 
              />
            </div>
          </div>
        </div>
      </div>

      <a 
        href="https://api.whatsapp.com/send?phone=5493854043737&text=Hola!%20Estoy%20en%20la%20pagina%20de%20reservas%20de%20Egresaditos%20y%20tengo%20una%20duda..." 
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