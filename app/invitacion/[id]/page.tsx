"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { PartyPopper, CalendarDays, Clock, MapPin, Loader2, Sparkles, Download, Share2, Palette, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { toPng } from "html-to-image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ReservaInfo {
  fecha: string
  turno: string
  nombre_cumpleanero: string
  edad_cumple: string
}

type Tema = "pastel" | "neon" | "aventura"

export default function InvitacionVIP() {
  const params = useParams()
  const id = params.id as string

  const [reserva, setReserva] = useState<ReservaInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [temaActual, setTemaActual] = useState<Tema>("pastel")
  const [isGenerating, setIsGenerating] = useState(false)
  
  const tarjetaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchReserva() {
      if (!id) return
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("reservas")
        .select("fecha, turno, nombre_cumpleanero, edad_cumple")
        .eq("id", id)
        .single()

      if (error || !data) {
        console.error("Error buscando reserva:", error)
        setError(true)
      } else {
        setReserva(data)
      }
      setLoading(false)
    }

    fetchReserva()
  }, [id])

  // NUEVO MOTOR DE CAPTURA
  const capturarImagen = async () => {
    if (!tarjetaRef.current) return null
    try {
      setIsGenerating(true)
      const dataUrl = await toPng(tarjetaRef.current, {
        quality: 1,
        pixelRatio: 3, // Alta definición
        cacheBust: true,
      })
      setIsGenerating(false)
      return dataUrl
    } catch (err) {
      console.error("Error al generar imagen", err)
      setIsGenerating(false)
      return null
    }
  }

  const handleDownload = async () => {
    const dataUrl = await capturarImagen()
    if (!dataUrl) return
    const link = document.createElement("a")
    link.download = `Invitacion_${reserva?.nombre_cumpleanero || "Cumple"}.png`
    link.href = dataUrl
    link.click()
  }

  const handleShare = async () => {
    const dataUrl = await capturarImagen()
    if (!dataUrl) return
    
    // Convertimos la imagen a un archivo para enviarla por WhatsApp/Redes
    try {
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], "invitacion.png", { type: "image/png" })
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '¡Estás invitado!',
          text: '¡Te espero en mi cumple! 🦆✨',
        })
      } else {
        handleDownload()
        alert("Tu dispositivo no soporta compartir directamente. La imagen se descargó para que la envíes manualmente.")
      }
    } catch (err) {
      console.log("Compartir cancelado o falló", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-azul-claro animate-spin mb-4" />
        <p className="text-azul-marino font-bold">Armando tu invitación mágica...</p>
      </div>
    )
  }

  if (error || !reserva) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-azul-marino mb-2">¡Ups! Enlace no válido</h2>
        <p className="text-muted-foreground max-w-md">
          No pudimos encontrar tu reserva. Asegurate de haber copiado el enlace completo que te enviamos por WhatsApp.
        </p>
      </div>
    )
  }

  const [year, month, day] = reserva.fecha.split("-")
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  const fechaLegible = `${day} de ${meses[Number(month) - 1]}`

  const themes = {
    pastel: {
      id: "pastel",
      name: "Magia Pastel",
      bgPantalla: "bg-gradient-to-b from-rosa/10 via-lavanda/10 to-azul-claro/10",
      cardBg: "bg-gradient-to-br from-white via-rosa/5 to-lavanda/10",
      cardBorder: "border-2 border-white/60 shadow-[0_20px_50px_rgba(236,72,153,0.15)]",
      textColor: "text-azul-marino",
      accentColor: "text-rosa",
      accentBg: "bg-rosa/10",
      iconColor: "text-lavanda",
      gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-rosa to-lavanda",
      badge: "bg-amarillo text-azul-marino"
    },
    neon: {
      id: "neon",
      name: "Neón Party",
      bgPantalla: "bg-slate-950",
      cardBg: "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950",
      cardBorder: "border-2 border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.2)]",
      textColor: "text-white",
      accentColor: "text-cyan-400",
      accentBg: "bg-cyan-500/10",
      iconColor: "text-fuchsia-400",
      gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500",
      badge: "bg-fuchsia-500 text-white"
    },
    aventura: {
      id: "aventura",
      name: "Aventura",
      bgPantalla: "bg-emerald-50",
      cardBg: "bg-gradient-to-br from-emerald-100/50 via-yellow-50 to-orange-50",
      cardBorder: "border-2 border-emerald-200 shadow-[0_20px_50px_rgba(16,185,129,0.15)]",
      textColor: "text-emerald-950",
      accentColor: "text-orange-500",
      accentBg: "bg-orange-500/10",
      iconColor: "text-emerald-600",
      gradientText: "bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-orange-500",
      badge: "bg-emerald-500 text-white"
    }
  }

  const t = themes[temaActual]

  return (
    <main className={`min-h-screen ${t.bgPantalla} flex flex-col items-center py-10 px-4 font-sans transition-colors duration-500`}>
      <div className="w-full max-w-[400px]">
        
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-extrabold ${temaActual === 'neon' ? 'text-white' : 'text-azul-marino'} tracking-tight`}>
            Tu Invitación Digital
          </h1>
          <p className={`${temaActual === 'neon' ? 'text-slate-400' : 'text-muted-foreground'} text-sm mt-1`}>
            Elegí un diseño y descargá la imagen
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full flex gap-1 mb-8 shadow-sm border border-black/5 mx-auto w-fit">
          <Palette className={`w-5 h-5 ml-3 my-auto ${temaActual === 'neon' ? 'text-white' : 'text-slate-400'}`} />
          {(Object.keys(themes) as Tema[]).map((temaKey) => (
            <button
              key={temaKey}
              onClick={() => setTemaActual(temaKey)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                temaActual === temaKey 
                  ? "bg-white text-azul-marino shadow-sm scale-105" 
                  : "text-slate-500 hover:bg-white/30"
              }`}
            >
              {themes[temaKey].name}
            </button>
          ))}
        </div>

        <div className="relative mx-auto w-full max-w-[360px] aspect-[9/16] p-4 flex items-center justify-center">
          <div 
            ref={tarjetaRef} 
            className={`w-full h-full rounded-3xl ${t.cardBg} ${t.cardBorder} p-6 flex flex-col relative overflow-hidden`}
            style={{ backgroundColor: temaActual === 'neon' ? '#0f172a' : '#ffffff' }}
          >
            {temaActual === "pastel" && (
              <>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amarillo/30 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-lavanda/30 rounded-full blur-3xl" />
              </>
            )}
            {temaActual === "neon" && (
              <>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
              </>
            )}
            {temaActual === "aventura" && (
              <>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl" />
              </>
            )}

            <div className="relative z-10 flex flex-col h-full text-center">
              
              <div className="mb-auto pt-4">
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg rotate-3 mb-6 ${temaActual === 'neon' ? 'bg-slate-800 border border-cyan-500/50' : 'bg-white border border-slate-100'}`}>
                   <Image src="/og-image.jpg" alt="Logo" width={64} height={64} className="rounded-2xl object-cover" />
                </div>
                <Badge className={`mx-auto ${t.badge} mb-4 uppercase tracking-widest text-[10px] font-black px-3 py-1 shadow-sm`}>
                  Estás Invitado/a
                </Badge>
                <h2 className={`text-xl font-bold ${t.textColor} leading-tight mb-2 opacity-90`}>
                  Vení a festejar con
                </h2>
                <h1 className={`text-4xl md:text-5xl font-black ${t.gradientText} leading-tight`}>
                  {reserva.nombre_cumpleanero || "nosotros"} <br/>
                  {reserva.edad_cumple ? <span className="text-3xl">{reserva.edad_cumple} añitos</span> : ""}
                </h1>
              </div>

              <div className={`mt-auto w-full rounded-2xl p-4 text-left space-y-4 ${temaActual === 'neon' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/60 border-white'} border backdrop-blur-md shadow-sm`}>
                
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.accentBg} flex items-center justify-center shrink-0`}>
                    <CalendarDays className={`w-6 h-6 ${t.accentColor}`} />
                  </div>
                  <div>
                    <p className={`text-[11px] uppercase tracking-wider font-bold opacity-60 ${t.textColor}`}>Día del evento</p>
                    <p className={`font-black text-lg ${t.textColor}`}>{fechaLegible}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.accentBg} flex items-center justify-center shrink-0`}>
                    <Clock className={`w-6 h-6 ${t.iconColor}`} />
                  </div>
                  <div>
                    <p className={`text-[11px] uppercase tracking-wider font-bold opacity-60 ${t.textColor}`}>Horario</p>
                    <p className={`font-black text-lg ${t.textColor}`}>{reserva.turno}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${t.accentBg} flex items-center justify-center shrink-0`}>
                    <MapPin className={`w-6 h-6 ${t.accentColor}`} />
                  </div>
                  <div>
                    <p className={`text-[11px] uppercase tracking-wider font-bold opacity-60 ${t.textColor}`}>Ubicación</p>
                    <p className={`font-black text-lg leading-none ${t.textColor}`}>Al Agua Pato</p>
                    <p className={`text-xs font-medium opacity-70 mt-1 ${t.textColor}`}>Salón de Fiestas Infantiles</p>
                  </div>
                </div>

              </div>

              <div className="pt-6 pb-2 text-center">
                <p className={`text-sm font-bold ${t.textColor} flex items-center justify-center gap-2 opacity-80`}>
                  <PartyPopper className="w-4 h-4" />
                  ¡Te esperamos para jugar!
                  <PartyPopper className="w-4 h-4" />
                </p>
              </div>

            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 mt-2">
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            variant="outline" 
            className={`flex-1 h-14 font-extrabold border-2 transition-all ${
              temaActual === 'neon' 
                ? 'bg-slate-900 border-cyan-500 text-cyan-400 hover:bg-slate-800' 
                : 'bg-white border-azul-claro text-azul-marino hover:bg-slate-50'
            }`}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            Descargar
          </Button>

          <Button 
            onClick={handleShare} 
            disabled={isGenerating}
            className={`flex-1 h-14 font-extrabold shadow-lg transition-all ${
              temaActual === 'neon'
                ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-500/20'
                : 'bg-azul-marino hover:bg-azul-marino/90 text-white'
            }`}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Share2 className="w-5 h-5 mr-2" />}
            Compartir
          </Button>
        </div>

      </div>
    </main>
  )
}