import Image from "next/image"
import { Star, PartyPopper, Calendar, Gift, Banknote, MapPin, Plane } from "lucide-react"

export function Prizes() {
  return (
    <section id="premios" className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="glow-gold pointer-events-none absolute -right-32 top-0 size-96 opacity-40" />
      <div className="glow-gold pointer-events-none absolute -left-24 bottom-20 size-80 opacity-25" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Lo que puedes ganar
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Dos premios, <span className="text-gradient-gold">una sola boleta</span>
          </h2>
        </div>

        {/* Premio Mayor */}
        <article className="group relative overflow-hidden rounded-3xl border border-gold/25 shadow-2xl shadow-black/40">
          {/* full-bleed background image */}
          <Image
            src="/images/hotel-riu-cancun.png"
            alt="Hotel RIU 4 estrellas en Cancún con piscina frente al mar"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          <div className="relative grid min-h-[26rem] md:grid-cols-2">
            <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-foreground shadow-lg shadow-gold/30">
                <Star className="size-4 fill-gold-foreground" /> Premio Mayor
              </span>
              <h3 className="font-heading text-4xl font-semibold text-foreground sm:text-5xl">
                Viaje a <span className="text-gradient-gold">Cancún</span>, México
              </h3>
              <ul className="flex flex-col gap-3.5 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <Gift className="size-4" />
                  </span>
                  <span className="pt-1">Para 2 personas — Hotel RIU 4★ todo incluido</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <Banknote className="size-4" />
                  </span>
                  <span className="pt-1">
                    <span className="font-semibold text-foreground">$3.000.000 COP</span> en efectivo
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
                    <Calendar className="size-4" />
                  </span>
                  <span className="pt-1">Sorteo: 29 de agosto de 2026</span>
                </li>
              </ul>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gold">
                <Plane className="size-4" />
                Todo incluido · Vuelos + hotel + dinero
              </div>
            </div>
            <div className="hidden md:block" />
          </div>
        </article>

        {/* Premio Anticipado */}
        <article className="group relative mt-6 overflow-hidden rounded-3xl border border-available/30 shadow-xl shadow-black/30">
          <Image
            src="/images/cartagena.png"
            alt="Calles coloniales de Cartagena de Indias"
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />

          <div className="relative flex flex-col gap-4 p-8 sm:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-available px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-background shadow-lg shadow-available/30">
              <PartyPopper className="size-4" /> Premio Anticipado
            </span>
            <h3 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Viaje a Cartagena de Indias
            </h3>
            <p className="max-w-md text-muted-foreground">
              Para 2 personas — Hotel Dubai o similar. ¡Tu número también participa por este premio
              antes del sorteo mayor!
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1.5 text-available">
                <MapPin className="size-4" /> Ciudad amurallada
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-4 text-available" /> Sorteo: 15 de agosto de 2026
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
