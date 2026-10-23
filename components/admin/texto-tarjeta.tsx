"use client"

/**
 * Panel /admin → Precios: el texto de la opción Tarjeta (tabla `textos_web`, P1 #14 de la
 * propuesta). Las condiciones de tarjeta cambian seguido, así que la admin las escribe acá.
 * Se guarda aparte de los precios (su propio botón), y avisa la regla de las cuotas.
 */

import { useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { toast } from "sonner"
import { AlertCircle, CreditCard, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cargarTextoTarjeta, mencionaCuotas, MAX_TEXTO_WEB, validarTextoTarjeta } from "@/lib/textos-web"

export function TextoTarjeta({ supabase }: { supabase: SupabaseClient }) {
  const [guardado, setGuardado] = useState<string | null>(null)
  const [texto, setTexto] = useState("")
  const [estado, setEstado] = useState<"cargando" | "listo" | "sin-tabla">("cargando")
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let vivo = true
    cargarTextoTarjeta(supabase)
      .then((t) => {
        if (!vivo) return
        if (t === null) return setEstado("sin-tabla")
        setGuardado(t)
        setTexto(t)
        setEstado("listo")
      })
      .catch((e) => {
        console.error("[textos_web]", e)
        if (vivo) setEstado("sin-tabla")
      })
    return () => {
      vivo = false
    }
  }, [supabase])

  const error = estado === "listo" ? validarTextoTarjeta(texto) : null
  const cambiado = guardado !== null && texto.trim() !== guardado
  const conCuotas = mencionaCuotas(texto)

  const guardar = async () => {
    if (error || !cambiado) return
    setGuardando(true)
    const { data, error: errorBase } = await supabase
      .from("textos_web")
      .update({ texto: texto.trim() })
      .eq("clave", "tarjeta")
      .select("texto")
    setGuardando(false)
    if (errorBase || !data || data.length !== 1) {
      console.error("[textos_web] No se guardó:", errorBase)
      toast.error("No se pudo guardar el texto de la tarjeta", {
        description: errorBase?.message ?? "Revisá que tengas sesión de administradora.",
      })
      return
    }
    setGuardado(data[0].texto)
    setTexto(data[0].texto)
    toast.success("Texto de la tarjeta guardado")
  }

  return (
    <section className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden">
      <h3 className="px-5 py-4 font-extrabold text-azul-marino bg-slate-50/70 border-b border-border/50 flex items-center gap-2">
        <CreditCard className="w-5 h-5" /> Texto de la opción Tarjeta
      </h3>
      <div className="px-5 py-4 space-y-3">
        {estado === "cargando" && <Loader2 className="w-5 h-5 animate-spin text-slate-400" />}

        {estado === "sin-tabla" && (
          <p className="text-sm text-slate-600">
            Todavía no se puede editar (falta preparar la base). La web muestra «Solo tarjetas bancarizadas».
          </p>
        )}

        {estado === "listo" && (
          <>
            <label htmlFor="texto-tarjeta" className="text-sm font-semibold text-slate-700">
              Lo que dice la opción Tarjeta al reservar
            </label>
            <textarea
              id="texto-tarjeta"
              rows={3}
              maxLength={MAX_TEXTO_WEB}
              value={texto}
              disabled={guardando}
              onChange={(e) => setTexto(e.target.value)}
              aria-invalid={error ? true : undefined}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-base outline-none focus:ring-2 focus:ring-azul-marino/20 ${error ? "border-red-500" : "border-input"}`}
            />
            <p className="text-xs text-slate-400 text-right">
              {texto.trim().length}/{MAX_TEXTO_WEB}
            </p>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

            <div
              className={`flex gap-2 text-xs leading-snug rounded-lg p-3 border ${conCuotas ? "bg-red-50 border-red-200 text-red-800" : "bg-slate-50 border-slate-200 text-slate-600"}`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>
                <strong>Si ofrecés cuotas</strong>, la ley pide escribir el precio de contado, la cantidad y el valor de
                cada cuota, y el CFT (costo financiero total). Ejemplo: «3 cuotas de $ 120.000 (precio de contado $ 360.000).
                CFT: X %». Si el recargo de arriba es mayor a 0, la web le agrega «(recargo X%)».
              </p>
            </div>

            <div className="flex justify-end gap-2">
              {cambiado && (
                <Button variant="outline" className="h-11" disabled={guardando} onClick={() => setTexto(guardado ?? "")}>
                  Descartar
                </Button>
              )}
              <Button
                className="h-11 bg-amarillo hover:bg-amarillo/90 text-azul-marino font-extrabold disabled:opacity-50"
                disabled={!cambiado || !!error || guardando}
                onClick={guardar}
              >
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Guardar texto
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
