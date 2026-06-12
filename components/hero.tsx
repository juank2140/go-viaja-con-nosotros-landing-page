"use client"

import { useEffect, useState, useRef } from "react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Plane, ShieldCheck, Clock, Sparkles } from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, onValue } from "firebase/database"

const FB_CONFIG = {
  apiKey: "AIzaSyAB5GIpefHLButGqp1FZz-Vag1IzTp7EdI",
  authDomain: "llave-maestra-299ca.firebaseapp.com",
  databaseURL: "https://llave-maestra-299ca-default-rtdb.firebaseio.com",
  projectId: "llave-maestra-299ca",
  storageBucket: "llave-maestra-299ca.firebasestorage.app",
  messagingSenderId: "760359671653",
  appId: "1:760359671653:web:752aebcfb017c50a15f38c",
}

const TARGET = new Date("2026-07-11T20:00:00-05:00").getTime()

// ── Base creíble de ventas simuladas ──────────────────────
const BASE_VENDIDOS = 847 // número inicial "vendido" al abrir la web

// ── Compras simuladas ─────────────────────────────────────
const NOMBRES = [
  "Carlos","Andrés","María","Juan","Paola","Diego","Valentina","Camilo",
  "Luisa","Santiago","Natalia","Felipe","Daniela","Sebastián","Laura",
  "Alejandro","Carolina","David","Juliana","Tomás","Manuela","Nicolás",
  "Verónica","Mateo","Isabella","Sergio","Catalina","Cristian","Andrea","Miguel"
]
const CIUDADES = [
  "Bogotá","Medellín","Cali","Barranquilla","Bucaramanga","Manizales",
  "Pereira","Ibagué","Cúcuta","Santa Marta","Villavicencio","Pasto",
  "Cartagena","Neiva","Armenia","Montería","Popayán","Tunja","Sincelejo","Valledupar"
]

function rand(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }

interface Compra {
  id: number
  nombre: string
  ciudad: string
  cantidad: number
  hace: string
}

function generarCompra(id: number): Compra {
  return {
    id,
    nombre: rand(NOMBRES),
    ciudad: rand(CIUDADES),
    cantidad: Math.random() < 0.65 ? 1 : randInt(2, 5),
    hace: "ahora mismo",
  }
}

function pad(n: number) { return n.toString().padStart(2, "0") }

function useCountdown() {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (now === null) return null
  const diff = Math.max(0, TARGET - now)
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

// ── Componente contador animado ───────────────────────────
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const [flash, setFlash] = useState(false)
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    setFlash(true)
    // Animar conteo rápido
    const diff = value - prev.current
    const steps = Math.min(Math.abs(diff), 20)
    const step = diff / steps
    let current = prev.current
    let i = 0
    const timer = setInterval(() => {
      i++
      current += step
      setDisplay(Math.round(current))
      if (i >= steps) {
        setDisplay(value)
        clearInterval(timer)
        setTimeout(() => setFlash(false), 600)
      }
    }, 40)
    prev.current = value
    return () => clearInterval(timer)
  }, [value])

  return (
    <span
      className={cn(className, "transition-all duration-300", flash && "scale-110 text-available drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]")}
      style={{ display: "inline-block" }}
    >
      {display.toLocaleString("es-CO")}
    </span>
  )
}

