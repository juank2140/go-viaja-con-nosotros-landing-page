import { initializeApp, getApps } from "firebase/app"
import { getDatabase, ref, set, push, onDisconnect, serverTimestamp } from "firebase/database"

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

function getSessionId(): string {
  let id = sessionStorage.getItem("_live_sid")
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem("_live_sid", id)
  }
  return id
}

export type LiveStatus = "visitando" | "seleccionando" | "checkout" | "comprado"

export interface LiveSession {
  sid: string
  status: LiveStatus
  lastSeen: number | object
  nums?: number[]
  total?: number
  nombre?: string
  ciudad?: string
}

let heartbeatInterval: ReturnType<typeof setInterval> | null = null

export async function liveInit() {
  const db = getDB()
  const sid = getSessionId()
  const sessionRef = ref(db, `live/sessions/${sid}`)

  const data: LiveSession = {
    sid,
    status: "visitando",
    lastSeen: serverTimestamp(),
  }

  await set(sessionRef, data)

  // Borrar sesión al cerrar pestaña
  onDisconnect(sessionRef).remove()

  // Heartbeat cada 30s para mantener presencia
  if (heartbeatInterval) clearInterval(heartbeatInterval)
  heartbeatInterval = setInterval(() => {
    set(ref(db, `live/sessions/${sid}/lastSeen`), serverTimestamp()).catch(() => {})
  }, 30_000)
}

export async function liveUpdate(status: LiveStatus, extra?: Partial<LiveSession>) {
  const db = getDB()
  const sid = getSessionId()
  await set(ref(db, `live/sessions/${sid}`), {
    sid,
    status,
    lastSeen: serverTimestamp(),
    ...extra,
  })
}

export async function liveEvent(type: string, data: Record<string, unknown> = {}) {
  const db = getDB()
  const sid = getSessionId()
  await push(ref(db, "live/events"), {
    type,
    sid,
    ts: serverTimestamp(),
    ...data,
  })
}
