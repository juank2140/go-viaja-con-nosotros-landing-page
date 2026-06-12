import { ShieldCheck, CreditCard, Trophy, Users, BadgeCheck, GraduationCap, Compass, AtSign, Lock, Star, CheckCircle2 } from "lucide-react"

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

// Garantías destacadas — las que eliminan el miedo al pago
const garantias = [
  {
    icon: Lock,
    title: "Pago 100% seguro",
    desc: "Bold procesa tu pago con el mismo cifrado que usan los bancos. Tus datos nunca se almacenan.",
    badge: "Cifrado bancario",
    color: "text-available",
    bg: "bg-available/10 border-available/20",
  },
  {
    icon: Star,
    title: "Sorteo transparente",
    desc: "El resultado lo decide la Lotería de Boyacá — una entidad del Estado. No lo controlamos nosotros.",
    badge: "Entidad oficial",
    color: "text-gold",
    bg: "bg-gold/10 border-gold/20",
  },
  {
    icon: CheckCircle2,
    title: "Premio garantizado",
    desc: "Si ganas, recibes tu premio. Sin excusas. Tenemos 10+ años de viajes cumplidos que lo respaldan.",
    badge: "Historial verificable",
    color: "text-sky-400",
    bg: "bg-sky-400/10 border-sky-400/20",
  },
]

export function TrustSection() {
  return (
    <section id="confianza" className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="glow-gold pointer-events-none absolute -left-32 top-10 size-96 opacity-50" />
      <div className="mx-auto max-w-6xl">

        {/* ── GARANTÍAS ANTI-MIEDO (nuevo — punto 4) ─────────── */}
        <div className="mb-20">
          <div className="mb-10 text-center">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
              Antes de pagar, lee esto
            </span>
            <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl">
              ¿Por qué puedes{" "}
              <span className="text-gradient-gold">confiar tu dinero?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Entendemos que pagar por anticipado genera dudas. Por eso somos completamente transparentes.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {garantias.map((g) => (
              <div
                key={g.title}
                className={`glass group flex flex-col gap-4 rounded-2xl border p-7 transition-transform hover:-translate-y-1 ${g.bg}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`flex size-12 items-center justify-center rounded-xl bg-card/60 ${g.color}`}>
                    <g.icon className="size-6" />
                  </span>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${g.bg} ${g.color}`}>
                    {g.badge}
                  </span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground">{g.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
              </div>
            ))}
          </div>

          {/* Barra de métodos de pago */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-muted-foreground">Pagos aceptados:</span>
            {["💳 Tarjeta crédito", "🏦 Débito", "🇨🇴 PSE", "📱 Nequi", "🔒 Bold"].map((m) => (
              <span
                key={m}
                className="glass rounded-full border border-white/10 px-4 py-1.5 text-xs font-medium text-muted-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* ── TRAYECTORIA ─────────────────────────────────────── */}
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