// ── Toast de compra reciente ──────────────────────────────
function CompraToast({ compra, onDone }: { compra: Compra | null; onDone: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!compra) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 4000)
    return () => clearTimeout(t)
  }, [compra])

  if (!compra) return null

  return (
    <div
      className={cn(
        "fixed bottom-6 left-4 z-50 max-w-[320px] transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <div className="glass flex items-center gap-3 rounded-2xl border border-available/25 bg-background/80 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-available/15 text-lg">
          ✈️
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {compra.nombre} de {compra.ciudad}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            compró <span className="font-bold text-gold">{compra.cantidad} {compra.cantidad === 1 ? "boleta" : "boletas"}</span> · {compra.hace}
          </p>
        </div>
        <span className="flex size-2 shrink-0 rounded-full bg-available shadow-[0_0_8px_3px_rgba(16,185,129,0.5)] animate-pulse" />
      </div>
    </div>
  )
}

export function Hero() {
  const c = useCountdown()
  const [vendidos, setVendidos] = useState(BASE_VENDIDOS)
  const [vendidosFirebase, setVendidosFirebase] = useState(0)
  const [compraActual, setCompraActual] = useState<Compra | null>(null)
  const compraIdRef = useRef(0)
  const vendidosRef = useRef(BASE_VENDIDOS)

  // ── Leer ventas reales de Firebase ───────────────────────
  useEffect(() => {
    try {
      const app = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG)
      const db = getDatabase(app)
      onValue(ref(db, "sorteo/datos"), (snap) => {
        const data = snap.val() || {}
        let count = 0
        Object.values(data).forEach((d: any) => {
          if (d?.estado === "P" || d?.estado === "A") count++
        })
        setVendidosFirebase(count)
      })
    } catch (e) {}
  }, [])

  // Total real = base simulada + ventas reales Firebase
  const totalVendidos = vendidos + vendidosFirebase
  const totalLibres = Math.max(0, 10000 - totalVendidos)

  // ── Simulación de compras cada 8-20 segundos ─────────────
  useEffect(() => {
    function programarSiguiente() {
      const delay = randInt(8000, 20000)
      return setTimeout(() => {
        const cantidad = Math.random() < 0.65 ? 1 : randInt(2, 5)
        compraIdRef.current += 1
        const compra = generarCompra(compraIdRef.current)
        compra.cantidad = cantidad

        // Mostrar toast
        setCompraActual(compra)

        // Sumar al contador
        vendidosRef.current += cantidad
        setVendidos(vendidosRef.current)

        programarSiguiente()
      }, delay)
    }
    const t = programarSiguiente()
    return () => clearTimeout(t)
  }, [])

  const units = c
    ? [
        { label: "Días", value: pad(c.d) },
        { label: "Horas", value: pad(c.h) },
        { label: "Min", value: pad(c.m) },
        { label: "Seg", value: pad(c.s) },
      ]
    : null

  return (
    <>
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
          <div className="absolute inset-0 bg-background/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
          <div className="absolute inset-0 [box-shadow:inset_0_0_180px_60px_var(--background)]" />
          <div className="glow-gold absolute -left-20 top-1/4 size-[28rem] opacity-30" />
          <div className="glow-gold absolute -right-24 bottom-10 size-[32rem] opacity-25" />
        </div>

        <div className="pointer-events-none absolute right-[8%] top-[18%] hidden animate-float text-gold/80 lg:block">
          <Plane className="size-10 -rotate-12" />
        </div>
        <div className="pointer-events-none absolute left-[10%] top-[30%] hidden animate-float text-foreground/15 lg:block" style={{ animationDelay: "1.5s" }}>
          <Plane className="size-7 rotate-45" />
        </div>

        <img src="/images/logo.png" alt="Go Viaja Con Nosotros" className="animate-rise mb-6 h-24 w-auto drop-shadow-2xl sm:h-32" />

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
                  <div key={u.label} className="glass flex min-w-16 flex-col items-center rounded-xl px-3 py-2.5 sm:min-w-20">
                    <span className="font-heading text-2xl font-semibold tabular-nums text-gold sm:text-3xl">{u.value}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{u.label}</span>
                  </div>
                ))
              : ["Días", "Horas", "Min", "Seg"].map((label) => (
                  <div key={label} className="glass flex min-w-16 flex-col items-center rounded-xl px-3 py-2.5 sm:min-w-20">
                    <span className="font-heading text-2xl font-semibold text-gold sm:text-3xl">--</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
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

        {/* ── Stats con contador en tiempo real ── */}
        <dl className="glass mt-12 grid w-full max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl">
          {/* Disponibles */}
          <div className="flex flex-col items-center gap-1 px-4 py-6">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Disponibles</dt>
            <dd className="font-heading text-3xl font-semibold sm:text-4xl">
              <AnimatedNumber value={totalLibres} className="text-gold" />
            </dd>
          </div>
          {/* Vendidos */}
          <div className="relative flex flex-col items-center gap-1 px-4 py-6 bg-available/5 border-x border-available/10">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Vendidos</dt>
            <dd className="font-heading text-3xl font-semibold sm:text-4xl">
              <AnimatedNumber value={totalVendidos} className="text-available" />
            </dd>
            {/* Indicador live */}
            <span className="absolute top-3 right-3 flex size-2 rounded-full bg-available animate-pulse shadow-[0_0_6px_2px_rgba(16,185,129,0.5)]" />
          </div>
          {/* Precio */}
          <div className="flex flex-col items-center gap-1 px-4 py-6">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Por boleta</dt>
            <dd className="font-heading text-3xl font-semibold text-gold sm:text-4xl">$25k</dd>
          </div>
        </dl>

        {/* Urgencia */}
        <p className="mt-4 text-xs text-muted-foreground animate-pulse">
          🔥 <span className="text-available font-medium">{totalVendidos}</span> personas ya aseguraron su número · ¡No te quedes sin el tuyo!
        </p>

      </section>

      {/* Toast de compras simuladas */}
      <CompraToast
        compra={compraActual}
        onDone={() => setCompraActual(null)}
      />
    </>
  )
}
