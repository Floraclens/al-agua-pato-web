"use client"

import { useState } from "react"
import { CheckCircle2, MessageCircle, AlertTriangle } from "lucide-react"
import { whatsappUrl } from "@/lib/datos-titular"

/**
 * Botón de arrepentimiento (Disp. 954/2025), versión simple aprobada el 23/10/2026: no
 * guarda nada en la base. Genera un código de solicitud (art. 5), lo muestra y abre
 * WhatsApp con el pedido ya escrito. Sin registro ni pasos extra (art. 1).
 */

// Sin 0/O ni 1/I/L, para que se pueda dictar sin confusiones.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

function generarCodigo(): string {
  const hoy = new Date()
  const fecha = `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, "0")}${String(hoy.getDate()).padStart(2, "0")}`
  const azar = crypto.getRandomValues(new Uint32Array(4))
  const sufijo = Array.from(azar, (n) => ALFABETO[n % ALFABETO.length]).join("")
  return `ARR-${fecha}-${sufijo}`
}

function fechaLegible(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

const inputClase =
  "flex h-11 w-full rounded-lg border bg-slate-50 px-3 py-2 text-base md:text-sm outline-none transition-colors focus:border-azul-marino focus:ring-2 focus:ring-azul-marino/20"

export function FormArrepentimiento() {
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [fecha, setFecha] = useState("")
  const [comentario, setComentario] = useState("")
  const [mostrarErrores, setMostrarErrores] = useState(false)
  const [enviado, setEnviado] = useState<{ codigo: string; url: string } | null>(null)

  const nombreOk = nombre.trim().length >= 3
  const telefonoOk = telefono.length >= 10
  const fechaOk = fecha !== ""

  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombreOk || !telefonoOk || !fechaOk) {
      setMostrarErrores(true)
      return
    }
    const codigo = generarCodigo()
    const mensaje = [
      "BOTÓN DE ARREPENTIMIENTO",
      `Código de solicitud: ${codigo}`,
      "",
      "Quiero revocar mi reserva.",
      `Nombre: ${nombre.trim()}`,
      `Teléfono: ${telefono}`,
      `Fecha reservada: ${fechaLegible(fecha)}`,
      ...(comentario.trim() ? [`Comentario: ${comentario.trim()}`] : []),
    ].join("\n")
    const url = whatsappUrl(mensaje)
    setEnviado({ codigo, url })
    window.open(url, "_blank")
  }

  if (enviado) {
    return (
      <div className="bg-white rounded-2xl border-2 border-emerald-200 p-5 md:p-6 shadow-sm text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <div>
          <p className="text-sm font-semibold text-slate-600">Tu código de solicitud</p>
          <p className="text-2xl font-black text-azul-marino tracking-wider break-all select-all">{enviado.codigo}</p>
          <p className="text-xs text-slate-500 mt-1">Guardalo (sacale una captura): es el comprobante de tu pedido.</p>
        </div>
        <div className="flex gap-2 text-left text-[13px] leading-snug bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p>
            <strong>El pedido nos llega cuando envíes el mensaje de WhatsApp</strong> que se abrió con el código. Si no se
            abrió o no lo enviaste, tocá el botón de abajo.
          </p>
        </div>
        <a
          href={enviado.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold transition-colors"
        >
          <MessageCircle className="w-5 h-5" /> Enviar el pedido por WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} noValidate className="bg-white rounded-2xl border border-border/50 p-5 md:p-6 shadow-sm space-y-4">
      <div className="space-y-2">
        <label htmlFor="arr-nombre" className="text-sm font-bold text-azul-marino">Nombre y apellido *</label>
        <input id="arr-nombre" type="text" autoComplete="name" className={`${inputClase} ${mostrarErrores && !nombreOk ? "border-red-500" : "border-input"}`} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        {mostrarErrores && !nombreOk && <p className="text-[13px] text-red-500 font-semibold">Ingresá tu nombre completo.</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="arr-telefono" className="text-sm font-bold text-azul-marino">Teléfono *</label>
        <input id="arr-telefono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="Ej: 3854123456" className={`${inputClase} ${mostrarErrores && !telefonoOk ? "border-red-500" : "border-input"}`} value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} />
        {mostrarErrores && !telefonoOk && <p className="text-[13px] text-red-500 font-semibold">Ingresá un número válido (mínimo 10 dígitos).</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="arr-fecha" className="text-sm font-bold text-azul-marino">Fecha reservada *</label>
        <input id="arr-fecha" type="date" className={`${inputClase} ${mostrarErrores && !fechaOk ? "border-red-500" : "border-input"}`} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        {mostrarErrores && !fechaOk && <p className="text-[13px] text-red-500 font-semibold">Elegí la fecha de tu reserva.</p>}
      </div>
      <div className="space-y-2">
        <label htmlFor="arr-comentario" className="text-sm font-bold text-azul-marino">Comentario (opcional)</label>
        <textarea id="arr-comentario" rows={3} maxLength={300} className={`${inputClase} h-auto border-input`} value={comentario} onChange={(e) => setComentario(e.target.value)} />
      </div>
      <button type="submit" className="w-full min-h-12 rounded-full bg-azul-marino hover:bg-azul-marino/90 text-white font-extrabold transition-colors">
        Solicitar la revocación
      </button>
      <p className="text-xs text-slate-500 text-center">Al tocar el botón te damos un código y se abre WhatsApp con el pedido.</p>
    </form>
  )
}
