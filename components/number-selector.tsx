"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, onValue, update } from "firebase/database"

const FB_CONFIG = {
  apiKey: "AIzaSyAB5GIpefHLButGqp1FZz-Vag1IzTp7EdI",
  authDomain: "llave-maestra-299ca.firebaseapp.com",
  databaseURL: "https://llave-maestra-299ca-default-rtdb.firebaseio.com",
  projectId: "llave-maestra-299ca",
  storageBucket: "llave-maestra-299ca.firebasestorage.app",
  messagingSenderId: "760359671653",
  appId: "1:760359671653:web:752aebcfb017c50a15f38c",
}

function getFirebaseDB() {
  const app = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG)
  return getDatabase(app)
}

async function enviarBoletaWA(
  numero: number, nombre: string, cel: string, ciudad: string
) {
  try {
    await fetch("/api/enviar-boleta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero, nombre, cel, ciudad }),
    })
  } catch (err) {
    console.error("❌ Error enviando boleta:", err)
  }
}

// ── Config ─────────────────────────────────────────────────
const PAGE_SIZE = 100
const TOTAL = 10000
const PRECIO_1 = 25000
const PRECIO_2 = 20000
const WA_ADMIN = "573005087122"
const SORTEO_NOMBRE = "Go Viaja Con Nosotros 2026"

function format(n: number) { return n.toString().padStart(4, "0") }
function precioUnitario(cant: number) { return cant >= 2 ? PRECIO_2 : PRECIO_1 }

// ── Chime compra exitosa ───────────────────────────────────
const CHIME_SRC = "data:audio/wav;base64,UklGRvSJAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YdCJAAAAACQAiAAXAbcBTgLTAkQDqAMIBGIEpwS/BJEEEQRFA08CYAGwAGQAhADxAGsBpQFZAWAAwf6r/Gn6SviD9if1HvQ+867ycvGg8Djwp/BN8mH1z/k2//gEZQrfDggS1hOGFIEUMRTYE3gT1RKUEWgPNgw2COwDBwAu/cb7zfvT/BX+tf76/ZD7kveI8jrtauib5PPhOuAD3+fdwtzT27rbSd1B4QfocPG3/KQI2RMmHdcj1SeXKekpmyk1Kcoo/CcvJtcivh05FyIQnQnHBFQCTgIFBD0GhwewBhgD4vzy9JXsAuUN3+vaTdiJ1vzUX9P40ZLRQdPA2FHg9Oss+ZYIOxZUIQApJS1gLrYtNyyZKggpKSdTJOYfphnnEZEJ4wEB/OH4ZPio+TL8u/1G/Sj6ffQO7RLlxN0G2CfU5dGc0KbPq87eze3N8M/j1FzdOOmP99sGXRWEIVYqnC/cMREySTFJMFAvTC7xK0MouiKVG6cTJQxIBucCMQKOA80FdQc6B1sE1/5i9yfvZOcL4YDclNmu1yTWktQT00ACK9Ny3RGVxsGLm5UDK0oCi0SLwT68RCNL0ARFHfaP5MGFQKGCF4bOlUSVRpfCXe/W+bvQvvHTkHbxSPVsKLwXWPBh1Yq4PEiLAFO4MQ9WXnhVWykmkWd0C3pUVcUHQtMnuZ6nMfAPL/grL8ERw6dlPzj1j3nYjW7d9Uf3sMX1i9Gg56TKs1KkA5LVXULb8UaL5JDkQ3MrY8g4rfT5hx3PLeN0M0bFdKnVMSN9bSr9bMq9sNfPOiZl6q3R2JR4A=="
function playChime() {
  try {
    const audio = new Audio(CHIME_SRC)
    audio.volume = 0.45
    audio.play().catch(() => {})
  } catch (e) {}
}

type NumEstado = "L" | "A" | "P"

// ── Botón Bold ─────────────────────────────────────────────
function BoldLogo() {
  return (
    <img
      src="/logo bold.png"
      alt="Bold"
      style={{ height: 22, width: "auto", filter: "brightness(0) invert(1)" }}
    />
  )
}

function BoldButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-4 h-14 w-full rounded-full transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
      style={{
        background: disabled
          ? "rgba(255,255,255,0.08)"
          : "linear-gradient(135deg, #1a1f5e 0%, #6b21a8 50%, #dc2626 100%)",
        boxShadow: disabled ? "none" : "0 8px 32px rgba(107,33,168,0.35)",
      }}
    >
      <span className="flex items-center justify-center gap-2.5 px-6 h-full">
        <span className="text-white text-base font-semibold tracking-wide opacity-90">Pagar con</span>
        <BoldLogo />
      </span>
    </button>
  )
}

// ── Logos de medios de pago ────────────────────────────────
function PaymentLogos() {
  return (
    <div className="mt-4">
      <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Métodos de pago aceptados
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { label: "VISA", bg: "#1a1f71", text: "white", style: "italic font-black text-sm" },
          { label: "●●", bg: "#eb001b", text: "white", style: "font-bold tracking-[-4px] text-lg" },
          { label: "PSE", bg: "#00843d", text: "white", style: "font-bold text-xs" },
          { label: "nequi", bg: "#6b21a8", text: "white", style: "font-semibold text-xs" },
          { label: "DaviPlata", bg: "#e8001c", text: "white", style: "font-bold text-[9px]" },
          { label: "AMEX", bg: "#007bc1", text: "white", style: "font-bold text-[9px]" },
        ].map((m) => (
          <span
            key={m.label}
            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 ${m.style}`}
            style={{ background: m.bg, color: m.text, minWidth: 44, height: 28 }}
          >
            {m.label === "●●" ? (
              <span className="flex">
                <span className="size-4 rounded-full bg-[#eb001b] border-2 border-white/20" />
                <span className="size-4 rounded-full bg-[#f79e1b] -ml-2 border-2 border-white/20" />
              </span>
            ) : m.label}
          </span>
        ))}
        <span className="text-muted-foreground text-xs">+ más</span>
      </div>
    </div>
  )
}

export function NumberSelector() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<number[]>([])
  const [form, setForm] = useState({ nombre: "", celular: "", ciudad: "" })
  const [errors, setErrors] = useState({ nombre: false, celular: false, celularInvalido: false })
  const [datosNums, setDatosNums] = useState<Record<string, { estado: NumEstado; nombre?: string }>>({})
  const [listaActiva, setListaActiva] = useState<number[]>([])
  const [cfgNombre, setCfgNombre] = useState(SORTEO_NOMBRE)
  const [step, setStep] = useState<"select" | "confirm">("select")
  const [confNums, setConfNums] = useState<number[]>([])
  const [enviando, setEnviando] = useState(false)
  const [boldPopup, setBoldPopup] = useState<Window | null>(null)
  const dbRef = useRef<ReturnType<typeof getDatabase> | null>(null)

  // Escuchar mensaje de éxito desde el popup de Bold
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type === "BOLD_PAGO_OK" && e.data?.nums) {
        setConfNums(e.data.nums)
        setSelected([])
        setStep("confirm")
        setBoldPopup(null)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  useEffect(() => {
    const db = getFirebaseDB()
    dbRef.current = db
    const unsubLista = onValue(ref(db, "sorteo/lista"), (snap) => {
      const data = snap.val()
      if (data && Array.isArray(data)) setListaActiva(data.map(Number))
    })
    const unsubDatos = onValue(ref(db, "sorteo/datos"), (snap) => {
      const data = snap.val()
      if (data) setDatosNums(data)
    })
    const unsubCfg = onValue(ref(db, "sorteo/cfg"), (snap) => {
      const data = snap.val()
      if (data?.nombre) setCfgNombre(data.nombre)
    })
    return () => { unsubLista(); unsubDatos(); unsubCfg() }
  }, [])

  function estadoNum(n: number): NumEstado {
    const d = datosNums[String(n)]
    return (d?.estado as NumEstado) || "L"
  }
  function esLibre(n: number) { return estadoNum(n) === "L" }

  const numbers = useMemo(() => {
    if (search.trim()) {
      const q = search.trim()
      const n = parseInt(q)
      if (!isNaN(n) && n >= 0 && n <= 9999) {
        const fromLista = listaActiva.filter((x) => format(x).includes(q))
        if (!fromLista.includes(n)) fromLista.unshift(n)
        return fromLista.slice(0, 50)
      }
      return listaActiva.filter((x) => format(x).includes(q)).slice(0, 50)
    }
    if (listaActiva.length === 0) {
      const start = page * PAGE_SIZE
      return Array.from({ length: PAGE_SIZE }, (_, i) => start + i)
    }
    const start = page * PAGE_SIZE
    return listaActiva.slice(start, start + PAGE_SIZE)
  }, [page, search, listaActiva])

  const pu = precioUnitario(selected.length)
  const total = selected.length * pu
  const totalPages = Math.max(1, Math.ceil((listaActiva.length || TOTAL) / PAGE_SIZE))

  function toggle(n: number) {
    if (!esLibre(n) && !selected.includes(n)) return
    setSelected((prev) => prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n])
  }

  function celValido(cel: string) {
    const digits = cel.replace(/\D/g, "")
    return digits.length === 10 && digits.startsWith("3")
  }

  async function handlePagar() {
    const celVacio = !form.celular.trim()
    const celMal = !celVacio && !celValido(form.celular)
    const errs = { nombre: !form.nombre.trim(), celular: celVacio, celularInvalido: celMal }
    setErrors(errs)
    if (errs.nombre || errs.celular || errs.celularInvalido) return
    if (selected.length === 0) return

    setEnviando(true)
    try {
      const cel = form.celular.replace(/\D/g, "")
      const orderReference = `GV-${cel}-${Date.now()}`
      const amountInCents = total // Bold COP: monto sin decimales (25000 = $25.000 COP)

      // Guardar datos pendientes en Firebase (estado "A" = apartado, esperando pago)
      const db = dbRef.current
      if (!db) return
      const evFecha = `${new Date().getDate().toString().padStart(2,"0")}/${(new Date().getMonth()+1).toString().padStart(2,"0")}/${new Date().getFullYear()}`
      const pendingUpdates: Record<string, unknown> = {}
      selected.forEach((n) => {
        pendingUpdates[`sorteo/datos/${n}`] = {
          estado: "A", nombre: form.nombre.trim(), cel,
          ciudad: form.ciudad.trim(), abono: pu,
          fechaReserva: new Date().toISOString(), origen: "web",
          orderReference,
        }
      })
      pendingUpdates[`sorteo/pendientes/${orderReference}`] = {
        nums: selected, nombre: form.nombre.trim(), cel,
        ciudad: form.ciudad.trim(), total, fecha: evFecha,
      }
      await update(ref(db), pendingUpdates)

      // Obtener firma de Bold desde el servidor
      const res = await fetch("/api/bold-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderReference, amountInCents }),
      })
      const { integritySignature, apiKey } = await res.json()

      // Abrir página de checkout propia con el botón oficial de Bold
      const checkoutUrl = new URL("/checkout.html", window.location.origin)
      checkoutUrl.searchParams.set("api_key", apiKey)
      checkoutUrl.searchParams.set("order_id", orderReference)
      checkoutUrl.searchParams.set("amount", String(amountInCents))
      checkoutUrl.searchParams.set("currency", "COP")
      checkoutUrl.searchParams.set("sig", integritySignature)
      checkoutUrl.searchParams.set("redirect_url", `${window.location.origin}/pago-exitoso`)

      // Navegar directo a checkout (popup bloqueaba cookies de Bold)
      window.location.href = checkoutUrl.toString()
    } finally {
      setEnviando(false)
    }
  }

  if (step === "confirm") {
    return (
      <section id="numeros" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-heading text-3xl font-semibold text-foreground mb-2">¡Listo!</h2>
          <p className="text-muted-foreground mb-6">Tu pago fue procesado. Te enviamos tu boleta por WhatsApp.</p>
          <div className="glass rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {confNums.length === 1 ? "Tu número" : "Tus números"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {confNums.map((n) => (
                <span key={n} className="font-heading text-2xl font-semibold text-gold tabular-nums">{format(n)}</span>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-full bg-transparent" onClick={() => setStep("select")}>
            Comprar más números
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section id="numeros" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">Elige tu suerte</span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Selecciona tu número
          </h2>
          <p className="mt-4 text-muted-foreground">$25.000 por una boleta · $20.000 c/u comprando 2 o más</p>
          {listaActiva.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground/60">Los números estarán disponibles pronto. Mientras tanto puedes buscar el tuyo.</p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="glass rounded-3xl p-5 sm:p-6">
            <div className="relative mb-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                placeholder="Busca tu número (ej. 1234)"
                inputMode="numeric"
                className="h-11 pl-9"
              />
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-available" /> Disponible</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-sold" /> Vendido</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-gold" /> Seleccionado</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
              {numbers.map((n) => {
                const e = estadoNum(n)
                const libre = e === "L"
                const sel = selected.includes(n)
                return (
                  <button
                    key={n} type="button" onClick={() => toggle(n)}
                    disabled={!libre && !sel} aria-pressed={sel}
                    className={["rounded-md py-2 text-center text-xs font-medium tabular-nums transition-all",
                      !libre && !sel ? "cursor-not-allowed bg-sold/20 text-sold/70"
                      : sel ? "scale-105 bg-gold text-gold-foreground shadow-md shadow-gold/30"
                      : "bg-available/15 text-available hover:scale-105 hover:bg-available/30",
                    ].join(" ")}
                  >{format(n)}</button>
                )
              })}
            </div>
            <div className="mt-5 rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3 text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                ¿No ves tu número favorito? <span className="text-gold font-medium">Búscalo arriba</span> —
                tenemos 10.000 números disponibles en el banco y puedes comprar cualquiera.
              </p>
            </div>
          </div>

          <div className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-6">
            <h3 className="font-heading text-2xl font-semibold text-foreground">Tu compra</h3>
            <div className="mt-4 min-h-12 rounded-xl bg-secondary/50 p-3">
              {selected.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aún no has elegido números.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((n) => (
                    <button key={n} onClick={() => toggle(n)}
                      className="rounded-md bg-gold/20 px-2 py-1 text-xs font-medium tabular-nums text-gold hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title="Quitar">{format(n)} ×</button>
                  ))}
                </div>
              )}
            </div>
            {selected.length >= 2 && (
              <p className="mt-2 text-xs text-available">🎉 Precio especial: ${pu.toLocaleString("es-CO")} c/u</p>
            )}
            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input id="nombre" value={form.nombre}
                  onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrors({...errors, nombre: false}) }}
                  placeholder="Tu nombre" className={`h-11 ${errors.nombre ? "border-red-500" : ""}`} />
                {errors.nombre && <p className="text-xs text-red-400">Campo obligatorio</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celular">Celular *</Label>
                <Input id="celular" value={form.celular}
                  onChange={(e) => { setForm({ ...form, celular: e.target.value }); setErrors({...errors, celular: false, celularInvalido: false}) }}
                  placeholder="300 000 0000" inputMode="tel"
                  className={`h-11 ${errors.celular || errors.celularInvalido ? "border-red-500" : ""}`} />
                {errors.celular && <p className="text-xs text-red-400">Ingresa tu celular</p>}
                {errors.celularInvalido && <p className="text-xs text-red-400">Celular inválido — debe tener 10 dígitos y empezar por 3</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input id="ciudad" value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  placeholder="Tu ciudad" className="h-11" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">
                {selected.length} {selected.length === 1 ? "boleta" : "boletas"}
              </span>
              <span className="font-heading text-3xl font-semibold text-gold tabular-nums">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
            <BoldButton onClick={handlePagar} disabled={selected.length === 0 || enviando} />
            {enviando && (
              <p className="mt-2 text-center text-xs text-muted-foreground animate-pulse">
                ✉️ Enviando tu boleta por WhatsApp...
              </p>
            )}
            <PaymentLogos />
          </div>
        </div>
      </div>
    </section>
  )
}
