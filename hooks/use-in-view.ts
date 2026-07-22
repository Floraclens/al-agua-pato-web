"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Detecta cuándo un elemento entra en un área expandida alrededor del viewport
 * (rootMargin), para poder empezar a cargar contenido pesado (imágenes lazy)
 * con anticipación en vez de esperar a que el elemento sea visible de verdad.
 * Se desconecta apenas entra una vez: no hace falta seguir observando después.
 */
export function useInView<T extends Element>(rootMargin = "600px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return { ref, inView }
}
