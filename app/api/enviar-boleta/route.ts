import { NextRequest, NextResponse } from "next/server"

export const maxDuration = 60

const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID!
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN!
const TWILIO_FROM  = process.env.TWILIO_WA_FROM!  // whatsapp:+14155238886

export async function POST(req: NextRequest) {
  const { numero, nombre, cel, ciudad } = await req.json()

  const numStr = String(numero).padStart(4, "0")

  let celLimpio = cel.replace(/\D/g, "")
  if (celLimpio.length === 10) celLimpio = "57" + celLimpio
  if (celLimpio.length !== 12) {
    return NextResponse.json({ error: "Celular inválido" }, { status: 400 })
  }
  const to = `whatsapp:+${celLimpio}`

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`
  const auth = "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")

  async function twilioSend(params: Record<string, string>) {
    const body = new URLSearchParams({ From: TWILIO_FROM, To: to, ...params })
    const res = await fetch(twilioUrl, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
    const json = await res.json()
    console.log("Twilio response:", JSON.stringify(json))
    return json
  }

  // 1. Mensaje de texto
  const texto =
    `🌍 *¡Hola ${nombre}!*\n\n` +
    `Tu boleta está confirmada y ya eres parte de *Go Viaja Con Nosotros* 🎫\n` +
    `*Tu número: ${numStr}*\n\n` +
    `De todos los que quisieron participar, tú lo hiciste — y eso ya te pone un paso adelante. ` +
    `Cada boleta tiene exactamente las mismas posibilidades, y la tuya está en el juego.\n\n` +
    `✈️ Un viaje a *Cancún* o a *Cartagena* puede ser tuyo. ` +
    `Guarda tu boleta, ese número puede cambiar tu historia.\n\n` +
    `¡Mucha suerte! 🍀 _Go Viaja Con Nosotros_`

  await twilioSend({ Body: texto })

  // 2. Imagen de la boleta — Twilio la descarga directamente desde la URL pública
  const origin = "https://viajaconnosotros.co"
  const boletaUrl = `${origin}/api/boleta?n=${numero}&nombre=${encodeURIComponent(nombre)}&cel=${encodeURIComponent(celLimpio)}&ciudad=${encodeURIComponent(ciudad)}`

  await twilioSend({
    MediaUrl: boletaUrl,
    Body: `🎫 Boleta #${numStr} — Go Viaja Con Nosotros`,
  })

  return NextResponse.json({ ok: true })
}
