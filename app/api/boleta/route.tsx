import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url)
  const numero = searchParams.get("n") ?? "0000"
  const nombre = searchParams.get("nombre") ?? "—"
  const cel = searchParams.get("cel") ?? "—"
  const ciudad = searchParams.get("ciudad") ?? "—"
  const numStr = String(numero).padStart(4, "0")

  const W = 470
  const H = 836
  return new ImageResponse(
    (
      <div style={{ position: "relative", width: W, height: H, display: "flex" }}>
        <img src={`${origin}/ticket.png`} style={{ position: "absolute", top: 0, left: 0, width: W, height: H }} />
        <div style={{
          position: "absolute", top: 155, left: 150, width: 340,
          display: "flex", justifyContent: "center",
          fontSize: 29, fontWeight: 900, color: "#5a3e00", letterSpacing: 3,
        }}>{numStr}</div>
        <div style={{ position: "absolute", top: 543, left: 122, fontSize: 11, fontWeight: 700, color: "#1A1208" }}>{nombre}</div>
        <div style={{ position: "absolute", top: 568, left: 122, fontSize: 11, fontWeight: 700, color: "#1A1208" }}>{cel}</div>
        <div style={{ position: "absolute", top: 593, left: 122, fontSize: 11, fontWeight: 700, color: "#1A1208" }}>{ciudad}</div>
      </div>
    ),
    { width: W, height: H }
  )
}
