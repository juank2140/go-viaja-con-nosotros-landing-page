"use client"

declare global { interface Window { fbq?: (...args: unknown[]) => void } }
function fbq(...args: unknown[]) { window.fbq?.(...args) }

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, onValue } from "firebase/database"
import { liveUpdate, liveEvent } from "@/lib/live-track"

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

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-white flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.524 5.855L.057 23.203a.75.75 0 0 0 .916.916l5.348-1.467A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.722 9.722 0 0 1-4.964-1.362l-.356-.211-3.695 1.013 1.013-3.695-.211-.356A9.722 9.722 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  )
}

export function NumberSelector() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<number[]>([])
  const [form, setForm] = useState({ nombre: "", celular: "", ciudad: "" })
  const [errors, setErrors] = useState({ nombre: false, celular: false, celularInvalido: false })
  const [datosNums, setDatosNums] = useState<Record<string, { estado: NumEstado }>>({})
  const [listaActiva, setListaActiva] = useState<number[]>([])
  const [cfgNombre, setCfgNombre] = useState(SORTEO_NOMBRE)
  const [confirmado, setConfirmado] = useState<number[]>([])

  useEffect(() => {
    const db = getFirebaseDB()
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
    const adding = !selected.includes(n)
    const newSelected = selected.includes(n) ? selected.filter((x) => x !== n) : [...selected, n]
    setSelected(newSelected)
    if (adding) {
      fbq("track", "AddToCart", { content_ids: [String(n)], content_type: "product", value: pu, currency: "COP" })
      liveUpdate("seleccionando", { nums: newSelected, total: newSelected.length * precioUnitario(newSelected.length) }).catch(() => {})
      liveEvent("addtocart", { num: n, nums: newSelected }).catch(() => {})
    } else if (newSelected.length === 0) {
      liveUpdate("visitando").catch(() => {})
    }
  }

  function celValido(cel: string) {
    const digits = cel.replace(/\D/g, "")
    return digits.length === 10 && digits.startsWith("3")
  }

  function handleReservar() {
    const celVacio = !form.celular.trim()
    const celMal = !celVacio && !celValido(form.celular)
    const errs = { nombre: !form.nombre.trim(), celular: celVacio, celularInvalido: celMal }
    setErrors(errs)
    if (errs.nombre || errs.celular || errs.celularInvalido) return
    if (selected.length === 0) return

    const cel = form.celular.replace(/\D/g, "")
    const numsStr = selected.map(format).join(", ")
    const msg = encodeURIComponent(
      `Hola, soy *${form.nombre.trim()}* de ${form.ciudad.trim() || "Colombia"}.\n\n` +
      `Quiero comprar ${selected.length === 1 ? "el número" : "los números"} *${numsStr}* del sorteo *${cfgNombre}*.\n\n` +
      `📞 Celular: ${cel}\n` +
      `💰 Total: $${total.toLocaleString("es-CO")}`
    )

    fbq("track", "InitiateCheckout", { num_items: selected.length, value: total, currency: "COP" })
    liveUpdate("checkout", { nums: selected, total, nombre: form.nombre.trim(), ciudad: form.ciudad.trim() }).catch(() => {})
    liveEvent("initiatecheckout", { nums: selected, total, nombre: form.nombre.trim() }).catch(() => {})

    window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank")
    setConfirmado([...selected])
    setSelected([])
  }

  // Pantalla post-reserva
  if (confirmado.length > 0) {
    const numsStr = confirmado.map(format).join(", ")
    const cel = form.celular.replace(/\D/g, "")
    const totalConf = confirmado.length * precioUnitario(confirmado.length)
    const msg = encodeURIComponent(
      `Hola, soy *${form.nombre.trim()}* de ${form.ciudad.trim() || "Colombia"}.\n\n` +
      `Quiero comprar ${confirmado.length === 1 ? "el número" : "los números"} *${numsStr}* del sorteo *${cfgNombre}*.\n\n` +
      `📞 Celular: ${cel}\n` +
      `💰 Total: $${totalConf.toLocaleString("es-CO")}`
    )
    return (
      <section id="numeros" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-heading text-3xl font-semibold text-foreground mb-2">¡Ya casi es tuyo!</h2>
          <p className="text-muted-foreground mb-6">
            Enviamos el mensaje a WhatsApp. Si no se abrió automáticamente, toca el botón de abajo.
          </p>

          <div className="glass rounded-2xl p-6 mb-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {confirmado.length === 1 ? "Tu número" : "Tus números"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {confirmado.map((n) => (
                <span key={n} className="font-heading text-2xl font-semibold text-gold tabular-nums">{format(n)}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 mb-5 text-left">
            <p className="text-sm font-semibold text-amber-400 mb-1">📲 ¿Cómo completar tu compra?</p>
            <p className="text-sm text-muted-foreground">
              Toca <span className="text-foreground font-medium">Enviar</span> en WhatsApp y te indicamos cómo realizar el pago. Una vez confirmado, recibes tu boleta oficial.
            </p>
          </div>

          <a
            href={`https://wa.me/${WA_ADMIN}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-14 rounded-full font-semibold text-white mb-4"
            style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
          >
            <WAIcon />
            Abrir WhatsApp
          </a>
          <Button variant="outline" className="w-full rounded-full bg-transparent" onClick={() => setConfirmado([])}>
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
                tenemos 10.000 números disponibles y puedes elegir cualquiera.
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
                  onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setErrors({ ...errors, nombre: false }) }}
                  placeholder="Tu nombre" className={`h-11 ${errors.nombre ? "border-red-500" : ""}`} />
                {errors.nombre && <p className="text-xs text-red-400">Campo obligatorio</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celular">Celular *</Label>
                <Input id="celular" value={form.celular}
                  onChange={(e) => { setForm({ ...form, celular: e.target.value }); setErrors({ ...errors, celular: false, celularInvalido: false }) }}
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

            <button
              onClick={handleReservar}
              disabled={selected.length === 0}
              className="mt-4 h-14 w-full rounded-full font-semibold text-white flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: selected.length === 0
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                boxShadow: selected.length === 0 ? "none" : "0 8px 32px rgba(37,211,102,0.35)",
              }}
            >
              <WAIcon />
              Reservar por WhatsApp
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Te atendemos al instante y te guiamos con el pago
            </p>
          </div>
        </div>

        {totalPages > 1 && !search && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              ← Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {page + 1} de {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
              Siguiente →
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
