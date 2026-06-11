"use client"

import { useEffect, useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plane, ShieldCheck, Clock, Sparkles } from "lucide-react"

const stats = [
  { label: "Disponibles", value: "8.742" },
  { label: "Vendidos", value: "1.258" },
  { label: "Por boleta", value: "$25k" },
]

// Próximo sorteo: 11 de julio de 2026
const TARGET = new Date("2026-07-11T20:00:00-05:00").getTime()

function useCountdown() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (now === null) return null
  const diff = Math.max(0, TARGET - now)
  const d = Math.floor(diff / 86400000)
  const h = Math.floor((diff % 86400000) / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return { d, h, m, s }
}

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function Hero() {
  const c = useCountdown()
  const units = c
    ? [
        { label: "Días", value: pad(c.d) },
        { label: "Horas", value: pad(c.h) },
        { label: "Min", value: pad(c.m) },
        { label: "Seg", value: pad(c.s) },
      ]
    : null

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-32 text-center sm:pt-36"
    >
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/cancun-hero.png"
          alt="Playa de Cancún al atardecer"
          className="h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-background/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-background/45" />
      </div>

      {/* decorative floating plane */}
      <div className="pointer-events-none absolute right-[8%] top-[18%] hidden animate-float text-gold/80 lg:block">
        <Plane className="size-10 -rotate-12" />
      </div>

      <img
        src="/images/logo.png"
        alt="Go Viaja Con Nosotros"
        className="animate-rise mb-6 h-24 w-auto drop-shadow-2xl sm:h-32"
      />

      <span className="animate-rise mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-card/40 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-gold backdrop-blur">
        <Sparkles className="size-3.5" />
        Sorteo de viajes 2026
      </span>

      <h1 className="animate-rise font-heading text-balance text-5xl font-semibold leading-[1.05] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
        Un número, un destino,{" "}
        <span className="text-gradient-gold italic">un sueño.</span>
      </h1>

      <p className="animate-rise mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        Compra tu número y participa por un viaje todo incluido a Cancún, México para 2 personas.
        El mundo te espera, nosotros te llevamos.
      </p>

      {/* Countdown */}
      <div className="animate-rise mt-8 flex flex-col items-center gap-3">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Clock className="size-4 text-gold" />
          Próximo sorteo en
        </span>
        <div className="flex items-center gap-2 sm:gap-3">
          {units
            ? units.map((u) => (
                <div
                  key={u.label}
                  className="glass flex min-w-16 flex-col items-center rounded-xl px-3 py-2.5 sm:min-w-20"
                >
                  <span className="font-heading text-2xl font-semibold tabular-nums text-gold sm:text-3xl">
                    {u.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {u.label}
                  </span>
                </div>
              ))
            : ["Días", "Horas", "Min", "Seg"].map((label) => (
                <div
                  key={label}
                  className="glass flex min-w-16 flex-col items-center rounded-xl px-3 py-2.5 sm:min-w-20"
                >
                  <span className="font-heading text-2xl font-semibold text-gold sm:text-3xl">
                    --
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
        </div>
      </div>

      <div className="animate-rise mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="#numeros"
          className={cn(
            buttonVariants({ size: "lg" }),
            "shine relative h-12 overflow-hidden rounded-full bg-gold px-8 text-base font-semibold text-gold-foreground shadow-lg shadow-gold/20 transition-transform hover:scale-[1.03] hover:bg-gold/90",
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

      <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-available" />
        Pago 100% seguro con Bold · Sorteo con la Lotería de Boyacá
      </p>

      <dl className="glass mt-12 grid w-full max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl">
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
