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
        <img
          src={`${origin}/ticket.png`}
          style={{ position: "absolute", top: 0, left: 0, width: 941, height: 1672 }}
        />
        {/* Número — dentro del recuadro dorado "NÚMERO DE BOLETA" */}
        <div style={{
          position: "absolute",
          top: 338,
          left: 450,
          width: 460,
          display: "flex",
          justifyContent: "center",
          fontSize: 52,
          fontWeight: 900,
          color: "#8B6914",
        }}>
          {numStr}
        </div>
        {/* Nombre */}
        <div style={{ position: "absolute", top: 1100, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {nombre}
        </div>
        {/* Celular */}
        <div style={{ position: "absolute", top: 1152, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {cel}
        </div>
        {/* Ciudad */}
        <div style={{ position: "absolute", top: 1204, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {ciudad}
        </div>
      </div>
    ),
    { width: 941, height: 1672 }
  )
}
