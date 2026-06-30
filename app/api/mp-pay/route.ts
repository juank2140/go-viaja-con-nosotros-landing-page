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

  const isPSE = paymentMethodId === "pse"
  const isTicket = !token && !isPSE // Efecty y otros métodos en efectivo

  // Extraer celular del orderReference (formato GV-{cel}-{timestamp})
  const celMatch = orderReference?.match(/^GV-(\d+)-/)
  const cel = celMatch?.[1] ?? ""

  try {
    const paymentBody: any = {
      transaction_amount: Number(amount),
      description: description ?? "Boleta Go Viaja Con Nosotros 2026",
      payment_method_id: paymentMethodId,
      external_reference: orderReference,
      payer: {
        email: payer?.email ?? "cliente@goviaja.co",
        entity_type: payer?.entity_type ?? "individual",
        first_name: payer?.first_name ?? "Cliente",
        last_name: payer?.last_name ?? "Go Viaja",
        identification: payer?.identification,
        address: payer?.address ?? {
          zip_code: "11001",
          street_name: "Colombia",
          street_number: "1",
          neighborhood: "Centro",
          city: "Bogota",
          federal_unit: "DC",
        },
        phone: payer?.phone ?? {
          area_code: cel.slice(0, 3) || "300",
          number: cel.slice(3) || "0000000",
        },
      },
    }

    if (isPSE) {
      // PSE: redirección bancaria
      paymentBody.transaction_details = {
        financial_institution: String(body.financialInstitution),
      }
      paymentBody.callback_url = "https://viajaconnosotros.co/pago-exitoso"
      paymentBody.additional_info = {
        ip_address: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "127.0.0.1",
      }
    } else if (isTicket) {
      // Efecty y similares: sin token, sin installments
      paymentBody.additional_info = {
        ip_address: req.headers.get("x-forwarded-for") ?? "127.0.0.1",
      }
    } else {
      // Tarjeta débito/crédito y Wallet: requiere token
      paymentBody.token = token
      paymentBody.installments = Number(installments ?? 1)
    }

    const result = await payment.create({ body: paymentBody })

    return NextResponse.json({
      status: result.status,
      statusDetail: result.status_detail,
      id: result.id,
      orderReference,
      // Para PSE devuelve la URL del banco
      redirectUrl: (result as any).transaction_details?.external_resource_url ?? null,
    })
  } catch (err: any) {
    const cause = err?.cause ?? err?.error ?? err?.message ?? String(err)
    console.error("MP payment error full:", JSON.stringify(cause))
    return NextResponse.json({
      error: err?.message ?? "Error procesando pago",
      status: "error",
      mpError: cause,
    }, { status: 500 })
  }
}
