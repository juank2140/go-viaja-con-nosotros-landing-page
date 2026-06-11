import { Star, PartyPopper, Calendar, Gift, Banknote } from "lucide-react"

export function Prizes() {
  return (
    <section id="premios" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Lo que puedes ganar
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Dos premios, una sola boleta
          </h2>
        </div>

        {/* Premio Mayor */}
        <article className="glass grid overflow-hidden rounded-3xl md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 p-8 sm:p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
              <Star className="size-4 fill-gold" /> Premio Mayor
            </span>
            <h3 className="font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Viaje a Cancún, México
            </h3>
            <ul className="flex flex-col gap-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Gift className="mt-0.5 size-5 shrink-0 text-gold" />
                Para 2 personas — Hotel RIU 4★ todo incluido
              </li>
              <li className="flex items-start gap-3">
                <Banknote className="mt-0.5 size-5 shrink-0 text-gold" />
                <span className="font-semibold text-foreground">$3.000.000 COP</span> en efectivo
              </li>
              <li className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-5 shrink-0 text-gold" />
                Sorteo: 25 de julio de 2026
              </li>
            </ul>
          </div>
          <div className="relative min-h-64 md:min-h-full">
            <img
              src="/images/hotel-riu-cancun.png"
              alt="Hotel RIU 4 estrellas en Cancún con piscina frente al mar"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card/40 to-transparent" />
          </div>
        </article>

        {/* Premio Anticipado */}
        <article className="glass mt-6 flex flex-col gap-6 overflow-hidden rounded-3xl p-8 sm:flex-row sm:items-center sm:p-10">
          <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-48">
            <img
              src="/images/cartagena.png"
              alt="Calles coloniales de Cartagena de Indias"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-available/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-available">
              <PartyPopper className="size-4" /> Premio Anticipado
            </span>
            <h3 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Viaje a Cartagena de Indias
            </h3>
            <p className="text-muted-foreground">
              Para 2 personas — Hotel Dubai o similar. Sorteo: 11 de julio de 2026.
            </p>
          </div>
        </article>
      </div>
    </section>
  )
}
