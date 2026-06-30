"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, runTransaction, update, get } from "firebase/database"

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

  const [estado, setEstado] = useState<"cargando" | "exitoso" | "fallido" | "error" | "conflicto">("cargando")
  const [nums, setNums] = useState<number[]>([])
  const [nombre, setNombre] = useState("")
  const [conflictoNums, setConflictoNums] = useState<number[]>([])
  const [conflictoWa, setConflictoWa] = useState("")

  useEffect(() => {
    if (!orderReference) { setEstado("error"); return }

    async function confirmar() {
      // Leer datos guardados en sessionStorage por number-selector
      let raw = localStorage.getItem(`mp_order_${orderReference}`)
      if (!raw) {
        // Fallback: leer de Firebase (cubre PSE que abre app del banco)
        const db = getDB()
        const snap = await get(ref(db, `sorteo/pendientes/${orderReference.replace(/\./g, "_")}`))
        if (snap.exists()) {
          raw = JSON.stringify(snap.val())
        } else {
          setEstado("error")
          return
        }
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
      localStorage.removeItem(`mp_order_${orderReference}`)
      update(ref(db), { [`sorteo/pendientes/${orderReference.replace(/\./g, "_")}`]: null })

      if (conflictos.length > 0) {
        const waMsg = encodeURIComponent(
          `⚠️ Hola, soy ${nombreCliente} y acabo de pagar pero los números ${conflictos.map(format).join(", ")} ya estaban tomados.\n` +
          `📞 ${cel}\n🔖 Ref: ${orderReference}\n\n_Necesito ayuda para que me reasignen o me reembolsen._`
        )
        setConflictoNums(conflictos)
        setConflictoWa(waMsg)
        setEstado("conflicto")
        return
      }

      const total = numeros.length * pu
      if (typeof window !== "undefined" && (window as any).fbq) {
        ;(window as any).fbq("track", "Purchase", { value: total, currency: "COP", num_items: numeros.length, content_type: "product" })
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

  if (estado === "conflicto") return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-5 bg-background px-4 text-center">
      <div className="text-6xl">😔</div>
      <h1 className="font-heading text-3xl font-semibold text-foreground">Tu pago fue recibido</h1>
      <p className="text-muted-foreground max-w-sm">
        Sin embargo, {conflictoNums.length === 1 ? "el número" : "los números"}{" "}
        <span className="text-gold font-semibold">{conflictoNums.map(format).join(", ")}</span>{" "}
        {conflictoNums.length === 1 ? "fue tomado" : "fueron tomados"} por otra persona en el mismo instante.
      </p>
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-left max-w-sm w-full">
        <p className="text-sm font-semibold text-amber-400 mb-1">¿Qué pasa ahora?</p>
        <p className="text-sm text-muted-foreground">
          Tu dinero está seguro. Escríbenos por WhatsApp y te ayudamos a{" "}
          <span className="text-white font-medium">reasignarte un número diferente o hacer el reembolso</span>.
        </p>
      </div>
      <a
        href={`https://wa.me/${WA_ADMIN}?text=${conflictoWa}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-white w-full max-w-sm"
        style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.524 5.855L.057 23.203a.75.75 0 0 0 .916.916l5.348-1.467A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.722 9.722 0 0 1-4.964-1.362l-.356-.211-3.695 1.013 1.013-3.695-.211-.356A9.722 9.722 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        Contactar soporte por WhatsApp
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

  const numsStr = nums.map(format).join(", ")
  const waText = encodeURIComponent(`Hola, soy ${nombre} y compré ${nums.length === 1 ? "la boleta" : "las boletas"} ${numsStr}`)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="text-6xl animate-bounce">🎉</div>
      <h1 className="font-heading text-4xl font-semibold text-foreground">
        ¡Pago confirmado, {nombre}!
      </h1>
      <p className="text-muted-foreground">Tu compra fue procesada exitosamente.</p>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {nums.length === 1 ? "Tu número" : "Tus números"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {nums.map((n) => (
            <span key={n} className="font-heading text-3xl font-semibold text-gold tabular-nums">
              {format(n)}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 text-left max-w-sm w-full">
        <p className="text-sm font-semibold text-amber-400 mb-1">⚠️ Paso obligatorio para recibir tu boleta</p>
        <p className="text-sm text-muted-foreground">
          Tu boleta oficial <span className="text-white font-medium">solo se envía por WhatsApp</span>. Debes tocar el botón de abajo — sin ese paso no podemos enviarte la boleta.
        </p>
      </div>
      <a
        href={`https://wa.me/${WA_ADMIN}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full px-8 py-4 font-semibold text-white w-full max-w-sm"
        style={{ background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", boxShadow: "0 8px 32px rgba(37,211,102,0.35)" }}
      >
        <svg viewBox="0 0 24 24" className="size-5 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.524 5.855L.057 23.203a.75.75 0 0 0 .916.916l5.348-1.467A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.722 9.722 0 0 1-4.964-1.362l-.356-.211-3.695 1.013 1.013-3.695-.211-.356A9.722 9.722 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
        Recibir mi boleta por WhatsApp
      </a>
      <p className="text-xs text-muted-foreground -mt-3">El mensaje ya está escrito — solo toca Enviar</p>
      <a href="/" className="rounded-full border border-white/20 px-6 py-3 text-sm text-muted-foreground hover:bg-white/5">
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
