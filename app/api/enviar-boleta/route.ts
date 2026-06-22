import { NextRequest, NextResponse } from "next/server"

const WASENDER_TOKEN = process.env.WASENDER_TOKEN!
const IMGBB_KEY = process.env.IMGBB_KEY!
const WA_URL = "https://www.wasenderapi.com/api/send-message"

export async function POST(req: NextRequest) {
  const { numero, nombre, cel, ciudad } = await req.json()

  const numStr = String(numero).padStart(4, "0")

  let celLimpio = cel.replace(/\D/g, "")
  if (celLimpio.length === 10) celLimpio = "57" + celLimpio
  if (celLimpio.length !== 12) {
    return NextResponse.json({ error: "Celular inválido" }, { status: 400 })
  }
  const to = "+" + celLimpio

  const headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + WASENDER_TOKEN,
  }

  // 1. Mensaje de texto
  const texto =
    `🌍 *¡Hola ${nombre}!*\n\n` +
    `Tu boleta está confirmada y ya eres parte de *Go Viaja Con Nosotros* 🎫\n` +
    `*Tu número: ${numStr}*\n\n` +
    `De todos los que quisieron participar, tú lo hiciste — y eso ya te pone un paso adelante. ` +
    `Cada boleta tiene exactamente las mismas posibilidades, y la tuya está en el juego.\n\n` +
    `✈️ Un viaje a *Cancún* o a *Cartagena* puede ser tuyo el *15 de agosto*. ` +
    `Guarda tu boleta, ese número puede cambiar tu historia.\n\n` +
    `¡Mucha suerte! 🍀 _Go Viaja Con Nosotros_`

  await fetch(WA_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ to, text: texto }),
  })

  // 2. Generar boleta PNG desde /api/boleta
  const origin = new URL(req.url).origin
  const boletaUrl = `${origin}/api/boleta?n=${numero}&nombre=${encodeURIComponent(nombre)}&cel=${encodeURIComponent(celLimpio)}&ciudad=${encodeURIComponent(ciudad)}`
  const boletaRes = await fetch(boletaUrl)
  if (!boletaRes.ok) {
    return NextResponse.json({ error: "Error generando boleta" }, { status: 500 })
  }
  const pngBuffer = await boletaRes.arrayBuffer()
  const base64 = Buffer.from(pngBuffer).toString("base64")

  // 3. Subir imagen a ImgBB
  const form = new FormData()
  form.append("image", base64)
  form.append("name", `boleta-${numStr}`)
  const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
    method: "POST",
    body: form,
  })
  const imgJson = await imgRes.json()
  if (!imgJson.success) {
    return NextResponse.json({ error: "ImgBB falló", detail: imgJson }, { status: 500 })
  }
  const imageUrl: string = imgJson.data.image?.url ?? imgJson.data.display_url ?? imgJson.data.url

  // 4. Enviar imagen por WhatsApp
  await fetch(WA_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      to,
      imageUrl,
      text: `🎫 Boleta #${numStr} — Go Viaja Con Nosotros`,
    }),
  })

  return NextResponse.json({ ok: true, imageUrl })
}
