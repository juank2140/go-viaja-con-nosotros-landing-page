"use client"

import { useState } from "react"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, get } from "firebase/database"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const FB_CONFIG = {
  apiKey: "AIzaSyAB5GIpefHLButGqp1FZz-Vag1IzTp7EdI",
  authDomain: "llave-maestra-299ca.firebaseapp.com",
  databaseURL: "https://llave-maestra-299ca-default-rtdb.firebaseio.com",
  projectId: "llave-maestra-299ca",
  storageBucket: "llave-maestra-299ca.firebasestorage.app",
  messagingSenderId: "760359671653",
  appId: "1:760359671653:web:752aebcfb017c50a15f38c",
}

function getDB() {
  const app = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG)
  return getDatabase(app)
}

function fmt(n: number) { return String(n).padStart(4, "0") }

type Resultado = {
  tipo: "celular" | "numero"
  nombre: string
  cel: string
  ciudad: string
  numeros: { num: number; estado: string }[]
}

export default function VerificarPage() {
  const [query, setQuery] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [noEncontrado, setNoEncontrado] = useState(false)

  async function buscar() {
    const q = query.trim().replace(/\D/g, "")
    if (!q) return
    // Rechazar si parece celular pero no es colombiano
    if (q.length === 10 && !q.startsWith("3")) {
      setNoEncontrado(true)
      return
    }

    setBuscando(true)
    setResultado(null)
    setNoEncontrado(false)

    try {
      const db = getDB()

      // Intentar por celular (10 dígitos colombiano)
      if (q.length === 10 || q.length === 12) {
        const cel = q.length === 12 ? q : "57" + q
        const celSnap = await get(ref(db, `sorteo/clientes/${cel.slice(-10)}`))
        if (!celSnap.exists()) {
          // intentar sin prefijo
          const celSnap2 = await get(ref(db, `sorteo/clientes/${q}`))
          if (celSnap2.exists()) {
            const d = celSnap2.val()
            const nums = await resolverNumeros(db, d.eventos)
            setResultado({ tipo: "celular", nombre: d.nombre, cel: d.cel, ciudad: d.ciudad, numeros: nums })
            return
          }
          setNoEncontrado(true)
          return
        }
        const d = celSnap.val()
        const nums = await resolverNumeros(db, d.eventos)
        setResultado({ tipo: "celular", nombre: d.nombre, cel: d.cel, ciudad: d.ciudad, numeros: nums })
        return
      }

      // Intentar por número de boleta (1-4 dígitos)
      if (q.length <= 4) {
        const n = parseInt(q)
        const snap = await get(ref(db, `sorteo/datos/${n}`))
        if (!snap.exists() || snap.val()?.estado !== "P") {
          setNoEncontrado(true)
          return
        }
        const d = snap.val()
        setResultado({
          tipo: "numero",
          nombre: d.nombre ?? "",
          cel: d.cel ?? "",
          ciudad: d.ciudad ?? "",
          numeros: [{ num: n, estado: d.estado }],
        })
        return
      }

      setNoEncontrado(true)
    } finally {
      setBuscando(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-heading text-3xl font-semibold text-foreground mb-2">
            Verifica tu boleta
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresa tu número de celular o el número de tu boleta para confirmar tu participación.
          </p>
        </div>

        {/* Buscador */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setNoEncontrado(false); setResultado(null) }}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
              placeholder="Ej: 3001234567 o 0042"
              className="flex-1 bg-secondary/50 border-0 text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={buscar} disabled={buscando || !query.trim()} className="bg-gold text-gold-foreground hover:bg-gold/90 px-4">
              {buscando ? <span className="animate-spin">⏳</span> : <Search size={18} />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Puedes buscar con tu celular (10 dígitos) o con tu número de boleta (ej: 0042).
          </p>
        </div>

        {/* No encontrado */}
        {noEncontrado && (
          <div className="glass rounded-2xl p-6 text-center border border-red-500/20">
            <div className="text-4xl mb-3">😕</div>
            <p className="text-foreground font-semibold mb-1">No encontramos tu boleta</p>
            <p className="text-muted-foreground text-sm">
              Verifica el número ingresado. Si acabas de comprar, espera unos minutos e intenta de nuevo.
            </p>
            <a
              href={`https://wa.me/573005087122?text=${encodeURIComponent("Hola, quiero verificar mi boleta de Go Viaja Con Nosotros.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-gold underline underline-offset-4"
            >
              Contactar soporte por WhatsApp
            </a>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div className="glass rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✅</span>
              <span className="text-green-400 font-semibold">Participación confirmada</span>
            </div>

            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre</span>
                <span className="text-foreground font-medium">{resultado.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ciudad</span>
                <span className="text-foreground">{resultado.ciudad}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sorteo</span>
                <span className="text-foreground">Go Viaja Con Nosotros 2026</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                {resultado.numeros.length === 1 ? "Tu número" : "Tus números"}
              </p>
              <div className="flex flex-wrap gap-3">
                {resultado.numeros.map(({ num }) => (
                  <span
                    key={num}
                    className="font-heading text-3xl font-semibold text-gold tabular-nums"
                  >
                    {fmt(num)}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Resultado del sorteo: últimas 4 cifras de la <strong>Lotería de Boyacá</strong> — 15 de agosto 2026.
            </p>
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            ← Volver al inicio
          </a>
        </div>
      </div>
    </main>
  )
}

async function resolverNumeros(db: ReturnType<typeof getDatabase>, eventos: { nums: number[] }[] = []) {
  const todosNums: number[] = eventos.flatMap((e) => e.nums ?? [])
  const resultados: { num: number; estado: string }[] = []
  for (const n of todosNums) {
    const snap = await get(ref(db, `sorteo/datos/${n}/estado`))
    resultados.push({ num: n, estado: snap.val() ?? "?" })
  }
  return resultados.filter((r) => r.estado === "P")
}
