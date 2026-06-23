import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

// Dynamic OG link-preview image. 1200x630 is the canonical OG size used by
// WhatsApp / Twitter / Facebook / LinkedIn. This file lives at the route
// root so it covers the homepage — add another `opengraph-image.tsx` inside
// any subroute to override it.
//
// Runs on the Node.js runtime (not edge) so we can read the brand PNG from
// disk and inline it as base64. Inlining keeps the OG image self-contained
// and free of network dependencies at render time.

export const alt = "Lunga — Marque com qualquer médico, em qualquer clínica";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const logoBuf = await fs.readFile(
    path.join(process.cwd(), "public/brand/logo-full.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuf.toString("base64")}`;

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
            padding: "44px 64px 0 64px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="lunga"
            width={320}
            height={122}
            style={{ width: 320, height: 122, objectFit: "contain" }}
          />
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "24px 64px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 80,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            <span>Marque com&nbsp;</span>
            <span style={{ color: "#2F74C4" }}>qualquer médico</span>
            <span>,&nbsp;em qualquer clínica.</span>
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
            <span style={{ display: "flex", overflow: "hidden", borderRadius: 4 }}>
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
