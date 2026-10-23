import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PieLegal } from "@/components/pie-legal"

/** Marco común de /condiciones y /privacidad. */
export function PaginaLegal({ titulo, bajada, children }: { titulo: string; bajada?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/30 font-sans">
      <header className="bg-white border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 min-h-11 text-azul-marino font-bold hover:text-azul-marino/80 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Volver al inicio
          </Link>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-azul-marino mb-2">{titulo}</h1>
          {bajada && <p className="text-muted-foreground mb-8">{bajada}</p>}
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700">{children}</div>
        </div>
      </main>
      <PieLegal />
    </div>
  )
}

export function SeccionLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-border/50 p-5 md:p-6 shadow-sm">
      <h2 className="text-base font-extrabold text-azul-marino mb-2">{titulo}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  )
}
