import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const numero = searchParams.get("n") ?? "0000"
  const nombre = searchParams.get("nombre") ?? "—"
  const cel = searchParams.get("cel") ?? "—"
  const ciudad = searchParams.get("ciudad") ?? "—"
  const numStr = String(numero).padStart(4, "0")

  return new ImageResponse(
    (
      <div style={{ position: "relative", width: 941, height: 1672, display: "flex" }}>
        {/* Fondo del ticket */}
        <img
          src={`${origin}/ticket.png`}
          style={{ position: "absolute", top: 0, left: 0, width: 941, height: 1672 }}
        />
        {/* Número */}
        <div
          style={{
            position: "absolute",
            top: 310,
            left: 300,
            width: 680,
            display: "flex",
            justifyContent: "center",
            fontSize: 58,
            fontWeight: 900,
            color: "#5a3e00",
            letterSpacing: 6,
          }}
        >
          {numStr}
        </div>
        {/* Nombre */}
        <div style={{ position: "absolute", top: 1086, left: 245, fontSize: 22, fontWeight: 700, color: "#1A1208" }}>
          {nombre}
        </div>
        {/* Celular */}
        <div style={{ position: "absolute", top: 1136, left: 245, fontSize: 22, fontWeight: 700, color: "#1A1208" }}>
          {cel}
        </div>
        {/* Ciudad */}
        <div style={{ position: "absolute", top: 1186, left: 245, fontSize: 22, fontWeight: 700, color: "#1A1208" }}>
          {ciudad}
        </div>
      </div>
    ),
    { width: 941, height: 1672 }
  )
}
