"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, runTransaction, update } from "firebase/database"

const FB_CONFIG = {
  apiKey: "AIzaSyAB5GIpefHLButGqp1FZz-Vag1IzTp7EdI",
  authDomain: "llave-maestra-299ca.firebaseapp.com",
  databaseURL: "https://llave-maestra-299ca-default-rtdb.firebaseio.com",
  projectId: "llave-maestra-299ca",
  storageBucket: "llave-maestra-299ca.firebasestorage.app",
  messagingSenderId: "760359671653",
  appId: "1:760359671653:web:752aebcfb017c50a15f38c",
}

const WA_ADMIN = "573005087122"
const SORTEO_NOMBRE = "Go Viaja Con Nosotros 2026"

function getDB() {
  const app = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG)
  return getDatabase(app)
}

function format(n: number) { return n.toString().padStart(4, "0") }

function PagoExitosoInner() {
  const params = useSearchParams()
  const orderReference = params.get("external_reference") ?? ""
  const status = params.get("collection_status") ?? params.get("status") ?? ""
  const paymentId = params.get("collection_id") ?? params.get("payment_id") ?? ""

  const [estado, setEstado] = useState<"cargando" | "exitoso" | "fallido" | "error" | "ya_procesado">("cargando")
  const [nums, setNums] = useState<number[]>([])
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    if (!orderReference) { setEstado("error"); return }

    async function confirmar() {
      // Leer datos guardados en sessionStorage por number-selector
      const raw = sessionStorage.getItem(`mp_order_${orderReference}`)
      if (!raw) {
        // Si no hay sessionStorage (otra pestaña, otro dispositivo), mostrar error con soporte
        setEstado("error")
        return
      }

      const { nums: numeros, nombre: nombreCliente, cel, ciudad, pu } = JSON.parse(raw) as {
        nums: number[]; nombre: string; cel: string; ciudad: string; total: number; pu: number
      }

      setNombre(nombreCliente)
      setNums(numeros)

      if (status !== "approved") {
        setEstado("fallido")
        return
      }

      const db = getDB()
      const fecha = `${new Date().getDate().toString().padStart(2, "0")}/${(new Date().getMonth() + 1).toString().padStart(2, "0")}/${new Date().getFullYear()}`

      // Reservar cada número atómicamente con runTransaction
      const conflictos: number[] = []
      await Promise.all(
        numeros.map(async (n) => {
          const result = await runTransaction(ref(db, `sorteo/datos/${n}`), (current) => {
            if (current && current.estado === "P") return undefined
            return {
              estado: "P", nombre: nombreCliente, cel, ciudad,
              abono: pu, fechaPago: new Date().toISOString(),
              origen: "web", orderReference, paymentId,
            }
          })
          if (!result.committed) conflictos.push(n)
        })
      )

      // Actualizar banco y cliente
      const extras: Record<string, unknown> = {}
      numeros.filter(n => !conflictos.includes(n)).forEach((n) => {
        extras[`sorteo/banco/${n}`] = "P"
      })
      extras[`sorteo/clientes/${cel}`] = {
        nombre: nombreCliente, cel, ciudad,
        depto: "", dir: "", fechaRegistro: fecha,
        eventos: [{ evento: SORTEO_NOMBRE, fecha, nums: numeros }],
      }
      await update(ref(db), extras)

      // Limpiar sessionStorage
      sessionStorage.removeItem(`mp_order_${orderReference}`)

      // Enviar boleta por WhatsApp a cada número
      numeros.forEach((n) => {
        fetch("/api/enviar-boleta", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ numero: n, nombre: nombreCliente, cel, ciudad }),
        }).catch(() => {})
      })

      if (conflictos.length > 0) {
        const msg = encodeURIComponent(
          `⚠️ *CONFLICTO DE NÚMERO — ${SORTEO_NOMBRE}*\n\n` +
          `Números ya tomados: ${conflictos.map(format).join(", ")}\n` +
          `👤 ${nombreCliente}\n📞 ${cel}\n🔖 Ref: ${orderReference}\n\n` +
          `_Contactar para reasignar o reembolsar._`
        )
        setTimeout(() => { window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank") }, 500)
      }

      setEstado("exitoso")
    }

    confirmar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (estado === "cargando") return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground animate-pulse">Confirmando tu pago...</p>
    </main>
  )

  if (estado === "fallido") return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="text-5xl">❌</div>
      <h1 className="font-heading text-3xl font-semibold text-foreground">Pago no completado</h1>
      <p className="text-muted-foreground">Tu número no fue reservado. Puedes intentarlo de nuevo.</p>
      <a href="/#numeros" className="mt-4 rounded-full bg-gold px-6 py-3 font-semibold text-gold-foreground">
        Volver a intentar
      </a>
    </main>
  )

  if (estado === "error") return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="text-5xl">⚠️</div>
      <h1 className="font-heading text-3xl font-semibold text-foreground">Sesión no encontrada</h1>
      <p className="text-muted-foreground max-w-sm">
        Si completaste el pago, contáctanos con tu comprobante de Mercado Pago y te asignamos tu número.
      </p>
      <a href={`https://wa.me/${WA_ADMIN}`} className="mt-4 rounded-full bg-gold px-6 py-3 font-semibold text-gold-foreground">
        Contactar soporte
      </a>
    </main>
  )

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="text-6xl animate-bounce">🎉</div>
      <h1 className="font-heading text-4xl font-semibold text-foreground">
        ¡Listo, {nombre}!
      </h1>
      <p className="text-muted-foreground">Tu pago fue confirmado. Estos son tus números:</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {nums.map((n) => (
          <span key={n} className="font-heading text-3xl font-semibold text-gold tabular-nums">
            {format(n)}
          </span>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Te enviamos tu boleta por WhatsApp.</p>
      <a href="/" className="mt-2 rounded-full border border-gold/40 px-6 py-3 text-sm text-gold hover:bg-gold/10">
        Volver al inicio
      </a>
    </main>
  )
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Cargando...</p>
      </main>
    }>
      <PagoExitosoInner />
    </Suspense>
  )
}
