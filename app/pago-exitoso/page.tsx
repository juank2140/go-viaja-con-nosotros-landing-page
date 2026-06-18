"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, get, update } from "firebase/database"

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
  const ref_code = params.get("ref") ?? ""
  const bold_status = params.get("bold-order-status") ?? ""

  const [estado, setEstado] = useState<"cargando" | "exitoso" | "fallido" | "error">("cargando")
  const [nums, setNums] = useState<number[]>([])
  const [nombre, setNombre] = useState("")

  useEffect(() => {
    if (!ref_code) { setEstado("error"); return }

    async function confirmar() {
      const db = getDB()
      const snap = await get(ref(db, `sorteo/pendientes/${ref_code}`))
      if (!snap.exists()) { setEstado("error"); return }

      const data = snap.val()
      const numeros: number[] = data.nums
      const cel: string = data.cel
      const nombreCliente: string = data.nombre
      const ciudad: string = data.ciudad
      const total: number = data.total
      const fecha: string = data.fecha

      setNombre(nombreCliente)
      setNums(numeros)

      if (bold_status !== "approved") {
        const rollback: Record<string, unknown> = {}
        numeros.forEach((n) => { rollback[`sorteo/datos/${n}/estado`] = "L" })
        await update(ref(db), rollback)
        setEstado("fallido")
        return
      }

      const pu = numeros.length >= 2 ? 20000 : 25000
      const updates: Record<string, unknown> = {}
      numeros.forEach((n) => {
        updates[`sorteo/banco/${n}`] = "P"
        updates[`sorteo/datos/${n}`] = {
          estado: "P", nombre: nombreCliente, cel, ciudad,
          abono: pu, fechaPago: new Date().toISOString(),
          origen: "web", orderReference: ref_code,
        }
      })
      updates[`sorteo/clientes/${cel}`] = {
        nombre: nombreCliente, cel, ciudad,
        depto: "", dir: "", fechaRegistro: fecha,
        eventos: [{ evento: SORTEO_NOMBRE, fecha, nums: numeros }],
      }
      updates[`sorteo/pendientes/${ref_code}`] = null

      await update(ref(db), updates)

      const numerosStr = numeros.map(format).join(", ")
      const totalStr = "$" + total.toLocaleString("es-CO")
      const msg = encodeURIComponent(
        `✅ *PAGO CONFIRMADO — ${SORTEO_NOMBRE}*\n\n` +
        `🎟 Número${numeros.length > 1 ? "s" : ""}: *${numerosStr}*\n` +
        `👤 ${nombreCliente}\n📞 ${cel}\n📍 ${ciudad}\n` +
        `💰 ${totalStr}\n🔖 Ref: ${ref_code}\n\n_Pago confirmado por Bold_`
      )
      setTimeout(() => { window.open(`https://wa.me/${WA_ADMIN}?text=${msg}`, "_blank") }, 1000)

      setEstado("exitoso")
    }

    confirmar()
  }, [ref_code, bold_status])

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
      <h1 className="font-heading text-3xl font-semibold text-foreground">Referencia no encontrada</h1>
      <p className="text-muted-foreground">Contacta al administrador con tu comprobante de Bold.</p>
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
