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

const PAGE_SIZE = 100
const TOTAL = 10000
const PRECIO_1 = 25000
const PRECIO_2 = 20000
const WA_ADMIN = "573005087122"
const SORTEO_NOMBRE = "Go Viaja Con Nosotros 2026"

function format(n: number) { return n.toString().padStart(4, "0") }
function precioUnitario(cant: number) { return cant >= 2 ? PRECIO_2 : PRECIO_1 }

type NumEstado = "L" | "A" | "P"

// ── Botón Bold con logo real ───────────────────────────────
const BOLD_LOGO_WHITE = "data:image/png;base64,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"

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
        <img src={BOLD_LOGO_WHITE} alt="Bold" className="h-6 w-auto object-contain" />
      </span>
    </button>
  )
}

// ── Logos de medios de pago ────────────────────────────────
function PaymentLogos() {
  const methods = [
    { name: "Visa", color: "#1a1f71", text: "VISA", font: "italic font-black" },
    { name: "Mastercard", emoji: "🔴🟡" },
    { name: "PSE", color: "#00843d", text: "PSE", font: "font-bold" },
    { name: "Nequi", color: "#6b21a8", text: "nequi", font: "font-bold" },
    { name: "DaviPlata", color: "#e8001c", text: "Davi", font: "font-bold" },
    { name: "Amex", color: "#007bc1", text: "AMEX", font: "font-bold text-xs" },
  ]
  return (
    <div className="mt-4">
      <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Métodos de pago aceptados
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { label: "VISA", bg: "#1a1f71", text: "white", style: "italic font-black text-sm" },
          { label: "●●", bg: "#eb001b", text: "white", style: "font-bold tracking-[-4px] text-lg", overlay: true },
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
  const [errors, setErrors] = useState({ nombre: false, celular: false })
  const [datosNums, setDatosNums] = useState<Record<string, { estado: NumEstado; nombre?: string }>>({})
  const [listaActiva, setListaActiva] = useState<number[]>([])
  const [cfgNombre, setCfgNombre] = useState(SORTEO_NOMBRE)
  const [step, setStep] = useState<"select" | "confirm">("select")
  const [confNums, setConfNums] = useState<number[]>([])
  const dbRef = useRef<ReturnType<typeof getDatabase> | null>(null)

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

  async function handlePagar() {
    const errs = { nombre: !form.nombre.trim(), celular: !form.celular.trim() }
    setErrors(errs)
    if (errs.nombre || errs.celular) return
    if (selected.length === 0) return
    const db = dbRef.current
    if (!db) return

    const now = new Date().toISOString()
    const cel = form.celular.replace(/\D/g, "")
    const updates: Record<string, unknown> = {}
    selected.forEach((n) => {
      updates[`sorteo/banco/${n}`] = "P"
      updates[`sorteo/datos/${n}`] = {
        estado: "P", nombre: form.nombre.trim(), cel,
        ciudad: form.ciudad.trim(), abono: pu,
        fechaPago: now, origen: "web",
      }
    })
    const evFecha = `${new Date().getDate().toString().padStart(2,"0")}/${(new Date().getMonth()+1).toString().padStart(2,"0")}/${new Date().getFullYear()}`
    updates[`sorteo/clientes/${cel}`] = {
      nombre: form.nombre.trim(), cel, ciudad: form.ciudad.trim(),
      depto: "", dir: "", fechaRegistro: evFecha,
      eventos: [{ evento: cfgNombre, fecha: evFecha, nums: selected }],
    }
    await update(ref(db), updates)
    setConfNums(selected)
    setStep("confirm")

    const numerosStr = selected.map(format).join(", ")
    const totalStr = "$" + total.toLocaleString("es-CO")
    const msg = encodeURIComponent(
      `✅ *NUEVA VENTA WEB — ${cfgNombre}*\n\n` +
      `🎟 Número${selected.length > 1 ? "s" : ""}: *${numerosStr}*\n` +
      `👤 Cliente: ${form.nombre.trim()}\n📞 Celular: ${cel}\n` +
      (form.ciudad ? `📍 Ciudad: ${form.ciudad.trim()}\n` : "") +
      `💰 Total: ${totalStr}${selected.length > 1 ? ` (${selected.length} × $${pu.toLocaleString("es-CO")} c/u)` : ""}\n` +
      `🕐 ${new Date().toLocaleString("es-CO")}\n\n_Venta realizada desde la página web_`
    )
    setTimeout(() => { window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank") }, 1500)
    setSelected([])
    setForm({ nombre: "", celular: "", ciudad: "" })
  }

  function waCliente() {
    const numerosStr = confNums.map(format).join(", ")
    const msg = encodeURIComponent(`Hola, acabo de comprar el/los número(s) ${numerosStr} en ${cfgNombre}. ¡Gracias!`)
    window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank")
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
          <Button size="lg" className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] h-12 text-base font-semibold mb-3" onClick={waCliente}>
            💬 Abrir WhatsApp
          </Button>
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
          {/* Grid de números */}
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
            {!search && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Anterior</Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {format(page * PAGE_SIZE)} – {format(Math.min(page * PAGE_SIZE + PAGE_SIZE - 1, 9999))}
                </span>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Siguiente</Button>
              </div>
            )}
          </div>

          {/* Panel de compra */}
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
                  onChange={(e) => { setForm({ ...form, celular: e.target.value }); setErrors({...errors, celular: false}) }}
                  placeholder="300 000 0000" inputMode="tel" className={`h-11 ${errors.celular ? "border-red-500" : ""}`} />
                {errors.celular && <p className="text-xs text-red-400">Campo obligatorio</p>}
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

            {/* Botón Bold */}
            <BoldButton onClick={handlePagar} disabled={selected.length === 0} />

            {/* Logos de medios de pago */}
            <PaymentLogos />
          </div>
        </div>
      </div>
    </section>
  )
}
