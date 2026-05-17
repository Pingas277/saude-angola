import { ImageResponse } from "next/og";

// Dynamic OG link-preview image rendered at the edge.
// 1200x630 is the canonical OG size used by WhatsApp / Twitter / Facebook /
// LinkedIn. This file lives at the route root so it covers the homepage —
// add another `opengraph-image.tsx` inside any subroute to override it.

export const runtime = "edge";
export const alt = "ANGOLASAUDE — Marque com qualquer médico, em qualquer clínica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #eef2ff 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Thin brand accent bar */}
        <div style={{ display: "flex", height: 8 }}>
          <div style={{ flex: 1, background: "#2F74C4" }} />
        </div>

        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "52px 64px 0 64px",
          }}
        >
          {/* pulse mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, height: 56 }}>
            <div style={{ width: 11, height: 30, borderRadius: 6, background: "#E08A4B" }} />
            <div style={{ width: 11, height: 56, borderRadius: 6, background: "#2F74C4" }} />
            <div style={{ width: 11, height: 38, borderRadius: 6, background: "#E08A4B" }} />
            <div style={{ width: 11, height: 50, borderRadius: 6, background: "#F0B43C" }} />
            <div style={{ width: 11, height: 26, borderRadius: 6, background: "#2F74C4" }} />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}
          >
            <span
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: 2,
              }}
            >
              ANGOLASAUDE
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#2F74C4",
                letterSpacing: 3,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              Saúde para todos
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "40px 64px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            Marque com{" "}
            <span style={{ color: "#2F74C4" }}>qualquer médico</span>, em qualquer
            clínica.
          </div>

          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              color: "#475569",
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            A primeira plataforma que junta médicos e clínicas privadas em
            Angola num só sítio.
          </div>
        </div>

        {/* Footer chips */}
        <div
          style={{
            display: "flex",
            gap: 14,
            padding: "0 64px 40px 64px",
            fontSize: 18,
            color: "#475569",
            alignItems: "center",
          }}
        >
          <Chip>Multicaixa Express</Chip>
          <Chip>Receita com QR</Chip>
          <Chip>RGPD-compatível</Chip>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ display: "inline-flex", overflow: "hidden", borderRadius: 4 }}>
              <span style={{ width: 12, height: 16, background: "#CD1126" }} />
              <span style={{ width: 12, height: 16, background: "#000000" }} />
              <span style={{ width: 12, height: 16, background: "#FCD116" }} />
            </span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Feito em Angola</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "white",
        border: "1px solid #dbeafe",
        borderRadius: 999,
        padding: "10px 18px",
        fontWeight: 600,
        color: "#0f172a",
      }}
    >
      {children}
    </div>
  );
}
