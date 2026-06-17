import { createHash } from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { orderReference, amountInCents } = await req.json()

  if (!orderReference || !amountInCents) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const secretKey = process.env.BOLD_SECRET_KEY
  const apiKey = process.env.BOLD_API_KEY

  if (!secretKey || !apiKey) {
    return NextResponse.json({ error: "Llaves de Bold no configuradas" }, { status: 500 })
  }

  // Firma requerida por Bold: SHA256(amount_in_cents + currency + order_reference + secret_key)
  const raw = `${amountInCents}COP${orderReference}${secretKey}`
  const integritySignature = createHash("sha256").update(raw).digest("hex")

  return NextResponse.json({ integritySignature, apiKey, orderReference, amountInCents })
}
