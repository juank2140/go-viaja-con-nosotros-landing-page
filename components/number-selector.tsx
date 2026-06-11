"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, CreditCard, Building2, Smartphone, Check } from "lucide-react"

const PAGE_SIZE = 100
const TOTAL = 10000

// Deterministic pseudo-random "sold" set so the UI is consistent on each render.
function isSold(n: number) {
  return (n * 2654435761) % 97 < 12
}

function format(n: number) {
  return n.toString().padStart(4, "0")
}

export function NumberSelector() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<number[]>([])
  const [form, setForm] = useState({ nombre: "", celular: "", ciudad: "" })

  const numbers = useMemo(() => {
    if (search.trim()) {
      const q = search.trim()
      return Array.from({ length: TOTAL }, (_, i) => i).filter((n) =>
        format(n).includes(q),
      ).slice(0, 200)
    }
    const start = page * PAGE_SIZE
    return Array.from({ length: PAGE_SIZE }, (_, i) => start + i)
  }, [page, search])

  const unitPrice = selected.length >= 2 ? 20000 : 25000
  const total = selected.length * unitPrice

  function toggle(n: number) {
    if (isSold(n)) return
    setSelected((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    )
  }

  const totalPages = Math.ceil(TOTAL / PAGE_SIZE)

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
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Grid */}
          <div className="glass rounded-3xl p-5 sm:p-6">
            <div className="relative mb-5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                const sold = isSold(n)
                const sel = selected.includes(n)
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggle(n)}
                    disabled={sold}
                    aria-pressed={sel}
                    className={[
                      "rounded-md py-2 text-center text-xs font-medium tabular-nums transition-all",
                      sold
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
                  {format(page * PAGE_SIZE)} – {format(page * PAGE_SIZE + PAGE_SIZE - 1)}
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

          {/* Purchase panel */}
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
                    <span
                      key={n}
                      className="rounded-md bg-gold/20 px-2 py-1 text-xs font-medium tabular-nums text-gold"
                    >
                      {format(n)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Tu nombre"
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={form.celular}
                  onChange={(e) => setForm({ ...form, celular: e.target.value })}
                  placeholder="300 000 0000"
                  inputMode="tel"
                  className="h-11"
                />
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
