import { MercadoPagoConfig, Preference } from "mercadopago"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { orderReference, total, nombre, cel } = await req.json()
  if (!orderReference || !total || !nombre || !cel) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  const publicKey = process.env.MP_PUBLIC_KEY
  if (!accessToken || !publicKey) {
    return NextResponse.json({ error: "Credenciales MP no configuradas" }, { status: 500 })
  }

  const client = new MercadoPagoConfig({ accessToken })
  const preference = new Preference(client)

  const origin = req.headers.get("origin") ?? "https://viajaconnosotros.co"

  const result = await preference.create({
    body: {
      external_reference: orderReference,
      items: [
        {
          id: orderReference,
          title: "Boleta Go Viaja Con Nosotros 2026",
          quantity: 1,
          unit_price: total,
          currency_id: "COP",
        },
      ],
      payer: {
        name: nombre,
        phone: { number: cel },
      },
      back_urls: {
        success: `${origin}/pago-exitoso`,
        failure: `${origin}/pago-exitoso`,
        pending: `${origin}/pago-exitoso`,
      },
      auto_return: "approved",
      statement_descriptor: "GO VIAJA 2026",
    },
  })

  return NextResponse.json({
    preferenceId: result.id,
    publicKey,
  })
}
