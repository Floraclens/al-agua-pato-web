"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ServiciosIncluidos } from "@/components/servicios-incluidos"
import { PhotoGallery } from "@/components/photo-gallery"
import { 
  Sparkles, MapPin, CheckCircle2, Star, ArrowDown, 
  PartyPopper, Wand2, ArrowRight, ShieldCheck, X, MessageCircle,
  HelpCircle, Phone, Mail, GraduationCap, School, ChevronDown,
  Instagram, Facebook // <-- NUEVOS ICONOS IMPORTADOS
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [showEventMenu, setShowEventMenu] = useState(false); 
  const reservaFinalRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingButton(!entry.isIntersecting);
      },
      { threshold: 0.1 } 
    );

    if (reservaFinalRef.current) {
      observer.observe(reservaFinalRef.current);
    }

    return () => {
      if (reservaFinalRef.current) {
        observer.unobserve(reservaFinalRef.current);
      }
    };
  }, []);

  const scrollToGaleria = () => {
    document.getElementById('galeria')?.scrollIntoView({ behavior: 'smooth' });
  }

  const scrollToReserva = () => {
    document.getElementById('reserva-final')?.scrollIntoView({ behavior: 'smooth' });
  }

  const footerLinks = [
    { name: "Inicio", href: "#top" },
    { name: "Galería", href: "#galeria" },
    { name: "Servicios", href: "#servicios" },
    { name: "Preguntas Frecuentes", href: "#faq" },
    { name: "Reservar", href: "/reservar" },
    { name: "Egresaditos", href: "/egresaditos" },
  ]

  return (
    <main id="top" className="min-h-screen bg-[#081524] font-sans">
      <div className="bg-background">
        
        <header className="bg-white/90 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 bg-transparent">
                  <Image src="/logo-circular.png" alt="Logo Al Agua Pato" fill sizes="(max-width: 768px) 48px, 56px" className="object-cover scale-110" priority />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-extrabold text-azul-marino tracking-tight leading-none">Al Agua Pato</h1>
                    <Sparkles className="h-5 w-5 text-amarillo hidden sm:block" />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 hidden sm:block">Predio de Eventos</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <a href="https://maps.app.goo.gl/WrCxZMQu7GHACAR67" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border-2 border-azul-marino text-azul-marino hover:bg-azul-marino hover:text-white transition-all duration-200 font-bold text-xs md:text-sm rounded-full shadow-sm hover:shadow-md active:scale-95">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Ver en Maps</span>
                  <span className="sm:hidden">Ubicación</span>
                </a>

                <button onClick={scrollToReserva} className="hidden md:flex items-center gap-2 px-5 py-2 bg-azul-marino text-white hover:bg-azul-marino/90 transition-all duration-200 font-bold text-sm rounded-full shadow-md hover:shadow-lg active:scale-95">
                  <Sparkles className="h-4 w-4 text-amarillo" />
                  Reservar Fecha
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="relative pt-20 pb-20 md:pt-32 md:pb-28 text-center px-4 overflow-hidden min-h-[85vh] flex flex-col justify-center">
          <video autoPlay loop muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover z-0" poster="/logo-circular.png" >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#081524]/60 z-10 mix-blend-multiply" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

          <div className="relative z-20 max-w-5xl mx-auto space-y-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white font-black text-sm uppercase tracking-widest">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amarillo opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amarillo"></span>
              </span>
              ¡Agenda 2026 Abierta!
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-black text-white tracking-tighter leading-[1.05] drop-shadow-lg">
                Cada evento merece <br className="hidden md:block" />
                <span className="relative inline-block mt-2">
                  <span className="absolute -inset-2 bg-gradient-to-r from-rosa via-amarillo to-azul-claro blur-2xl opacity-50"></span>
                  <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-rosa via-naranja to-amarillo drop-shadow-sm">
                    magia
                  </span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto text-balance font-medium leading-relaxed drop-shadow-md">
                <strong className="text-white font-extrabold">"¡Al agua pato!"</strong> Recrea momentos únicos e inolvidables, donde la diversión es la principal protagonista.
              </p>
            </div>

            <div className="max-w-xl mx-auto relative group mt-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-azul-claro via-lavanda to-rosa rounded-[2rem] blur opacity-40 group-hover:opacity-70 transition duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-xl ring-1 ring-white/20 rounded-[2rem] p-6 md:p-8 text-left flex items-start sm:items-center gap-5 shadow-2xl overflow-hidden">
                <Sparkles className="absolute -top-4 -left-4 w-12 h-12 text-amarillo opacity-30 rotate-12" />
                <div className="relative z-10 bg-gradient-to-br from-amarillo to-naranja p-4 rounded-2xl shrink-0 shadow-inner">
                  <PartyPopper className="w-8 h-8 text-white" />
                </div>
                <div className="relative z-10">
                  <h4 className="font-black text-white mb-1.5 text-lg md:text-xl drop-shadow-md">¡Se viene algo <span className="text-rosa">increíble!</span> 🚀</h4>
                  <p className="text-sm md:text-base text-white/80 leading-relaxed font-medium">
                    Muy pronto estrenamos un nuevo espacio que te hará <strong className="text-amarillo font-bold">saltar de diversión</strong>... ¿Estás preparado para lo que se viene?
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-8">
              <div className="relative inline-block w-full sm:w-auto px-4 sm:px-0">
                <div className="relative inline-block w-full sm:w-fit">
                  <div className="absolute -inset-x-2 -top-1 -bottom-4 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-xl opacity-70 animate-pulse"></div>
                  <Button 
                    onClick={scrollToGaleria}
                    className="group w-full sm:w-auto relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-lg h-20 px-12 rounded-full border border-white/40 shadow-xl active:scale-95 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100"></span>
                    <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-wider animate-bounce mt-1">
                      ¡Conocenos! <ArrowDown className="h-6 w-6 text-azul-marino" />
                    </span>
                  </Button>
                </div>
              </div>

              <div className="max-w-md mx-auto flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-500 w-full sm:w-auto text-left sm:text-center">
                <div className="bg-rosa/20 p-2.5 rounded-full shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5 text-rosa animate-pulse" />
                </div>
                <p className="text-sm md:text-base font-bold text-white leading-tight drop-shadow-md">
                  ¡Con tu reserva te <strong className="text-rosa font-black tracking-tight">regalamos</strong> la <strong className="text-amarillo font-black">Invitación Digital Personalizada</strong>! 🎁
                </p>
              </div>
            </div>
          </div>
        </section>

        <div id="galeria">
          <PhotoGallery />
        </div>

        <section className="py-16 md:py-24 bg-azul-claro/5 border-b border-border/50 overflow-hidden">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col items-center text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-black text-azul-marino mb-6">Lo que dicen las familias</h3>
              
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-800">4.9</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-5 h-5 fill-[#FBBC05] text-[#FBBC05]" />)}
                  </div>
                </div>
                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  Basado en reseñas en 
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto md:grid md:grid-cols-4 snap-x snap-mandatory gap-5 pb-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { nombre: "Laura G.", tiempo: "Hace 2 semanas", texto: "Festejamos los 5 de Mateo y salió todo perfecto. El predio es hermoso, súper limpio y el parque acuático es genial. ¡Los chicos no pararon de jugar!", color: "bg-rosa text-white" },
                { nombre: "Martín P.", tiempo: "Hace 1 mes", texto: "Excelente atención de principio a fin. El show del Robot LED fue una locura, todos los invitados quedaron alucinados. Cero estrés para nosotros.", color: "bg-azul-claro text-white" },
                { nombre: "Sabrina V.", tiempo: "Hace 3 meses", texto: "Súper recomendable. Las instalaciones, la pileta y los juegos son de 10. Los chicos se divirtieron toda la tarde y nosotros estuvimos súper cómodos.", color: "bg-lavanda text-white" },
                { nombre: "Julieta F.", tiempo: "Hace 4 meses", texto: "El mejor lugar al que fuimos. La ambientación es soñada y el pelotero es gigante. Estuvimos súper cómodos y nos atendieron como reyes.", color: "bg-amarillo text-azul-marino" }
              ].map((review, i) => (
                <div key={i} className="min-w-[85%] sm:min-w-[60%] md:min-w-0 snap-center bg-white p-6 rounded-3xl shadow-sm border border-border/50 relative flex flex-col hover:-translate-y-1 transition-transform duration-300">
                  <svg className="absolute top-6 right-6 w-5 h-5 opacity-70" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${review.color}`}>
                      {review.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{review.nombre}</p>
                      <p className="text-xs text-muted-foreground font-medium">{review.tiempo}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />)}
                  </div>
                  
                  <p className="text-[15px] text-slate-700 leading-relaxed font-medium">"{review.texto}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="servicios" className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black text-azul-marino mb-4 flex flex-col md:flex-row items-center justify-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-verde" /> ¿Qué incluye tu evento?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-balance font-medium">Todo está pensado para que disfruten al máximo sin preocuparse por nada.</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <ServiciosIncluidos />
          </div>
        </div>

        <section className="bg-azul-marino py-20 md:py-28 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lavanda/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-azul-claro/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-rosa font-black tracking-widest uppercase text-sm mb-3 block drop-shadow-md">Personalizá tu evento</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 flex flex-col md:flex-row items-center justify-center gap-3">
                <Wand2 className="h-10 w-10 text-lavanda drop-shadow-lg" /> Magia a la Carta
              </h2>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto text-balance font-medium">
                Elegí entre nuestras increíbles opciones adicionales para llevar tu fiesta al siguiente nivel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[220px]">
              
              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 md:col-span-2 row-span-2 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/robot.jpg')}
              >
                <Image src="/extras/robot.jpg" alt="Robot LED" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-azul-marino via-azul-marino/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-amarillo text-azul-marino text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block shadow-lg shadow-amarillo/20">El más pedido</span>
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-md">Show Robot LED</h3>
                  <p className="text-white/80 text-sm md:text-lg font-medium line-clamp-2">Luces, color y pura energía para hacer bailar a todos los invitados.</p>
                </div>
              </div>

              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 row-span-1 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/zancos.jpg')}
              >
                <Image src="/extras/zancos.jpg" alt="Zancos LED" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-lavanda/90 via-lavanda/30 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-black text-white mb-1 drop-shadow-md">Zancos LED</h3>
                  <p className="text-white/80 text-sm font-medium">Diversión de altura.</p>
                </div>
              </div>

              <div 
                className="relative group overflow-hidden rounded-[2rem] col-span-1 row-span-1 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-300 cursor-zoom-in"
                onClick={() => setSelectedImage('/extras/personajes.jpg')}
              >
                <Image src="/extras/personajes.jpg" alt="Personajes" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-rosa/90 via-rosa/30 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-black text-white mb-1 drop-shadow-md">Personajes</h3>
                  <p className="text-white/80 text-sm font-medium">Elegí el favorito del cumpleañero.</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl md:text-5xl font-black text-azul-marino mb-20">El camino a la fiesta perfecta</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-1.5 bg-gradient-to-r from-azul-claro/30 to-rosa/30 rounded-full" />
            {[
              { n: '1', t: 'Explorá', d: 'Conocé nuestro increíble predio.', c: 'from-azul-claro to-blue-400' },
              { n: '2', t: 'Personalizá', d: 'Elegí tu fecha y sumá tus extras.', c: 'from-lavanda to-purple-400' },
              { n: '3', t: '¡A disfrutar!', d: 'Aboná la seña y recibí tu invitación.', c: 'from-rosa to-pink-400' },
            ].map((s, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center group">
                <div className={`w-24 h-24 bg-gradient-to-br ${s.c} rounded-full shadow-lg flex items-center justify-center border-4 border-white mb-6 transition-transform group-hover:-translate-y-2`}>
                  <span className="text-4xl font-black text-white">{s.n}</span>
                </div>
                <h4 className="text-2xl font-black text-azul-marino mb-2">{s.t}</h4>
                <p className="text-muted-foreground font-medium max-w-[250px]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="py-20 bg-slate-50 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-azul-claro/10 text-azul-claro font-bold text-xs uppercase tracking-widest mb-4">
                <HelpCircle className="w-4 h-4" /> Dudas Frecuentes
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-azul-marino">Todo lo que necesitas saber</h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {[
                { q: "¿Con cuánta anticipación debo reservar?", a: "Recomendamos reservar con al menos 2 o 3 meses de anticipación, especialmente para fines de semana o fechas en temporada alta, para asegurar tu lugar." },
                { q: "¿El salón cuenta con climatización?", a: "Sí, el quincho principal está totalmente cerrado y equipado con aire acondicionado y ventiladores de techo para garantizar la comodidad en cualquier época del año." },
                { q: "¿Qué sucede si llueve el día de mi evento?", a: "¡No te preocupes! Nuestras instalaciones principales son techadas y climatizadas. De todas formas, en caso de lluvia, siempre damos la opción de reprogramar el evento para fechas posteriores disponibles." },
                { q: "¿El salón incluye decoración u ornamentación?", a: "No, el servicio de ornamentación no está incluido. El espacio se entrega limpio y listo para que cada familia pueda traer su propia decoración o contratar a un ambientador para personalizar la fiesta a su gusto." },
                { q: "¿Cómo se confirma la reserva de la fecha?", a: "La fecha se bloquea únicamente con el pago de la seña. Una vez realizada a través de nuestra web, nos envías el comprobante por WhatsApp y ¡listo!, tu lugar está asegurado." }
              ].map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-border/50 rounded-2xl px-6 shadow-sm overflow-hidden">
                  <AccordionTrigger className="hover:no-underline font-bold text-azul-marino text-left py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 font-medium pb-5 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="reserva-final" ref={reservaFinalRef} className="relative py-24 md:py-32 overflow-hidden bg-azul-marino text-white flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 z-0" />
          <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-amarillo/30 blur-[120px] rounded-full z-0" />
          <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] bg-rosa/30 blur-[120px] rounded-full z-0" />
          
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
            
            <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-10 shadow-lg">
              <ShieldCheck className="w-5 h-5 text-verde" />
              <span className="text-sm font-bold tracking-wide">Reserva online 100% segura</span>
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-12 md:mb-16 tracking-tight drop-shadow-lg flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full">
              <span>¿Listos para vivir la</span>
              <span className="relative inline-flex justify-center mt-1 sm:mt-0">
                <span className="absolute -inset-2 bg-gradient-to-r from-rosa via-amarillo to-azul-claro blur-2xl opacity-50 animate-pulse"></span>
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-rosa via-naranja to-amarillo drop-shadow-sm">
                  magia?
                </span>
              </span>
            </h2>
            
            <div className="flex flex-col items-center justify-center mb-12 w-full">
                <p className="text-2xl md:text-4xl font-bold leading-tight drop-shadow-md text-center max-w-3xl mx-auto flex flex-col items-center justify-center">
                  Nuestro espacio te ofrece una oferta única que te hará sentir que
                  <span className="relative inline-flex justify-center whitespace-nowrap mt-5 md:mt-8">
                     <span className="absolute -inset-2 bg-gradient-to-r from-amarillo to-naranja blur-xl md:blur-2xl opacity-30 md:opacity-50 animate-pulse rounded-full"></span>
                     <strong className="relative text-transparent bg-clip-text bg-gradient-to-r from-amarillo to-naranja font-black text-3xl md:text-5xl lg:text-6xl tracking-tighter shimmer-text">
                      "la magia se vive aquí"
                     </strong>
                  </span>
                </p>
                
                <div className="flex flex-col items-center justify-center gap-4 text-lg md:text-xl text-white/90 font-medium mt-10 md:mt-14 max-w-2xl mx-auto">
                  <p className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center leading-relaxed">
                    <span>Consulta disponibilidad,</span>
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rosa/20 border border-rosa/50 text-white font-black text-sm md:text-base shadow-inner shrink-0">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rosa opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rosa"></span>
                      </span>
                      cupos limitados
                    </span>
                  </p>
                  <p className="text-center text-white/80">
                    No te quedes sin tu fecha y asegura tu mejor experiencia.
                  </p>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-center w-full sm:w-auto mt-8 md:mt-12 min-h-[140px]">
               
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-azul-marino text-xs md:text-sm font-extrabold px-5 py-2.5 rounded-full shadow-2xl animate-bounce z-20 border-2 border-rosa/30 flex items-center justify-center">
                 🎁 ¡Incluye Invitación Digital Personalizada!
               </div>

               <div className="absolute -inset-x-6 -top-2 -bottom-6 bg-gradient-to-r from-amarillo via-naranja to-rosa rounded-full blur-3xl opacity-80 animate-pulse pointer-events-none" />
               
               {!showEventMenu ? (
                 <div className="relative flex flex-col items-center justify-center w-full z-10 animate-in fade-in zoom-in duration-300">
                   <Button 
                     onClick={() => setShowEventMenu(true)}
                     className="group w-[90%] sm:w-auto min-w-[320px] relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-[16px] sm:text-xl h-auto min-h-[72px] py-4 px-8 rounded-full border border-white/40 shadow-2xl active:scale-95 transition-all duration-300 overflow-hidden"
                   >
                     <span className="absolute inset-0 bg-white/30 scale-0 rounded-full group-hover:scale-125 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
                     <span className="relative flex items-center justify-center gap-3 uppercase tracking-wide text-center leading-tight">
                       Elige tu evento <ChevronDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                     </span>
                   </Button>
                 </div>
               ) : (
                 <div className="relative flex flex-col items-center gap-6 w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full items-center justify-center">
                     <Link href="/reservar" className="w-[90%] sm:w-auto min-w-[220px]">
                       <Button className="group w-full relative bg-gradient-to-r from-amarillo to-naranja text-azul-marino font-extrabold text-[15px] sm:text-lg h-auto min-h-[64px] py-3 px-6 rounded-full border border-white/40 shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300">
                         <PartyPopper className="w-5 h-5 mr-2" /> Cumple
                       </Button>
                     </Link>
                     
                     <Link href="/egresaditos" className="w-[90%] sm:w-auto min-w-[220px]">
                       <Button className="group w-full relative bg-gradient-to-r from-lavanda to-rosa text-white font-extrabold text-[15px] sm:text-lg h-auto min-h-[64px] py-3 px-6 rounded-full border border-white/40 shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300">
                         <GraduationCap className="w-6 h-6 mr-2" /> Egresaditos
                       </Button>
                     </Link>
                     
                     <div className="w-[90%] sm:w-auto min-w-[220px]">
                       <Button 
                         onClick={() => window.alert("¡Próximamente habilitaremos la opción para eventos escolares!")}
                         className="group w-full relative bg-gradient-to-r from-blue-400 to-cyan-400 text-white font-extrabold text-[15px] sm:text-lg h-auto min-h-[64px] py-3 px-6 rounded-full border border-white/40 shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300"
                       >
                         <School className="w-5 h-5 mr-2" /> Escolar
                       </Button>
                     </div>
                   </div>
                   
                   <button 
                     onClick={() => setShowEventMenu(false)}
                     className="text-white/60 hover:text-white text-sm font-bold flex items-center gap-1 transition-colors"
                   >
                     <X className="w-4 h-4" /> Cancelar
                   </button>
                 </div>
               )}
            </div>
          </div>
        </section>
      </div>

      <footer className="bg-[#040A12] text-white py-12 relative z-10 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-4">
               <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-transparent">
                  <Image src="/logo-circular.png" alt="Logo Al Agua Pato" fill sizes="48px" className="object-cover scale-110" />
               </div>
               <div className="flex flex-col text-left">
                 <h4 className="text-lg font-bold tracking-wide text-white">Al Agua Pato</h4>
                 <p className="text-[11px] text-white/50 uppercase tracking-widest font-semibold">Predio de Eventos</p>
               </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {footerLinks.map((link) => (
                <Link key={link.name} href={link.href} className={`text-sm font-medium transition-colors ${link.name === 'Egresaditos' ? 'text-rosa hover:text-lavanda font-bold' : 'text-white/60 hover:text-amarillo'}`}>
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6">
               <a href="https://maps.app.goo.gl/WrCxZMQu7GHACAR67" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/60 hover:text-amarillo transition-colors text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Santiago del Estero</span>
               </a>
               <a href="tel:5493854470103" className="flex items-center gap-2 text-white/60 hover:text-amarillo transition-colors text-sm font-medium">
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Contacto</span>
               </a>
               
               {/* NUEVOS ICONOS SOCIALES */}
               <div className="flex items-center gap-4 border-l border-white/20 pl-6 ml-2">
                 <a href="https://www.instagram.com/alaguapato.sgo/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-rosa transition-colors" aria-label="Instagram">
                   <Instagram className="w-5 h-5" />
                 </a>
                 <a href="https://www.facebook.com/profile.php?id=100085114470943" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-blue-400 transition-colors" aria-label="Facebook">
                   <Facebook className="w-5 h-5" />
                 </a>
               </div>
            </div>

          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
             <p className="text-xs text-white/40 font-medium text-center sm:text-left">
               © {new Date().getFullYear()} Al Agua Pato. Todos los derechos reservados.
             </p>
             <p className="text-xs text-white/30 font-medium text-center sm:text-right flex items-center gap-1">
               Diseñado con <span className="text-rosa">❤</span> por Ignacio
             </p>
          </div>
        </div>
      </footer>

      <div className={`fixed bottom-4 left-4 right-4 z-50 lg:hidden transition-all duration-500 ease-in-out ${showFloatingButton ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
         <Button 
           onClick={scrollToReserva}
           className="w-full h-14 bg-azul-marino hover:bg-azul-marino/90 text-white font-extrabold text-base rounded-full shadow-[0_10px_30px_rgba(12,35,60,0.5)] border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden relative group"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] animate-[shimmer_2s_infinite]" />
           <Sparkles className="w-5 h-5 text-amarillo" /> Reservar Fecha
         </Button>
      </div>

      <a 
        href="https://wa.me/5493854470103?text=Hola!%20Estoy%20viendo%20la%20página%20web%20y%20tengo%20una%20consulta%20sobre%20el%20salón..." 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 z-[60] bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 lg:p-4 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all hover:-translate-y-1 active:scale-95 group flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6 lg:w-7 lg:h-7" />
        <span className="absolute right-full mr-4 bg-white text-slate-800 text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap hidden lg:block">
          ¿Tenés dudas? Escribinos
        </span>
      </a>

      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-50">
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full max-w-5xl h-[70vh] md:h-[80vh]">
            <Image 
              src={selectedImage} 
              alt="Vista previa" 
              fill 
              sizes="100vw"
              className="object-contain animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </main>
  )
}