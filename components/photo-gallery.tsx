"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Pause, ZoomIn } from "lucide-react"

export function PhotoGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0) 
  const [isPaused, setIsPaused] = useState(false)

  // -------------------------------------------------------------------------
  // 📸 CONFIGURACIÓN DINÁMICA: 
  // Solo cambia este número cuando agregues fotos a /public/galeria/
  // Asegurate que se llamen 1.jpg, 2.jpg, 3.jpg, etc.
  const CANTIDAD_TOTAL_FOTOS = 24
  // -------------------------------------------------------------------------
  
  const images = Array.from({ length: CANTIDAD_TOTAL_FOTOS }, (_, i) => ({
    src: `/galeria/${i + 1}.jpg`,
    alt: `Predio Al Agua Pato - Foto ${i + 1}`,
  }))

  // 🔄 AUTOPLAY MÁGICO: Cambia las fotos de las ranuras pequeñas de PC cada 3.5 segundos
  useEffect(() => {
    if (selectedIndex !== null || isPaused || images.length <= 1) return 
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3500);

    return () => clearInterval(timer);
  }, [selectedIndex, isPaused, images.length]);

  // Manejo de teclado para PC (Lightbox)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return
      if (e.key === "ArrowRight") handleNext(e as any)
      if (e.key === "ArrowLeft") handlePrev(e as any)
      if (e.key === "Escape") setSelectedIndex(null)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIndex])

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1)
    }
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1)
    }
  }

  // --- LÓGICA DE ÍNDICES PARA ESCRITORIO ---
  const dynLength = Math.max(1, images.length - 1); // Fotos disponibles para rotar (todas menos la 1)
  
  const i0 = 0; // FIJA: Foto 1 siempre a la izquierda
  const safeI1 = images.length > 1 ? 1 + ((currentIndex) % dynLength) : 0;
  const safeI2 = images.length > 2 ? 1 + ((currentIndex + 1) % dynLength) : 0;
  const safeI3 = images.length > 3 ? 1 + ((currentIndex + 2) % dynLength) : 0;

  return (
    <>
      <section className="w-full max-w-7xl mx-auto px-4 pt-6 pb-2 relative group/gallery">
        
        {/* 📱 VISTA MÓVIL (Foto 1 Fija + Miniaturas Scrollables) */}
        <div className="flex md:hidden flex-col gap-2 pb-4">
          {/* Foto Principal Fija (La 1) */}
          <div 
            className="relative w-full h-[240px] sm:h-[300px] rounded-2xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform cursor-pointer group/mob"
            onClick={() => setSelectedIndex(0)}
          >
            {images[0] && (
              <Image 
                src={images[0].src} 
                alt={images[0].alt} 
                fill 
                className="object-cover transition-transform duration-700 group-hover/mob:scale-105" 
                priority 
                sizes="(max-width: 768px) 100vw, 50vw" 
              />
            )}
            <div className="absolute inset-0 bg-black/10 transition-colors" />
            <div className="absolute top-3 left-3 bg-amarillo/20 backdrop-blur-md px-3 py-1 rounded-full text-amarillo text-xs font-bold border border-amarillo/30 tracking-wider">
              Destacado
            </div>
            <ZoomIn className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white opacity-80 drop-shadow-md" />
          </div>
          
          {/* Fila de Miniaturas (De la 2 en adelante) */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.slice(1).map((img, index) => {
              const actualIndex = index + 1; // El índice real en el array principal
              return (
                <div 
                  key={actualIndex} 
                  className="relative min-w-[40%] h-[100px] snap-center rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform duration-300 cursor-pointer"
                  onClick={() => setSelectedIndex(actualIndex)}
                >
                  <Image 
                    src={img.src} 
                    alt={img.alt} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 40vw" 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                </div>
              );
            })}
          </div>
        </div>

        {/* 💻 VISTA ESCRITORIO (Grilla de 4 Dinámica - Foto 1 Fija) */}
        <div 
          className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[480px] relative"
          onMouseEnter={() => setIsPaused(true)} // Pausa autoplay
          onMouseLeave={() => setIsPaused(false)} // Resume autoplay
        >
          {/* Foto Principal Izquierda - FIJA */}
          <div className="col-span-2 row-span-2 relative w-full h-full rounded-l-3xl overflow-hidden group/item cursor-pointer shadow-sm border-r-2 border-white/5" onClick={() => setSelectedIndex(i0)}>
            {images[i0] && (
              <Image 
                src={images[i0].src} 
                alt={images[i0].alt} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover/item:scale-105" 
                priority 
                sizes="(max-width: 1200px) 50vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover/item:bg-black/5 transition-colors duration-300" />
            <div className="absolute top-4 left-4 bg-amarillo/10 backdrop-blur-md px-3 py-1 rounded-full text-amarillo text-xs font-bold border border-amarillo/30 tracking-wider">
              Destacado
            </div>
            
            {/* Indicador de Pausa al hover general */}
            <div className={`absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/20 transition-opacity duration-300 ${isPaused ? 'opacity-100' : 'opacity-0'}`}>
              <Pause className="w-3 h-3 text-amarillo" /> Pausado
            </div>

            <ZoomIn className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Foto Superior Derecha (Horizontal Rotativa) */}
          <div className="col-span-2 row-span-1 relative w-full h-full rounded-tr-3xl overflow-hidden group/item cursor-pointer shadow-sm" onClick={() => setSelectedIndex(safeI1)}>
            {images[safeI1] && (
              <Image 
                key={safeI1} // Fuerza la animación suave al cambiar
                src={images[safeI1].src} 
                alt={images[safeI1].alt} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover/item:scale-105 animate-in fade-in" 
                sizes="(max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover/item:bg-black/5 transition-colors duration-300" />
          </div>

          {/* Foto Inferior Medio (Cuadrada Rotativa) */}
          <div className="col-span-1 row-span-1 relative w-full h-full overflow-hidden group/item cursor-pointer shadow-sm" onClick={() => setSelectedIndex(safeI2)}>
            {images[safeI2] && (
              <Image 
                key={safeI2}
                src={images[safeI2].src} 
                alt={images[safeI2].alt} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover/item:scale-105 animate-in fade-in" 
                sizes="(max-width: 1200px) 25vw, 20vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover/item:bg-black/5 transition-colors duration-300" />
          </div>

          {/* Foto Inferior Derecha (Cuadrada Rotativa con Overlay de +X) */}
          <div className="col-span-1 row-span-1 relative w-full h-full rounded-br-3xl overflow-hidden group/item cursor-pointer shadow-sm" onClick={() => setSelectedIndex(safeI3)}>
            {images[safeI3] && (
              <Image 
                key={safeI3}
                src={images[safeI3].src} 
                alt={images[safeI3].alt} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover/item:scale-105 animate-in fade-in" 
                sizes="(max-width: 1200px) 25vw, 20vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover/item:bg-black/5 transition-colors duration-300" />
            
            {images.length > 4 && (
              <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center transition-all duration-300 group-hover/item:bg-black/70 backdrop-blur-[2px]">
                <span className="text-white font-bold text-3xl tracking-wider drop-shadow-md">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🔍 VISOR DE FOTOS (LIGHTBOX) - ALTA CALIDAD PARA EL ZOOM */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300 overscroll-none"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
            aria-label="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            className="absolute left-2 sm:left-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={handlePrev}
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="relative w-full max-w-5xl h-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={images[selectedIndex].src} 
              alt={images[selectedIndex].alt} 
              fill 
              className="object-contain animate-in fade-in zoom-in-95 duration-300" 
              key={selectedIndex}
              quality={95} // ¡ACÁ ESTÁ LA MAGIA! Calidad casi perfecta cuando hacen zoom
              sizes="100vw" 
              priority
            />
          </div>

          <button
            className="absolute right-2 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all z-20"
            onClick={handleNext}
            aria-label="Foto siguiente"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 backdrop-blur-md px-5 py-2 rounded-full text-sm font-bold tracking-widest z-20 border border-white/10 shadow-xl">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}