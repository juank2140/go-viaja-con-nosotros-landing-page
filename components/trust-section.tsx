import { ShieldCheck, CreditCard, Trophy, Users, BadgeCheck, GraduationCap, Compass, AtSign } from "lucide-react"

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
  { icon: Users, value: "+10 años", label: "Organizando viajes" },
  { icon: GraduationCap, value: "+5.000", label: "Viajeros felices" },
  { icon: BadgeCheck, value: "100%", label: "Viajes cumplidos" },
]

const brands = [
  {
    name: "Summer Class",
    handle: "@summerclass11",
    url: "https://www.instagram.com/summerclass11/",
    icon: GraduationCap,
    image: "/images/group-travel.png",
    desc: "Excursiones para bachilleres por San Andrés y la Costa Atlántica. Creamos recuerdos inolvidables para cientos de promociones de grado.",
  },
  {
    name: "Pajoy Tours",
    handle: "@pajoytours",
    url: "https://www.instagram.com/pajoytours/",
    icon: Compass,
    image: "/images/costa-atlantica.png",
    desc: "Planes y paquetes turísticos nacionales e internacionales con acompañamiento de principio a fin. Tu próximo destino en buenas manos.",
  },
]

export function TrustSection() {
  return (
    <section id="confianza" className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="glow-gold pointer-events-none absolute -left-32 top-10 size-96 opacity-50" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Nuestra trayectoria
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Agencias con <span className="text-gradient-gold">experiencia real</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            No somos nuevos en esto. Detrás de este sorteo hay años llevando viajeros por toda
            Colombia y el exterior. Síguenos y conoce nuestro recorrido.
          </p>
        </div>

        {/* Brand trajectory */}
        <div className="grid gap-5 md:grid-cols-2">
          {brands.map((b) => (
            <a
              key={b.name}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-3xl border border-gold/25 shadow-xl shadow-black/30"
            >
              <img
                src={b.image || "/placeholder.svg"}
                alt={`Viajes organizados por ${b.name}`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
              <div className="relative flex h-full flex-col justify-end gap-3 p-7 pt-40">
                <span className="flex size-12 items-center justify-center rounded-xl bg-gold text-gold-foreground shadow-lg shadow-gold/30">
                  <b.icon className="size-6" />
                </span>
                <h3 className="font-heading text-2xl font-semibold text-foreground">{b.name}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
                <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-card/60 px-3 py-1.5 text-sm font-medium text-gold backdrop-blur transition-colors group-hover:bg-gold group-hover:text-gold-foreground">
                  <AtSign className="size-4" />
                  {b.handle}
                </span>
              </div>
            </a>
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

        {/* Pillars */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
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
      </div>
    </section>
  )
}
