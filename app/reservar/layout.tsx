import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reservá tu Fecha | Al Agua Pato — Fiestas Infantiles en Santiago del Estero',
  description: 'Elegí la fecha y el turno para tu evento, sumá extras y reservá online con seña. Precios y disponibilidad en tiempo real en Al Agua Pato.',
  alternates: {
    canonical: '/reservar',
  },
  openGraph: {
    title: 'Reservá tu Fecha | Al Agua Pato',
    description: 'Elegí la fecha y el turno para tu evento, sumá extras y reservá online con seña.',
  },
}

export default function ReservarLayout({ children }: { children: React.ReactNode }) {
  return children
}
