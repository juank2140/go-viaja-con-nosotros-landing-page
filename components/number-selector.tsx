"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, CreditCard, Building2, Smartphone, Check } from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, onValue, update } from "firebase/database"

// ── Firebase ─────────────────────────────────────────────
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

// ── Config ────────────────────────────────────────────────
const PAGE_SIZE = 100
const TOTAL = 10000
const PRECIO_1 = 25000
const PRECIO_2 = 20000
const WA_ADMIN = "573005087122"
const SORTEO_NOMBRE = "Go Viaja Con Nosotros 2026"

function format(n: number) {
  return n.toString().padStart(4, "0")
}

function precioUnitario(cant: number) {
  return cant >= 2 ? PRECIO_2 : PRECIO_1
}

type NumEstado = "L" | "A" | "P"

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

  // ── Firebase listeners ───────────────────────────────────
  useEffect(() => {
    const db = getFirebaseDB()
    dbRef.current = db

    // Lista activa (100 números del admin)
    const unsubLista = onValue(ref(db, "sorteo/lista"), (snap) => {
      const data = snap.val()
      if (data && Array.isArray(data)) setListaActiva(data.map(Number))
    })

    // Datos de números (estados reales)
    const unsubDatos = onValue(ref(db, "sorteo/datos"), (snap) => {
      const data = snap.val()
      if (data) setDatosNums(data)
    })

    // Config del sorteo
    const unsubCfg = onValue(ref(db, "sorteo/cfg"), (snap) => {
      const data = snap.val()
      if (data?.nombre) setCfgNombre(data.nombre)
    })

    return () => { unsubLista(); unsubDatos(); unsubCfg() }
  }, [])

  // ── Estado de un número ──────────────────────────────────
  function estadoNum(n: number): NumEstado {
    const d = datosNums[String(n)]
    return (d?.estado as NumEstado) || "L"
  }

  function esLibre(n: number) {
    return estadoNum(n) === "L"
  }

  // ── Números a mostrar ────────────────────────────────────
  const numbers = useMemo(() => {
    if (search.trim()) {
      const q = search.trim()
      // Buscar en banco completo si es número específico
      const n = parseInt(q)
      if (!isNaN(n) && n >= 0 && n <= 9999) {
        // Mostrar el número exacto + los de la lista que coincidan
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

  // ── Toggle número ────────────────────────────────────────
  function toggle(n: number) {
    if (!esLibre(n) && !selected.includes(n)) return
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    )
  }

  // ── Validar y pagar ──────────────────────────────────────
  async function handlePagar() {
    const errs = {
      nombre: !form.nombre.trim(),
      celular: !form.celular.trim(),
    }
    setErrors(errs)
    if (errs.nombre || errs.celular) return
    if (selected.length === 0) return

    const db = dbRef.current
    if (!db) return

    // Reservar números en Firebase
    const now = new Date().toISOString()
    const cel = form.celular.replace(/\D/g, "")
    const updates: Record<string, unknown> = {}

    selected.forEach((n) => {
      updates[`sorteo/banco/${n}`] = "P"
      updates[`sorteo/datos/${n}`] = {
        estado: "P",
        nombre: form.nombre.trim(),
        cel,
        ciudad: form.ciudad.trim(),
        abono: pu,
        fechaPago: now,
        origen: "web",
      }
    })

    // Registrar cliente en Firebase
    const evFecha = `${new Date().getDate().toString().padStart(2,"0")}/${(new Date().getMonth()+1).toString().padStart(2,"0")}/${new Date().getFullYear()}`
    updates[`sorteo/clientes/${cel}`] = {
      nombre: form.nombre.trim(),
      cel,
      ciudad: form.ciudad.trim(),
      depto: "",
      dir: "",
      fechaRegistro: evFecha,
      eventos: [{
        evento: cfgNombre,
        fecha: evFecha,
        nums: selected,
      }],
    }

    await update(ref(db), updates)

    setConfNums(selected)
    setStep("confirm")

    // Abrir WhatsApp al admin
    const numerosStr = selected.map(format).join(", ")
    const totalStr = "$" + total.toLocaleString("es-CO")
    const msg = encodeURIComponent(
      `✅ *NUEVA VENTA WEB — ${cfgNombre}*\n\n` +
      `🎟 Número${selected.length > 1 ? "s" : ""}: *${numerosStr}*\n` +
      `👤 Cliente: ${form.nombre.trim()}\n` +
      `📞 Celular: ${cel}\n` +
      (form.ciudad ? `📍 Ciudad: ${form.ciudad.trim()}\n` : "") +
      `💰 Total: ${totalStr}${selected.length > 1 ? ` (${selected.length} × $${pu.toLocaleString("es-CO")} c/u)` : ""}\n` +
      `🕐 ${new Date().toLocaleString("es-CO")}\n\n` +
      `_Venta realizada desde la página web_`
    )
    setTimeout(() => {
      window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank")
    }, 1500)

    setSelected([])
    setForm({ nombre: "", celular: "", ciudad: "" })
  }

  function waCliente() {
    const numerosStr = confNums.map(format).join(", ")
    const msg = encodeURIComponent(
      `Hola, acabo de comprar el/los número(s) ${numerosStr} en ${cfgNombre}. Mi nombre es ${form.nombre || "cliente"}. ¡Gracias!`
    )
    window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank")
  }

  // ── Pantalla de confirmación ─────────────────────────────
  if (step === "confirm") {
    return (
      <section id="numeros" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-heading text-3xl font-semibold text-foreground mb-2">
            ¡Listo!
          </h2>
          <p className="text-muted-foreground mb-6">
            Tu pago fue procesado. Te enviamos tu boleta por WhatsApp.
          </p>
          <div className="glass rounded-2xl p-6 mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {confNums.length === 1 ? "Tu número" : "Tus números"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {confNums.map((n) => (
                <span key={n} className="font-heading text-2xl font-semibold text-gold tabular-nums">
                  {format(n)}
                </span>
              ))}
            </div>
          </div>
          <Button
            size="lg"
            className="w-full rounded-full bg-[#25D366] text-white hover:bg-[#128C7E] h-12 text-base font-semibold mb-3"
            onClick={waCliente}
          >
            💬 Abrir WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full bg-transparent"
            onClick={() => setStep("select")}
          >
            Comprar más números
          </Button>
        </div>
      </section>
    )
  }

  // ── Vista principal ──────────────────────────────────────
  return (
    <section id="numeros" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
            Elige tu suerte
          </span>
          <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
            Selecciona tu número
          </h2>
          <p className="mt-4 text-muted-foreground">
            $25.000 por una boleta · $20.000 c/u comprando 2 o más
          </p>
          {listaActiva.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground/60">
              Los números estarán disponibles pronto. Mientras tanto puedes buscar el tuyo.
            </p>
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
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-available" /> Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-sold" /> Vendido
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-gold" /> Seleccionado
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
              {numbers.map((n) => {
                const e = estadoNum(n)
                const libre = e === "L"
                const sel = selected.includes(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggle(n)}
                    disabled={!libre && !sel}
                    aria-pressed={sel}
                    className={[
                      "rounded-md py-2 text-center text-xs font-medium tabular-nums transition-all",
                      !libre && !sel
                        ? "cursor-not-allowed bg-sold/20 text-sold/70"
                        : sel
                          ? "scale-105 bg-gold text-gold-foreground shadow-md shadow-gold/30"
                          : "bg-available/15 text-available hover:scale-105 hover:bg-available/30",
                    ].join(" ")}
                  >
                    {format(n)}
                  </button>
                )
              })}
            </div>

            {!search && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {format(page * PAGE_SIZE)} – {format(Math.min(page * PAGE_SIZE + PAGE_SIZE - 1, 9999))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>

          {/* Panel de compra */}
          <div className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-6">
            <h3 className="font-heading text-2xl font-semibold text-foreground">
              Tu compra
            </h3>

            <div className="mt-4 min-h-12 rounded-xl bg-secondary/50 p-3">
              {selected.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aún no has elegido números.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggle(n)}
                      className="rounded-md bg-gold/20 px-2 py-1 text-xs font-medium tabular-nums text-gold hover:bg-red-500/20 hover:text-red-400 transition-colors"
                      title="Quitar"
                    >
                      {format(n)} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected.length >= 2 && (
              <p className="mt-2 text-xs text-available">
                🎉 Precio especial: ${pu.toLocaleString("es-CO")} c/u
              </p>
            )}

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrors({...errors, nombre: false}) }}
                  placeholder="Tu nombre"
                  className={`h-11 ${errors.nombre ? "border-red-500" : ""}`}
                />
                {errors.nombre && <p className="text-xs text-red-400">Campo obligatorio</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celular">Celular *</Label>
                <Input
                  id="celular"
                  value={form.celular}
                  onChange={(e) => { setForm({ ...form, celular: e.target.value }); setErrors({...errors, celular: false}) }}
                  placeholder="300 000 0000"
                  inputMode="tel"
                  className={`h-11 ${errors.celular ? "border-red-500" : ""}`}
                />
                {errors.celular && <p className="text-xs text-red-400">Campo obligatorio</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={form.ciudad}
                  onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  placeholder="Tu ciudad"
                  className="h-11"
                />
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

            <Button
              size="lg"
              disabled={selected.length === 0}
              onClick={handlePagar}
              className="mt-4 h-12 w-full rounded-full bg-gold text-base font-semibold text-gold-foreground transition-transform hover:scale-[1.02] hover:bg-gold/90 disabled:opacity-50"
            >
              <Check className="size-5" />
              Pagar con Bold
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CreditCard className="size-4" /> Tarjeta
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="size-4" /> PSE
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="size-4" /> Nequi
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
