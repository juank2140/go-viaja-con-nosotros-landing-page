import { MercadoPagoConfig, Payment } from "mercadopago"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, paymentMethodId, installments, payer, amount, orderReference, description } = body

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN no configurado" }, { status: 500 })
  }

  const client = new MercadoPagoConfig({ accessToken })
  const payment = new Payment(client)

  try {
    const result = await payment.create({
      body: {
        transaction_amount: Number(amount),
        token,
        description: description ?? "Boleta Go Viaja Con Nosotros 2026",
        installments: Number(installments ?? 1),
        payment_method_id: paymentMethodId,
        external_reference: orderReference,
        payer: {
          email: payer?.email ?? "cliente@goviaja.co",
          identification: payer?.identification,
        },
      },
    })

    return NextResponse.json({
      status: result.status,
      statusDetail: result.status_detail,
      id: result.id,
      orderReference,
    })
  } catch (err: any) {
    console.error("MP payment error:", err)
    return NextResponse.json({
      error: err?.message ?? "Error procesando pago",
      status: "error",
    }, { status: 500 })
  }
}
