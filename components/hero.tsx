import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plane } from "lucide-react"

const stats = [
  { label: "Disponibles", value: "8.742" },
  { label: "Vendidos", value: "1.258" },
  { label: "Por boleta", value: "$25k" },
]

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/cancun-hero.png"
          alt="Playa de Cancún al atardecer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/40" />
      </div>

      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold backdrop-blur">
        Go Viaja Con Nosotros
      </span>

      <h1 className="font-heading text-balance text-5xl font-semibold leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
        Un número, un destino,{" "}
        <span className="italic text-gold">un sueño.</span>
      </h1>

      <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        Compra tu número y participa por un viaje todo incluido a Cancún, México para 2 personas.
        El mundo te espera, nosotros te llevamos.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="#numeros"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 rounded-full bg-gold px-8 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/20 transition-transform hover:scale-[1.03] hover:bg-gold/90",
          )}
        >
          <Plane className="size-5" />
          Comprar mi número
        </a>
        <a
          href="#premios"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 rounded-full border-gold/40 bg-transparent px-8 text-base font-medium text-foreground backdrop-blur transition-colors hover:bg-card/60 hover:text-gold",
          )}
        >
          Ver premios
        </a>
      </div>

      <dl className="glass mt-14 grid w-full max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 px-4 py-6">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</dt>
            <dd className="font-heading text-3xl font-semibold text-gold sm:text-4xl">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
