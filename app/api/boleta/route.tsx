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
        {/* Número — centrado en recuadro dorado (X:440-879, Y:320-430) */}
        <div style={{
          position: "absolute",
          top: 349,
          left: 440,
          width: 439,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 52,
          fontWeight: 900,
          color: "#8B6914",
        }}>
          {numStr}
        </div>
        {/* Nombre — row 1 (zona y=1065-1121, center=1093) */}
        <div style={{ position: "absolute", top: 1082, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {nombre}
        </div>
        {/* Celular — row 2 (zona y=1121-1177, center=1149) */}
        <div style={{ position: "absolute", top: 1138, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {cel}
        </div>
        {/* Ciudad — row 3 (zona y=1177-1233, center=1205) */}
        <div style={{ position: "absolute", top: 1194, left: 245, fontSize: 21, fontWeight: 700, color: "#1A1208" }}>
          {ciudad}
        </div>
      </div>
    ),
    { width: 941, height: 1672 }
  )
}
