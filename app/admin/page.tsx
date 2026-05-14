"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" 
import { 
  Calendar, 
  Trash2, 
  LogOut, 
  Waves, 
  Phone, 
  User, 
  Banknote,
  Loader2,
  Mail,
  CheckCircle2,
  Clock,
  Lock,
  Filter,
  DollarSign,
  AlertCircle,
  MessageCircle,
  PartyPopper,
  CheckCircle,
  CalendarDays,
  Share2,
  X
} from "lucide-react"

import { ReservationCalendar } from "@/components/reservation-calendar"
import { getTurnoLabel, type Turno } from "@/lib/turno"

type FiltroEstado = "todas" | "pendiente" | "confirmadas" | "completadas"

function toLocalDateString(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export default function AdminPage() {
  const [supabase] = useState(() => createBrowserClient())

  const [usuario, setUsuario] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>("todas")

  const [modalReprogramar, setModalReprogramar] = useState<any>(null)
  const [reprogramDate, setReprogramDate] = useState<Date | undefined>(undefined)
  const [reprogramTurno, setReprogramTurno] = useState<Turno>(null)

  const fetchReservas = useCallback(async () => {
    setIsFetching(true)
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("fecha", { ascending: true })

    if (!error && data) {
      setReservas(data)
    }
    setIsFetching(false)
  }, [supabase])

  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session)
        if (session) fetchReservas()
        else setIsFetching(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
        if (_event === 'SIGNED_IN') fetchReservas()
        if (_event === 'SIGNED_OUT') {
          setReservas([])
          setIsFetching(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchReservas])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    let loginEmail = usuario
    if (!usuario.includes("@")) {
      loginEmail = `${usuario}@alaguapato.com`
    }

    const { error } = await supabase.auth.signInWithPassword({ 
      email: loginEmail, 
      password 
    })
    
    if (error) {
      toast.error("Usuario o contraseña incorrectos")
    } else {
      toast.success("¡Bienvenida al panel!")
    }
    setIsLoading(false)
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const handleEliminarReserva = async (id: number, nombre: string) => {
    const confirmar = window.confirm(`¿Estás segura de que querés ELIMINAR la reserva de ${nombre}?`)
    if (!confirmar) return

    const { error } = await supabase.from("reservas").delete().eq("id", id)
    if (error) {
      toast.error("Hubo un error al eliminar la reserva.")
    } else {
      toast.success("Reserva eliminada correctamente.")
      setReservas(reservas.filter((r) => r.id !== id))
    }
  }

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (error) {
      toast.error("Error al actualizar el estado.")
    } else {
      toast.success("Estado actualizado con éxito.")
      setReservas(reservas.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r))
    }
  }

  const abrirModalReprogramar = (reserva: any) => {
    setModalReprogramar(reserva)
    setReprogramDate(undefined)
    setReprogramTurno(null)
  }

  const guardarReprogramacion = async () => {
    if (!reprogramDate || !reprogramTurno) {
      toast.error("Por favor, elegí una nueva fecha y un horario disponible en el calendario.")
      return
    }

    const nuevaFechaStr = toLocalDateString(reprogramDate)
    const nuevoTurnoStr = getTurnoLabel(reprogramTurno)

    const { error } = await supabase
      .from("reservas")
      .update({ fecha: nuevaFechaStr, turno: nuevoTurnoStr })
      .eq("id", modalReprogramar.id)

    if (error) {
      toast.error("Ocurrió un error al reprogramar la reserva.")
    } else {
      toast.success("¡Reserva reprogramada con éxito!")
      setModalReprogramar(null)
      fetchReservas() 
    }
  }

  // --- OPCIÓN NUCLEAR: EMOJIS EN CÓDIGO UNICODE ---
  const handleCompartirMes = () => {
    const activas = reservas.filter(r => {
      const est = (r.estado || "").toLowerCase()
      return est === "senado" || est === "completado" || est === "confirmada"
    })

    if (activas.length === 0) {
      toast.error("No hay reservas confirmadas para compartir.")
      return
    }

    // \uD83E\uDD86 = Pato | \uD83D\uDCC5 = Calendario | \u23F0 = Reloj | \uD83D\uDC64 = Usuario 
    // \uD83C\uDF93 = Egresado | \uD83C\uDF82 = Torta | \uD83C\uDF88 = Globo
    let textoCopiar = `\uD83E\uDD86 *RESERVAS CONFIRMADAS - AL AGUA PATO* \uD83E\uDD86\n(Generado automáticamente)\n\n`
    
    activas.forEach(r => {
      let fechaFmt = r.fecha
      try { 
        fechaFmt = format(parseISO(r.fecha), "EEEE d 'de' MMMM", { locale: es }).toUpperCase() 
      } catch (e) {}
      
      textoCopiar += `\uD83D\uDCC5 *${fechaFmt}*\n`
      textoCopiar += `\u23F0 Horario: ${r.turno}\n`
      textoCopiar += `\uD83D\uDC64 Cliente: ${r.nombre} (${r.telefono})\n`
      if (r.nombre_cumpleanero) {
        if (r.nombre_cumpleanero.includes("\uD83C\uDF93") || r.nombre_cumpleanero.includes("🎓")) {
          const colegioLimpio = r.nombre_cumpleanero.replace("🎓", "").replace("\uD83C\uDF93", "").trim()
          textoCopiar += `\uD83C\uDF93 Colegio: ${colegioLimpio} (${r.edad_cumple || ""})\n`
        } else {
          textoCopiar += `\uD83C\uDF82 Cumpleañero: ${r.nombre_cumpleanero} (${r.edad_cumple ? r.edad_cumple + ' años' : ''})\n`
        }
      }
      textoCopiar += `\uD83C\uDF88 Extras solicitados: ${r.extras_elegidos || "Ninguno"}\n`
      textoCopiar += `-----------------------------------\n\n`
    })

    navigator.clipboard.writeText(textoCopiar).then(() => {
      toast.success("¡Resumen copiado al portapapeles! Ya podés pegarlo en tu WhatsApp.")
    }).catch(err => {
      toast.error("Error al copiar. Tu navegador no lo permite automáticamente.")
    })
  }

  const reservasFiltradas = useMemo(() => {
    if (filtroActivo === "todas") return reservas
    if (filtroActivo === "pendiente") return reservas.filter(r => (r.estado || "pendiente").toLowerCase() === "pendiente")
    if (filtroActivo === "confirmadas") return reservas.filter(r => {
      const est = (r.estado || "").toLowerCase()
      return est === "senado" || est === "confirmada"
    })
    if (filtroActivo === "completadas") return reservas.filter(r => (r.estado || "").toLowerCase() === "completado")
    
    return reservas
  }, [reservas, filtroActivo])

  const metricas = useMemo(() => {
    const pendientes = reservas.filter(r => (r.estado || "pendiente").toLowerCase() === "pendiente")
    const confirmadas = reservas.filter(r => {
      const est = (r.estado || "").toLowerCase()
      return est === "senado" || est === "confirmada"
    })
    const completadas = reservas.filter(r => (r.estado || "").toLowerCase() === "completado")
    
    const activas = confirmadas.length + completadas.length

    const ingresosTotales = reservas.reduce((acc, r) => {
      const estado = (r.estado || "pendiente").toLowerCase()
      if (estado === "completado") return acc + (Number(r.total) || 0)
      if (estado === "senado" || estado === "confirmada") return acc + (Number(r.sena) || 0)
      return acc
    }, 0)

    return {
      total: reservas.length,
      activas: activas, 
      confirmadas: confirmadas.length, 
      pendientes: pendientes.length,
      completadas: completadas.length, 
      ingresos: ingresosTotales
    }
  }, [reservas])

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
  }

  // --- SOLUCIÓN NUCLEAR A EMOJIS ROTOS EN WHATSAPP ---
  const getWhatsAppLink = (reserva: any, isActiva: boolean, fechaFormat: string) => {
    if (!reserva.telefono) return "#"
    const phone = reserva.telefono.replace(/\D/g, "")
    const urlInvitacion = `https://al-agua-pato-web.vercel.app/invitacion/${reserva.id}`
    
    let mensaje = ""
    // \uD83E\uDD86 = Pato | \u2728 = Estrellitas | \uD83D\uDC49 = Dedo índice
    if (isActiva) {
      mensaje = `¡Hola ${reserva.nombre}! Te escribimos de Al Agua Pato \uD83E\uDD86\u2728. ¡Tu fecha para el ${fechaFormat} ya está súper confirmada! Te compartimos el acceso a tu Panel VIP para que puedas armar la invitación digital interactiva de tu evento:\n\n\uD83D\uDC49 ${urlInvitacion}`
    } else {
      mensaje = `¡Hola ${reserva.nombre}! Te escribimos de Al Agua Pato \uD83E\uDD86. Vimos que iniciaste tu reserva para el ${fechaFormat}, pero nos quedó pendiente recibir el comprobante de pago para bloquearte el lugar. ¿Tuviste algún inconveniente? ¡Avisanos así te aseguramos la fecha! \u2728`
    }
    
    // Usamos encodeURIComponent nativo que es el método 100% a prueba de fallos para WhatsApp
    return `https://wa.me/549${phone}?text=${encodeURIComponent(mensaje)}`
  }
  // ---------------------------------------------

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-azul-claro/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-azul-claro" />
            </div>
            <h1 className="text-2xl font-bold text-azul-marino">Acceso Privado</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-azul-marino hover:bg-azul-marino/90 font-bold text-white mt-4" disabled={isLoading}>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />} Ingresar
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans relative">
      <nav className="bg-azul-marino text-white p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waves className="h-6 w-6 text-amarillo" />
            <span className="font-bold text-lg">Panel de Lorena</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 mt-8 max-w-7xl">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">Total Reservas</span>
              <Calendar className="w-5 h-5 text-azul-claro opacity-50" />
            </div>
            <span className="text-3xl font-black text-azul-marino">{metricas.total}</span>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">Confirmadas</span>
              <CheckCircle2 className="w-5 h-5 text-green-500 opacity-50" />
            </div>
            <span className="text-3xl font-black text-green-600">{metricas.activas}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-muted-foreground">Pendientes</span>
              <AlertCircle className="w-5 h-5 text-orange-500 opacity-50" />
            </div>
            <span className="text-3xl font-black text-orange-500">{metricas.pendientes}</span>
          </div>

          <div className="bg-gradient-to-br from-azul-marino to-slate-800 p-5 rounded-2xl border border-azul-marino shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white/70">Ingresos Asegurados</span>
              <DollarSign className="w-5 h-5 text-amarillo opacity-70" />
            </div>
            <span className="text-2xl md:text-3xl font-black text-white">{formatMoney(metricas.ingresos)}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 bg-white p-2 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex w-full md:w-auto gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button 
              onClick={() => setFiltroActivo("todas")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${filtroActivo === "todas" ? "bg-white text-azul-marino shadow-sm" : "text-slate-500 hover:text-azul-marino"}`}
            >
              Todas ({metricas.total})
            </button>
            <button 
              onClick={() => setFiltroActivo("pendiente")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtroActivo === "pendiente" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-orange-600"}`}
            >
              <AlertCircle className="w-4 h-4" /> Pendientes ({metricas.pendientes})
            </button>
            <button 
              onClick={() => setFiltroActivo("confirmadas")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtroActivo === "confirmadas" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-blue-600"}`}
            >
              <CheckCircle2 className="w-4 h-4" /> Confirmadas ({metricas.confirmadas})
            </button>
            <button 
              onClick={() => setFiltroActivo("completadas")}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${filtroActivo === "completadas" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-green-600"}`}
            >
              <CheckCircle className="w-4 h-4" /> Pago Total ({metricas.completadas})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto pr-2">
            <Button 
              onClick={handleCompartirMes}
              className="w-full md:w-auto bg-azul-claro hover:bg-azul-claro/90 text-white font-bold rounded-lg shadow-sm"
            >
              <Share2 className="w-4 h-4 mr-2" /> Copiar Resumen
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-muted-foreground whitespace-nowrap">
              <Filter className="w-4 h-4" /> {reservasFiltradas.length} res.
            </div>
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-azul-claro" /></div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-border/50 shadow-sm flex flex-col items-center">
            <Calendar className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-2xl font-bold text-azul-marino mb-2">No hay reservas en esta categoría</h3>
            <p className="text-muted-foreground">Cuando ingresen nuevas solicitudes aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservasFiltradas.map((reserva) => {
              let fechaFormateada = reserva.fecha
              try { fechaFormateada = format(parseISO(reserva.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es }) } catch (e) {}
              
              const estadoRaw = (reserva.estado || "pendiente").toLowerCase()
              const estadoNormalizado = estadoRaw === "confirmada" ? "senado" : estadoRaw

              const isPendiente = estadoNormalizado === "pendiente"
              const isSenado = estadoNormalizado === "senado"
              const isCompletado = estadoNormalizado === "completado"
              const isActiva = isSenado || isCompletado

              const isPagoTotalidadDesdeInicio = reserva.sena >= reserva.total || (reserva.metodo_pago && reserva.metodo_pago.includes("Totalidad"))
              
              const isEgresadito = reserva.nombre_cumpleanero?.includes("🎓") || reserva.nombre_cumpleanero?.includes("\uD83C\uDF93")

              return (
                <div key={reserva.id} className={`bg-white rounded-2xl border-2 shadow-sm p-5 md:p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between transition-all hover:shadow-md ${isActiva ? "border-transparent" : "border-orange-200"}`}>
                  <div className="grid sm:grid-cols-2 gap-4 lg:gap-8 flex-1 w-full">
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        {isPendiente && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider bg-orange-100 text-orange-700 animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" /> Pago Pendiente
                          </span>
                        )}
                        {isSenado && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider bg-blue-100 text-blue-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Seña Confirmada
                          </span>
                        )}
                        {isCompletado && (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider bg-green-100 text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" /> Pago Completo
                          </span>
                        )}
                      </div>
                      <p className="font-black text-xl text-azul-marino capitalize leading-tight">{fechaFormateada}</p>
                      <p className="text-slate-600 font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-azul-claro" /> {reserva.turno}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-azul-marino font-extrabold text-lg">
                        <User className="h-5 w-5 text-lavanda" /> {reserva.nombre}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Phone className="h-4 w-4" /> {reserva.telefono}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm break-all">
                        <Mail className="h-4 w-4 shrink-0" /> {reserva.email || "Sin email"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Detalles del Evento</p>
                      
                      {isEgresadito ? (
                        <p className="text-sm text-slate-700">
                          <span className="font-bold text-azul-marino">Colegio:</span> {reserva.nombre_cumpleanero.replace("🎓", "").replace("\uD83C\uDF93", "").trim()} ({reserva.edad_cumple || "-"})
                        </p>
                      ) : (
                        <p className="text-sm text-slate-700">
                          <span className="font-bold text-azul-marino">Cumpleañero:</span> {reserva.nombre_cumpleanero || "N/A"} ({reserva.edad_cumple ? reserva.edad_cumple + " años" : "-"})
                        </p>
                      )}

                      <p className="text-sm text-slate-700">
                        <span className="font-bold text-azul-marino">Extras:</span> {reserva.extras_elegidos || "Ninguno"}
                      </p>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 relative">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Resumen Financiero</p>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">{reserva.metodo_pago}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-200 pt-1 mt-1">
                        <span className="font-bold text-azul-marino">Seña Sugerida:</span>
                        <span className="font-bold text-sm text-slate-600">{formatMoney(reserva.sena)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-azul-marino">Total Final:</span>
                        <span className="font-black text-lg text-verde">{formatMoney(reserva.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 w-full lg:w-48 mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                    
                    {isPendiente && (
                      <Button 
                        className="w-full h-11 font-bold bg-verde hover:bg-verde/90 text-white shadow-md shadow-green-500/20"
                        onClick={() => handleCambiarEstado(reserva.id, isPagoTotalidadDesdeInicio ? 'completado' : 'senado')}
                      >
                        {isPagoTotalidadDesdeInicio ? "Confirmar Pago Total" : "¡Seña Recibida!"}
                      </Button>
                    )}

                    {isSenado && (
                      <>
                        <Button 
                          className="w-full h-11 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                          onClick={() => handleCambiarEstado(reserva.id, 'completado')}
                        >
                          Pago Total Recibido
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full h-10 text-sm font-bold border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 transition-colors shadow-sm"
                          onClick={() => handleCambiarEstado(reserva.id, 'pendiente')}
                        >
                          Deshacer Seña
                        </Button>
                      </>
                    )}

                    {isCompletado && (
                      <Button 
                        variant="outline"
                        className="w-full h-11 font-bold border-slate-300 text-slate-600 hover:bg-slate-100"
                        onClick={() => handleCambiarEstado(reserva.id, isPagoTotalidadDesdeInicio ? 'pendiente' : 'senado')}
                      >
                        Deshacer Pago Completo
                      </Button>
                    )}

                    {reserva.telefono && !(isActiva && isEgresadito) && (
                      <a 
                        href={getWhatsAppLink(reserva, isActiva, fechaFormateada)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`w-full flex justify-center items-center gap-2 font-bold py-2.5 px-4 rounded-lg transition-colors text-sm border ${
                          isActiva 
                            ? "bg-gradient-to-r from-amarillo/20 to-naranja/20 text-naranja border-naranja/30 hover:bg-naranja/20" 
                            : "bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#1da851] border-[#25D366]/30"
                        }`}
                      >
                        {isActiva ? <PartyPopper className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />} 
                        {isActiva ? "Enviar Invitación VIP" : "Reclamar Seña"}
                      </a>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 border-azul-claro/40 text-azul-claro hover:bg-azul-claro/10" 
                        onClick={() => abrirModalReprogramar(reserva)}
                      >
                        <CalendarDays className="h-4 w-4 shrink-0" />
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 border-red-200 text-red-500 hover:bg-red-50" 
                        onClick={() => handleEliminarReserva(reserva.id, reserva.nombre)}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* --- MODAL PARA REPROGRAMAR CON CALENDARIO INTERACTIVO --- */}
      {modalReprogramar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="bg-azul-marino p-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <CalendarDays className="w-5 h-5" /> Reprogramar Evento
              </h3>
              <button onClick={() => setModalReprogramar(null)} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                <p className="text-sm text-slate-500 font-medium">Cliente: <strong className="text-azul-marino">{modalReprogramar.nombre}</strong></p>
                <p className="text-sm text-slate-500 font-medium">Fecha Actual: <strong className="text-red-500">{modalReprogramar.fecha} ({modalReprogramar.turno})</strong></p>
              </div>

              <div className="border border-slate-200 rounded-xl p-2 md:p-4">
                <ReservationCalendar
                  selectedDate={reprogramDate}
                  onSelectDate={(d) => {
                    setReprogramDate(d)
                    setReprogramTurno(null)
                  }}
                  onTurnoBooked={setReprogramTurno}
                  ignoreReservaId={modalReprogramar.id}
                />
              </div>

              <Button 
                onClick={guardarReprogramacion}
                disabled={!reprogramDate || !reprogramTurno}
                className="w-full h-12 bg-amarillo hover:bg-amarillo/90 text-azul-marino font-extrabold text-base mt-4 shadow-md disabled:opacity-50"
              >
                Guardar Nueva Fecha
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}