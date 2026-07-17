"use client"

import { useEffect, useState } from "react"
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

function getFirebaseDB() {
  const app = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG)
  return getDatabase(app)
}

const WA_LINK = "https://wa.me/573024119895?text=Hola%2C%20quiero%20apartar%20mi%20n%C3%BAmero%20para%20el%20viaje%20a%20Canc%C3%BAn%20%F0%9F%8C%B4"
const BASE_VENDIDOS = 847
const TOTAL = 10000

type NumEstado = "L" | "A" | "P"

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-white flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.122 1.524 5.855L.057 23.203a.75.75 0 0 0 .916.916l5.348-1.467A11.946 11.946 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.722 9.722 0 0 1-4.964-1.362l-.356-.211-3.695 1.013 1.013-3.695-.211-.356A9.722 9.722 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
    </svg>
  )
}

export function NumberSelector() {
  const [vendidosFirebase, setVendidosFirebase] = useState(0)

  useEffect(() => {
    const db = getFirebaseDB()
    const unsub = onValue(ref(db, "sorteo/datos"), (snap) => {
      const data = snap.val() || {}
      let count = 0
      Object.values(data).forEach((d: any) => {
        if (d?.estado === "P" || d?.estado === "A") count++
      })
      setVendidosFirebase(count)
    })
    return () => unsub()
  }, [])

  const vendidos = BASE_VENDIDOS + vendidosFirebase
  const disponibles = Math.max(0, TOTAL - vendidos)

  return (
    <section id="numeros" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-gold">
          Elige tu suerte
        </span>
        <h2 className="mt-3 font-heading text-balance text-4xl font-semibold text-foreground sm:text-5xl md:text-6xl">
          Aparta tu número
        </h2>
        <p className="mt-4 text-muted-foreground">
          Escríbenos y te mostramos los números disponibles al instante.
        </p>

        {/* Contadores informativos */}
        <div className="mt-10 grid grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-5">
            <p className="font-heading text-3xl font-semibold text-available tabular-nums">
              {disponibles.toLocaleString("es-CO")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Disponibles</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="font-heading text-3xl font-semibold text-sold tabular-nums">
              {vendidos.toLocaleString("es-CO")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Vendidos</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="font-heading text-2xl font-semibold text-gold">$25.000</p>
            <p className="mt-1 text-xs text-muted-foreground">Por boleta</p>
          </div>
        </div>

        {/* Botón CTA */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-3 w-full h-16 rounded-full font-semibold text-lg text-white transition-all hover:scale-[1.02] hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            boxShadow: "0 8px 32px rgba(37,211,102,0.35)",
          }}
        >
          <WAIcon />
          Aparta tu número por WhatsApp
        </a>
        <p className="mt-3 text-sm text-muted-foreground">
          Te atendemos al instante y te guiamos con el pago
        </p>
      </div>
    </section>
  )
}
