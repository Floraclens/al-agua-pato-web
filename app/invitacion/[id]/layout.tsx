import type { Metadata } from 'next'

// Genérico a propósito: esta ruta es dinámica y los datos de la reserva se
// cargan client-side (fetch por token). No duplicamos esa consulta acá solo
// para personalizar el título, y así evitamos poner datos personales en la
// metadata (que queda expuesta en el HTML incluso con noindex).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  return {
    title: 'Tu Invitación Digital | Al Agua Pato',
    description: 'Diseñá y compartí la invitación digital de tu evento en Al Agua Pato.',
    alternates: {
      canonical: `/invitacion/${id}`,
    },
    openGraph: {
      title: 'Tu Invitación Digital | Al Agua Pato',
      description: 'Diseñá y compartí la invitación digital de tu evento en Al Agua Pato.',
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default function InvitacionLayout({ children }: { children: React.ReactNode }) {
  return children
}
