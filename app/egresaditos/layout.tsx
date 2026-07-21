import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fiesta de Egresados | Al Agua Pato — Santiago del Estero',
  description: 'Organizá la fiesta de egresados de tu colegio en Al Agua Pato: parque acuático, shows LED y todo incluido. Reservá tu fecha de noviembre o diciembre online.',
  alternates: {
    canonical: '/egresaditos',
  },
  openGraph: {
    title: 'Fiesta de Egresados | Al Agua Pato',
    description: 'Organizá la fiesta de egresados de tu colegio: parque acuático, shows LED y todo incluido.',
  },
}

export default function EgresaditosLayout({ children }: { children: React.ReactNode }) {
  return children
}
