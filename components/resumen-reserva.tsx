"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  CalendarDays,
  Clock,
  PartyPopper,
  Banknote,
  Sparkles,
  AlertTriangle,
  Timer,
  CheckCircle2,
  MessageCircle
} from "lucide-react"
import type { MetodoPago, Extras, DatosCliente } from "@/app/page"
import type { Turno } from "@/lib/turno"
import { getTurnoLabel } from "@/lib/turno"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { createBrowserClient } from "@/lib/supabase/client"

interface ResumenReservaProps {
  selectedDate: Date | undefined
  selectedTurno: Turno
  extras: Extras
  metodoPago: MetodoPago
  datosCliente: DatosCliente
  calculos: {
    precioTurno: number
    precioExtras: number
    subtotal: number
    descuento: number
    total: number
    sena: number
  }
  canSubmit: boolean
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const metodoPagoLabels: Record<NonNullable<MetodoPago>, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
}

const extraLabels: Record<keyof Extras, string> = {
  animacion: "Animación",
  horaExtra: "Hora Extra",
  robotLed: "Robot LED",
  zancosLed: "Zancos LED",
  astronautasLed: "Astronautas LED",
  personaje: "Personaje",
  mozoAdicional: "Mozo Adicional",
}

function toLocalDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function ResumenReserva({
  selectedDate,
  selectedTurno,
  extras,
  metodoPago,
  datosCliente,
  calculos,
  canSubmit,
}: ResumenReservaProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [waUrl, setWaUrl] = useState("")

  useEffect(() => {
    if (isSuccess) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isSuccess])

  const selectedExtras = Object.entries(extras)
    .filter(([, value]) => value)
    .map(([key]) => extraLabels[key as keyof Extras])

  const handleReserva = useCallback(async () => {
    if (!selectedDate || !selectedTurno || !metodoPago) return

    setIsSubmitting(true)
    try {
      const extrasLabels = Object.entries(extras)
        .filter(([, value]) => value)
        .map(([key]) => extraLabels[key as keyof Extras])
      const extras_elegidos =
        extrasLabels.length > 0 ? extrasLabels.join(", ") : "Ninguno"

      const supabase = createBrowserClient()
      const { error } = await supabase.from("reservas").insert({
        fecha: toLocalDateString(selectedDate),
        turno: getTurnoLabel(selectedTurno),
        metodo_pago: metodoPagoLabels[metodoPago],
        total: calculos.total,
        sena: calculos.sena,
        extras_elegidos,
        nombre: datosCliente.nombre,
        telefono: datosCliente.telefono,
        email: datosCliente.email || null,
        nombre_cumpleanero: datosCliente.nombreCumpleanero || null,
        edad_cumple: datosCliente.edadCumple || null
      })

      if (error) {
        console.error("[reservas] Error al guardar:", error.message, error)
        window.alert(`No se pudo completar la reserva: ${error.message}`)
        setIsSubmitting(false)
        return
      }

      const NUMERO_WHATSAPP_SALON = "5493854470103" 
      
      const fechaFormateada = format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
      const turnoLabel = getTurnoLabel(selectedTurno)
      
      const mensajeWhatsApp = 
`¡Hola Al Agua Pato! 🦆✨ Acabo de solicitar una reserva desde la página web.

*Detalles del evento:*
📅 Fecha: ${fechaFormateada}
⏰ Turno: ${turnoLabel}
🎈 Extras: ${extras_elegidos}

*Resumen de pago:*
💵 Método: ${metodoPagoLabels[metodoPago]}
💰 Total: ${formatPrice(calculos.total)}
💸 Seña requerida: ${formatPrice(calculos.sena)}

*Mis datos:*
👤 A nombre de: ${datosCliente.nombre}
🎂 Cumpleañero/a: ${datosCliente.nombreCumpleanero || "No especificado"} (${datosCliente.edadCumple ? datosCliente.edadCumple + " añitos" : "-"})

¿Te puedo pasar el comprobante de la seña por acá para confirmar la fecha?`

      const urlWhatsapp = `https://wa.me/${NUMERO_WHATSAPP_SALON}?text=${encodeURIComponent(mensajeWhatsApp)}`
      
      setWaUrl(urlWhatsapp)
      window.open(urlWhatsapp, "_blank")
      
      setIsSuccess(true) 
      setIsSubmitting(false)
      
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("[reservas] Error inesperado:", e)
      window.alert(`Error al procesar la reserva: ${msg}`)
      setIsSubmitting(false)
    }
  }, [
    selectedDate,
    selectedTurno,
    metodoPago,
    extras,
    datosCliente,
    calculos.total,
    calculos.sena,
  ])

  // MODAL FESTIVO CON SCROLL CORREGIDO PARA PC
  if (isSuccess && selectedDate && selectedTurno) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-50 overflow-y-auto overscroll-none">
        
        {/* Decoración mágica de fondo */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
          <div className="absolute top-10 left-10 w-72 h-72 bg-rosa/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-azul-claro/20 rounded-full blur-3xl opacity-60" />
        </div>

        {/* CONTENEDOR FIXEADO: Uso de p-4 py-12 sm:py-16 con m-auto adentro */}
        <div className="relative z-10 flex min-h-full p-4 py-12 sm:py-16">
          
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-2 border-emerald-100 text-center animate-in zoom-in-95 duration-500 overflow-hidden m-auto">
            
            {/* Cinta de colores superior */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-rosa via-amarillo to-azul-claro" />
            
            {/* Ícono gigante y festivo */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-[#25D366] to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 border-4 border-white mt-2">
              <PartyPopper className="w-12 h-12 text-white animate-bounce" />
              <div className="absolute -right-2 -top-2 bg-amarillo rounded-full p-1.5 shadow-sm border-2 border-white">
                <CheckCircle2 className="w-5 h-5 text-azul-marino" />
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-azul-marino mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amarillo animate-pulse" />
              ¡Reserva Solicitada!
              <Sparkles className="w-6 h-6 text-amarillo animate-pulse" />
            </h3>
            
            <p className="text-muted-foreground mb-6 text-sm md:text-base font-medium px-2 leading-relaxed">
              ¡Qué emoción! Tu fecha ya está separada. Para confirmarla definitivamente, envianos el comprobante de la seña.
            </p>
            
            {/* Ticket Estilo Cine/Recibo Premium */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-200 space-y-3 relative overflow-hidden">
              
              {/* Efecto de borde troquelado del ticket */}
              <div className="absolute -left-4 top-[55%] w-8 h-8 bg-white rounded-full border border-slate-200" />
              <div className="absolute -right-4 top-[55%] w-8 h-8 bg-white rounded-full border border-slate-200" />
              
              <div className="relative z-10 space-y-2.5">
                <p className="text-sm flex justify-between">
                  <span className="font-semibold text-muted-foreground">Fecha:</span> 
                  <span className="font-bold text-azul-marino capitalize text-right">{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="font-semibold text-muted-foreground">Turno:</span> 
                  <span className="font-bold text-azul-marino text-right">{getTurnoLabel(selectedTurno)}</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="font-semibold text-muted-foreground">A nombre de:</span> 
                  <span className="font-bold text-azul-marino text-right">{datosCliente.nombre}</span>
                </p>
              </div>
              
              <Separator className="my-4 border-dashed border-slate-300 relative z-10" />
              
              <div className="relative z-10">
                <p className="text-sm flex justify-between items-center mb-3">
                  <span className="font-semibold text-muted-foreground">Total:</span> 
                  <span className="font-bold text-lg text-azul-marino">{formatPrice(calculos.total)}</span>
                </p>
                <div className="bg-gradient-to-r from-amarillo/20 to-amarillo/10 p-4 rounded-xl border border-amarillo/30">
                  <p className="text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-azul-marino">
                    <span className="font-bold">Seña a transferir:</span> 
                    <span className="font-extrabold text-2xl text-azul-marino">{formatPrice(calculos.sena)}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href={waUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center h-14 font-extrabold bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full transition-all hover:-translate-y-1 active:scale-95 shadow-lg shadow-green-500/20 text-lg"
              >
                <MessageCircle className="w-6 h-6 mr-2" /> 
                Enviar comprobante
              </a>

              <Button 
                onClick={() => window.location.reload()}
                variant="ghost"
                className="w-full h-12 font-bold text-muted-foreground hover:text-azul-marino hover:bg-slate-100 rounded-full transition-all"
              >
                Cerrar y volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-b from-azul-claro/10 to-lavanda/10 rounded-2xl p-6 shadow-lg border border-azul-claro/20 mb-20 lg:mb-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amarillo/20 mb-3">
            <Sparkles className="w-4 h-4 text-amarillo" />
            <span className="text-sm font-semibold text-azul-marino">
              Resumen de tu reserva
            </span>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rosa/10 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-rosa" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-semibold text-azul-marino truncate">
                {selectedDate
                  ? format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })
                  : "Sin seleccionar"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-azul-claro/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-azul-claro" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Turno</p>
              <p className="font-semibold text-azul-marino">
                {selectedTurno ? getTurnoLabel(selectedTurno) : "Sin seleccionar"}
              </p>
            </div>
          </div>

          {selectedExtras.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-lavanda/10 flex items-center justify-center shrink-0">
                <PartyPopper className="w-5 h-5 text-lavanda" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Extras</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedExtras.map((extra) => (
                    <Badge key={extra} variant="secondary" className="bg-rosa/20 text-rosa text-xs">
                      {extra}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {metodoPago && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-verde/10 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-verde" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Método de pago</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-azul-marino">
                    {metodoPagoLabels[metodoPago]}
                  </p>
                  {metodoPago === "efectivo" && (
                    <Badge className="bg-verde text-white text-xs">10% OFF</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 mb-4">
          {selectedTurno && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Turno</span>
              <span className="font-medium text-foreground">
                {formatPrice(calculos.precioTurno)}
              </span>
            </div>
          )}
          {calculos.precioExtras > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Extras</span>
              <span className="font-medium text-foreground">
                {formatPrice(calculos.precioExtras)}
              </span>
            </div>
          )}
          {calculos.subtotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {formatPrice(calculos.subtotal)}
              </span>
            </div>
          )}
          {calculos.descuento > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-verde font-medium">Descuento 10%</span>
              <span className="text-verde font-medium">
                -{formatPrice(calculos.descuento)}
              </span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-azul-marino">TOTAL</span>
          <span className="text-3xl font-extrabold text-azul-marino">
            {formatPrice(calculos.total)}
          </span>
        </div>

        <div className="bg-amarillo/20 rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-azul-marino">
            <span className="font-bold">Seña requerida para reservar:</span>
          </p>
          <p className="text-2xl font-extrabold text-azul-marino">
            {formatPrice(calculos.sena)}
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleReserva}
          className="hidden lg:flex w-full h-14 text-lg font-bold bg-amarillo hover:bg-amarillo/90 text-azul-marino shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {isSubmitting ? "Procesando reserva..." : "Solicitar Reserva"}
        </Button>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-2 text-sm bg-azul-claro/10 p-3 rounded-lg">
            <CalendarDays className="w-4 h-4 shrink-0 mt-0.5 text-azul-claro" />
            <p className="text-azul-marino">
              <span className="font-semibold">Cancelación:</span> El evento se debe cancelar (abonar la totalidad) 1 semana antes del evento.
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm bg-lavanda/10 p-3 rounded-lg">
            <Timer className="w-4 h-4 shrink-0 mt-0.5 text-lavanda" />
            <p className="text-azul-marino">
              20 minutos de tolerancia para culminar el evento del Salón, para su limpieza.
            </p>
          </div>
          <div className="flex items-start gap-2 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <p className="text-red-600 font-medium">
              Por favor, no usar papel picado ni cotillón con brillantina en ninguna forma.
            </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t border-border/50 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 lg:hidden flex items-center justify-between pb-safe">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</span>
          <span className="text-xl font-extrabold text-azul-marino leading-none mt-1">
            {formatPrice(calculos.total)}
          </span>
        </div>
        <Button
          type="button"
          disabled={!canSubmit || isSubmitting}
          onClick={handleReserva}
          className="h-12 px-6 font-bold bg-amarillo hover:bg-amarillo/90 text-azul-marino shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
        >
          <Sparkles className="w-4 h-4 mr-2 shrink-0" />
          <span className="truncate max-w-[120px]">
            {isSubmitting ? "Procesando..." : "Reservar"}
          </span>
        </Button>
      </div>
    </>
  )
}