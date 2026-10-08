"use client"

/**
 * Carga los precios desde Supabase (tabla `precios`) y los comparte por contexto.
 *
 *  - PreciosProvider: hace la carga. Se monta en los layouts de /reservar y /egresaditos y en /admin.
 *  - PreciosGate: deja pasar a los hijos SOLO cuando hay precios válidos. Mientras carga muestra un
 *    loader; si falla, bloquea la reserva y ofrece contacto por WhatsApp (nunca se cotiza con precios viejos).
 *  - usePreciosListos(): para componentes que están dentro del Gate (o que el código garantiza que se
 *    renderizan con precios listos). Lanza si se usa sin precios: preferimos un error visible en
 *    desarrollo antes que cotizar con datos faltantes.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AlertCircle, Loader2, MessageCircle, RefreshCw } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { cargarPrecios, preciosIguales, type Precios } from "@/lib/precios"
import { WHATSAPP_SALON } from "@/lib/config-reservas"

type EstadoPrecios = "cargando" | "listo" | "error"

interface PreciosContextValue {
  estado: EstadoPrecios
  precios: Precios | null
  /**
   * Vuelve a leer los precios de la base. Devuelve los precios vigentes, o null si no se pudieron leer.
   * Si salió bien, actualiza el contexto (y sale del estado "error"). Si falla NO cambia el estado:
   * una verificación que falla no tiene que desmontar un formulario ya completado.
   */
  recargar: () => Promise<Precios | null>
}

const PreciosContext = createContext<PreciosContextValue | null>(null)

export function PreciosProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<EstadoPrecios>("cargando")
  const [precios, setPrecios] = useState<Precios | null>(null)
  const montado = useRef(true)

  const recargar = useCallback(async (): Promise<Precios | null> => {
    try {
      const nuevos = await cargarPrecios(createBrowserClient())
      if (montado.current) {
        // Si no cambió nada, se conserva el objeto anterior para no invalidar los memos de cálculo.
        setPrecios((actuales) => (actuales && preciosIguales(actuales, nuevos) ? actuales : nuevos))
        setEstado("listo")
      }
      return nuevos
    } catch (e) {
      console.error("[precios] No se pudieron cargar:", e)
      return null
    }
  }, [])

  useEffect(() => {
    montado.current = true
    recargar().then((resultado) => {
      if (montado.current && resultado === null) setEstado("error")
    })
    return () => {
      montado.current = false
    }
  }, [recargar])

  const value = useMemo(() => ({ estado, precios, recargar }), [estado, precios, recargar])

  return <PreciosContext.Provider value={value}>{children}</PreciosContext.Provider>
}

export function usePrecios(): PreciosContextValue {
  const ctx = useContext(PreciosContext)
  if (!ctx) throw new Error("usePrecios tiene que usarse dentro de <PreciosProvider>.")
  return ctx
}

export function usePreciosListos(): { precios: Precios; recargar: PreciosContextValue["recargar"] } {
  const { estado, precios, recargar } = usePrecios()
  if (estado !== "listo" || !precios) {
    throw new Error("usePreciosListos se usó sin precios cargados: envolver con <PreciosGate>.")
  }
  return { precios, recargar }
}

const MENSAJE_WHATSAPP = "Hola! Quiero reservar una fecha pero la página no me deja ver los precios."

export function PreciosGate({ children }: { children: React.ReactNode }) {
  const { estado, recargar } = usePrecios()
  const [reintentando, setReintentando] = useState(false)

  if (estado === "listo") return <>{children}</>

  if (estado === "cargando") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50/30 font-sans px-4">
        <Loader2 className="w-10 h-10 animate-spin text-azul-claro" />
        <p className="text-sm font-medium text-muted-foreground">Cargando precios…</p>
      </main>
    )
  }

  const reintentar = async () => {
    setReintentando(true)
    await recargar()
    setReintentando(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50/30 font-sans px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border/50 shadow-sm p-6 md:p-8 text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-xl font-extrabold text-azul-marino mb-2">No pudimos cargar los precios</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Para no mostrarte un valor incorrecto, la reserva online está pausada por un momento. Escribinos por
          WhatsApp y reservamos tu fecha por ahí.
        </p>
        <a
          href={`https://api.whatsapp.com/send?phone=${WHATSAPP_SALON}&text=${encodeURIComponent(MENSAJE_WHATSAPP)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-11 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold transition-colors"
        >
          <MessageCircle className="w-5 h-5" /> Escribinos por WhatsApp
        </a>
        <button
          type="button"
          onClick={reintentar}
          disabled={reintentando}
          className="mt-3 flex items-center justify-center gap-2 w-full min-h-11 py-3 rounded-xl border-2 border-slate-200 text-azul-marino font-bold hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          {reintentando ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reintentar
        </button>
      </div>
    </main>
  )
}
