import { ShieldCheck, CreditCard, Trophy, Users, BadgeCheck } from "lucide-react"

const pillars = [
  {
    icon: ShieldCheck,
    title: "Sorteo verificable",
    desc: "Jugamos con las últimas 4 cifras de la Lotería de Boyacá. Resultado público y transparente.",
  },
  {
    icon: CreditCard,
    title: "Pagos protegidos",
    desc: "Procesamos con Bold: tarjeta, PSE y Nequi con cifrado bancario. Nunca guardamos tus datos.",
  },
  {
    icon: Trophy,
    title: "Premios reales",
    desc: "Viajes todo incluido y dinero en efectivo. Entregamos lo que prometemos, sin letra pequeña.",
  },
]

const trustStats = [
  { icon: Users, value: "+1.200", label: "Participantes felices" },
  { icon: Trophy, value: "100%", label: "Premios entregados" },
  { icon: BadgeCheck, value: "4.9/5", label: "Calificación promedio" },
]

const testimonials = [
  {
    quote:
      "Compré mi número sin pensarlo y el pago fue súper rápido y seguro. ¡Todo muy serio y organizado!",
    name: "Laura M.",
    city: "Medellín",
  },
  {
    quote:
      "Me encantó la transparencia del sorteo con la Lotería de Boyacá. Se nota que es confiable.",
    name: "Andrés P.",
    city: "Bogotá",
  },
  {
    quote:
      "Excelente atención por WhatsApp y resolvieron todas mis dudas. Volveré a participar.",
    name: "Carolina R.",
    city: "Cali",
  },
]

export function TrustSection() {
  return (
    <section id="confianza" className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="glow-gold pointer-events-none absolute -left-32 top-10 size-96 opacity-50" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Confianza y seguridad
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Juega tranquilo, juega seguro
          </h2>
        </div>

        {/* Pillars */}
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="glass group flex flex-col gap-4 rounded-2xl p-7 transition-transform hover:-translate-y-1"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-gold/15 text-gold transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                <p.icon className="size-6" />
              </span>
              <h3 className="font-heading text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </article>
          ))}
        </div>

        {/* Stats bar */}
        <dl className="glass mt-6 grid gap-px overflow-hidden rounded-2xl sm:grid-cols-3">
          {trustStats.map((s) => (
            <div key={s.label} className="flex items-center justify-center gap-3 px-4 py-6">
              <s.icon className="size-7 text-gold" />
              <div className="text-left">
                <dd className="font-heading text-2xl font-semibold text-foreground">{s.value}</dd>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </dt>
              </div>
            </div>
          ))}
        </dl>

        {/* Testimonials */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="glass flex flex-col gap-4 rounded-2xl p-6">
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="size-4 fill-current" aria-hidden="true">
                    <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77 4.8 17.5l.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground">
                {`"${t.quote}"`}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-gold/15 font-heading text-sm font-semibold text-gold">
                  {t.name.charAt(0)}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
